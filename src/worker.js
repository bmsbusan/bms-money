// 현장 청구/입금 체크 웹앱 - Cloudflare Worker (API + 정적 파일 서빙)
//
// 구조
//  - /api/ 로 시작하는 요청 -> 아래 라우팅 로직에서 직접 처리 (D1 데이터베이스 사용)
//  - 그 외 요청(정적 파일)      -> env.ASSETS.fetch(request) 로 public 폴더 파일을 그대로 서빙
//
// 인증
//  - 회원가입/개별 계정 없이, 배포 시 설정한 공통 비밀번호(APP_PASSWORD) 하나로 로그인합니다.
//  - 로그인 성공 시 서버가 서명(HMAC)된 세션 쿠키를 발급하고, 이후 모든 /api/records, /api/sites
//    요청은 이 쿠키가 유효할 때만 처리됩니다.

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30일

// 내역 구분 (탭) 종류
const ALLOWED_CATEGORIES = ["작업내역", "소독", "저수조청소"];
const DEFAULT_CATEGORY = "작업내역";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

function unauthorized() {
  return json({ error: "인증이 필요합니다." }, { status: 401 });
}

// ---- 세션 쿠키 서명/검증 (Web Crypto HMAC-SHA256) ----

async function hmac(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const bytes = new Uint8Array(sig);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createSessionValue(secret) {
  const expires = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = String(expires);
  const sig = await hmac(payload, secret);
  return `${payload}.${sig}`;
}

async function isValidSession(request, secret) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return false;
  let value;
  try {
    value = decodeURIComponent(match[1]);
  } catch {
    return false;
  }
  const dot = value.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = await hmac(payload, secret);
  if (expected !== sig) return false;
  if (!/^\d+$/.test(payload)) return false;
  if (Date.now() > Number(payload)) return false;
  return true;
}

function setSessionCookieHeader(value) {
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_SEC}`;
}

function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

// ---- 유틸 ----

function toBool(v) {
  return v === true || v === 1 || v === "1" || v === "true";
}

function rowToRecord(row) {
  return {
    id: row.id,
    site_name: row.site_name,
    work_date: row.work_date || null,
    content: row.content || "",
    cost: row.cost,
    billed: !!row.billed,
    paid: !!row.paid,
    paid_date: row.paid_date || null,
    bank_account: row.bank_account || "",
    category: row.category || DEFAULT_CATEGORY,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// ---- 라우트 핸들러 ----

async function handleLogin(request, env) {
  const body = await readJson(request);
  const password = body && typeof body.password === "string" ? body.password : "";
  if (!env.APP_PASSWORD) {
    return json({ error: "서버에 APP_PASSWORD 시크릿이 설정되어 있지 않습니다." }, { status: 500 });
  }
  if (password !== env.APP_PASSWORD) {
    return json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const value = await createSessionValue(env.APP_PASSWORD);
  return json({ ok: true }, { headers: { "Set-Cookie": setSessionCookieHeader(value) } });
}

async function handleLogout() {
  return json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookieHeader() } });
}

async function handleMe(request, env) {
  const authed = await isValidSession(request, env.APP_PASSWORD || "");
  return json({ authenticated: authed });
}

async function handleGetSites(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, sort_order FROM sites ORDER BY sort_order ASC, id ASC"
  ).all();
  return json({ sites: results });
}

async function handleCreateSite(request, env) {
  const body = await readJson(request);
  const name = body && typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return badRequest("현장명을 입력해주세요.");
  const maxRow = await env.DB.prepare(
    "SELECT COALESCE(MAX(sort_order), 0) AS m FROM sites"
  ).first();
  const nextOrder = (maxRow?.m || 0) + 1;
  try {
    await env.DB.prepare("INSERT INTO sites (name, sort_order) VALUES (?, ?)")
      .bind(name, nextOrder)
      .run();
  } catch (e) {
    return badRequest("이미 존재하는 현장명이거나 저장 중 오류가 발생했습니다.");
  }
  return json({ ok: true });
}

async function handleDeleteSite(id, env) {
  await env.DB.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

async function handleGetRecords(request, env) {
  const url = new URL(request.url);
  const site = url.searchParams.get("site") || "";
  const month = url.searchParams.get("month") || ""; // YYYY-MM
  const category = url.searchParams.get("category") || "";
  const keyword = url.searchParams.get("keyword") || "";

  let query = "SELECT * FROM records WHERE 1=1";
  const binds = [];
  if (category) {
    query += " AND category = ?";
    binds.push(category);
  }
  if (site) {
    query += " AND site_name = ?";
    binds.push(site);
  }
  if (month) {
    query += " AND strftime('%Y-%m', COALESCE(work_date, created_at)) = ?";
    binds.push(month);
  }
  if (keyword) {
    query += " AND (site_name LIKE ? OR content LIKE ?)";
    const k = `%${keyword}%`;
    binds.push(k, k);
  }
  // 키워드로 검색할 때는(작업내역 조회 페이지의 통합 검색) 입금 대기 우선 정렬 대신
  // 단순 최신순으로 보여주는 편이 자연스럽습니다.
  query += keyword
    ? " ORDER BY COALESCE(work_date, created_at) DESC, id DESC"
    : " ORDER BY paid ASC, COALESCE(work_date, created_at) DESC, id DESC";

  const stmt = env.DB.prepare(query).bind(...binds);
  const { results } = await stmt.all();
  return json({ records: results.map(rowToRecord) });
}

async function handleCreateRecord(request, env) {
  const body = await readJson(request);
  if (!body) return badRequest("요청 본문이 올바르지 않습니다.");
  const site_name = typeof body.site_name === "string" ? body.site_name.trim() : "";
  const work_date = typeof body.work_date === "string" && body.work_date ? body.work_date : null;
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const cost = Number.isFinite(Number(body.cost)) ? Math.round(Number(body.cost)) : 0;
  const billed = toBool(body.billed) ? 1 : 0;
  const paid = toBool(body.paid) ? 1 : 0;
  const paid_date = typeof body.paid_date === "string" && body.paid_date ? body.paid_date : null;
  const bank_account = typeof body.bank_account === "string" ? body.bank_account.trim() : "";
  const categoryRaw = typeof body.category === "string" ? body.category.trim() : "";
  const category = ALLOWED_CATEGORIES.includes(categoryRaw) ? categoryRaw : DEFAULT_CATEGORY;

  if (!site_name) return badRequest("현장명을 선택해주세요.");
  if (!work_date) return badRequest("작업 날짜를 선택해주세요.");

  const result = await env.DB.prepare(
    `INSERT INTO records (site_name, work_date, content, cost, billed, paid, paid_date, bank_account, category, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  )
    .bind(site_name, work_date, content, cost, billed, paid, paid_date, bank_account, category)
    .run();

  return json({ ok: true, id: result.meta.last_row_id });
}

async function handleUpdateRecord(id, request, env) {
  const body = await readJson(request);
  if (!body) return badRequest("요청 본문이 올바르지 않습니다.");

  const fields = [];
  const binds = [];

  if (typeof body.site_name === "string") {
    fields.push("site_name = ?");
    binds.push(body.site_name.trim());
  }
  if (body.work_date !== undefined) {
    fields.push("work_date = ?");
    binds.push(body.work_date || null);
  }
  if (typeof body.content === "string") {
    fields.push("content = ?");
    binds.push(body.content.trim());
  }
  if (body.cost !== undefined) {
    fields.push("cost = ?");
    binds.push(Number.isFinite(Number(body.cost)) ? Math.round(Number(body.cost)) : 0);
  }
  if (body.billed !== undefined) {
    fields.push("billed = ?");
    binds.push(toBool(body.billed) ? 1 : 0);
  }
  if (body.paid !== undefined) {
    fields.push("paid = ?");
    binds.push(toBool(body.paid) ? 1 : 0);
  }
  if (body.paid_date !== undefined) {
    fields.push("paid_date = ?");
    binds.push(body.paid_date || null);
  }
  if (typeof body.bank_account === "string") {
    fields.push("bank_account = ?");
    binds.push(body.bank_account.trim());
  }
  if (typeof body.category === "string" && ALLOWED_CATEGORIES.includes(body.category.trim())) {
    fields.push("category = ?");
    binds.push(body.category.trim());
  }

  if (fields.length === 0) return badRequest("수정할 내용이 없습니다.");

  fields.push("updated_at = datetime('now')");
  binds.push(id);

  await env.DB.prepare(`UPDATE records SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...binds)
    .run();

  return json({ ok: true });
}

async function handleDeleteRecord(id, env) {
  await env.DB.prepare("DELETE FROM records WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

// ---- 업무일지 (journal_entries) ----

function rowToJournal(row) {
  return {
    id: row.id,
    work_date: row.work_date,
    site_name: row.site_name,
    content: row.content || "",
    remarks: row.remarks || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function handleGetJournal(request, env) {
  const url = new URL(request.url);
  const site = url.searchParams.get("site") || "";
  const month = url.searchParams.get("month") || ""; // YYYY-MM
  const from = url.searchParams.get("from") || "";   // YYYY-MM-DD
  const to = url.searchParams.get("to") || "";        // YYYY-MM-DD
  const keyword = url.searchParams.get("keyword") || "";
  const sort = url.searchParams.get("sort") === "asc" ? "ASC" : "DESC";

  let query = "SELECT * FROM journal_entries WHERE 1=1";
  const binds = [];
  if (site) {
    query += " AND site_name = ?";
    binds.push(site);
  }
  if (month) {
    query += " AND strftime('%Y-%m', work_date) = ?";
    binds.push(month);
  }
  if (from) {
    query += " AND work_date >= ?";
    binds.push(from);
  }
  if (to) {
    query += " AND work_date <= ?";
    binds.push(to);
  }
  if (keyword) {
    query += " AND (site_name LIKE ? OR content LIKE ? OR remarks LIKE ?)";
    const k = `%${keyword}%`;
    binds.push(k, k, k);
  }
  query += ` ORDER BY work_date ${sort}, id ${sort}`;

  const stmt = env.DB.prepare(query).bind(...binds);
  const { results } = await stmt.all();
  return json({ entries: results.map(rowToJournal) });
}

async function handleCreateJournal(request, env) {
  const body = await readJson(request);
  if (!body) return badRequest("요청 본문이 올바르지 않습니다.");
  const site_name = typeof body.site_name === "string" ? body.site_name.trim() : "";
  const work_date = typeof body.work_date === "string" && body.work_date ? body.work_date : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const remarks = typeof body.remarks === "string" ? body.remarks.trim() : "";

  if (!site_name) return badRequest("현장명을 선택해주세요.");
  if (!work_date) return badRequest("작업 날짜를 선택해주세요.");

  const result = await env.DB.prepare(
    `INSERT INTO journal_entries (work_date, site_name, content, remarks, created_at, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
  )
    .bind(work_date, site_name, content, remarks)
    .run();

  return json({ ok: true, id: result.meta.last_row_id });
}

async function handleUpdateJournal(id, request, env) {
  const body = await readJson(request);
  if (!body) return badRequest("요청 본문이 올바르지 않습니다.");

  const fields = [];
  const binds = [];

  if (typeof body.site_name === "string") {
    fields.push("site_name = ?");
    binds.push(body.site_name.trim());
  }
  if (body.work_date !== undefined) {
    fields.push("work_date = ?");
    binds.push(body.work_date || "");
  }
  if (typeof body.content === "string") {
    fields.push("content = ?");
    binds.push(body.content.trim());
  }
  if (typeof body.remarks === "string") {
    fields.push("remarks = ?");
    binds.push(body.remarks.trim());
  }

  if (fields.length === 0) return badRequest("수정할 내용이 없습니다.");

  fields.push("updated_at = datetime('now')");
  binds.push(id);

  await env.DB.prepare(`UPDATE journal_entries SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...binds)
    .run();

  return json({ ok: true });
}

async function handleDeleteJournal(id, env) {
  await env.DB.prepare("DELETE FROM journal_entries WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

async function handleJournalSummary(env) {
  // 월 + 현장별 작업 건수 집계 (프론트에서 월별/연도별로 다시 묶어서 보여줍니다)
  const { results } = await env.DB.prepare(
    `SELECT
       strftime('%Y-%m', work_date) AS month,
       site_name,
       COUNT(*) AS count
     FROM journal_entries
     GROUP BY month, site_name
     ORDER BY month DESC, site_name ASC`
  ).all();
  return json({ rows: results });
}

// ---- 후속 작업 (followups) ----

function rowToFollowup(row) {
  return {
    id: row.id,
    site_name: row.site_name,
    content: row.content || "",
    due_date: row.due_date || null,
    status: !!row.status,
    remarks: row.remarks || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at || null,
  };
}

async function handleGetFollowups(request, env) {
  const url = new URL(request.url);
  const site = url.searchParams.get("site") || "";
  const status = url.searchParams.get("status") || ""; // "0" | "1" | ""
  const keyword = url.searchParams.get("keyword") || "";

  let query = "SELECT * FROM followups WHERE 1=1";
  const binds = [];
  if (site) {
    query += " AND site_name = ?";
    binds.push(site);
  }
  if (status === "0" || status === "1") {
    query += " AND status = ?";
    binds.push(Number(status));
  }
  if (keyword) {
    query += " AND (site_name LIKE ? OR content LIKE ? OR remarks LIKE ?)";
    const k = `%${keyword}%`;
    binds.push(k, k, k);
  }
  query += " ORDER BY status ASC, COALESCE(due_date, '9999-99-99') ASC, id DESC";

  const stmt = env.DB.prepare(query).bind(...binds);
  const { results } = await stmt.all();
  return json({ followups: results.map(rowToFollowup) });
}

async function handleCreateFollowup(request, env) {
  const body = await readJson(request);
  if (!body) return badRequest("요청 본문이 올바르지 않습니다.");
  const site_name = typeof body.site_name === "string" ? body.site_name.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const due_date = typeof body.due_date === "string" && body.due_date ? body.due_date : null;
  const remarks = typeof body.remarks === "string" ? body.remarks.trim() : "";
  const status = toBool(body.status) ? 1 : 0;

  if (!site_name) return badRequest("현장명을 선택해주세요.");
  if (!content) return badRequest("내용을 입력해주세요.");

  const result = await env.DB.prepare(
    `INSERT INTO followups (site_name, content, due_date, status, remarks, created_at, updated_at, completed_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)`
  )
    .bind(site_name, content, due_date, status, remarks, status ? new Date().toISOString() : null)
    .run();

  return json({ ok: true, id: result.meta.last_row_id });
}

async function handleUpdateFollowup(id, request, env) {
  const body = await readJson(request);
  if (!body) return badRequest("요청 본문이 올바르지 않습니다.");

  const fields = [];
  const binds = [];

  if (typeof body.site_name === "string") {
    fields.push("site_name = ?");
    binds.push(body.site_name.trim());
  }
  if (typeof body.content === "string") {
    fields.push("content = ?");
    binds.push(body.content.trim());
  }
  if (body.due_date !== undefined) {
    fields.push("due_date = ?");
    binds.push(body.due_date || null);
  }
  if (typeof body.remarks === "string") {
    fields.push("remarks = ?");
    binds.push(body.remarks.trim());
  }
  if (body.status !== undefined) {
    const statusVal = toBool(body.status) ? 1 : 0;
    fields.push("status = ?");
    binds.push(statusVal);
    fields.push("completed_at = ?");
    binds.push(statusVal ? "datetime('now')" : null);
  }

  if (fields.length === 0) return badRequest("수정할 내용이 없습니다.");

  // completed_at 은 SQL 함수(datetime('now'))를 그대로 써야 하는 특수 케이스라 별도 처리합니다.
  const setClauses = [];
  const finalBinds = [];
  for (let i = 0; i < fields.length; i++) {
    if (fields[i] === "completed_at = ?" && binds[i] === "datetime('now')") {
      setClauses.push("completed_at = datetime('now')");
    } else {
      setClauses.push(fields[i]);
      finalBinds.push(binds[i]);
    }
  }
  setClauses.push("updated_at = datetime('now')");
  finalBinds.push(id);

  await env.DB.prepare(`UPDATE followups SET ${setClauses.join(", ")} WHERE id = ?`)
    .bind(...finalBinds)
    .run();

  return json({ ok: true });
}

async function handleDeleteFollowup(id, env) {
  await env.DB.prepare("DELETE FROM followups WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

async function handleMonthlySummary(env) {
  // 월 + 현장별로 집계한 뒤, 프론트에서 월별 합계 / 현장별 상세로 다시 묶어서 보여줍니다.
  const { results } = await env.DB.prepare(
    `SELECT
       strftime('%Y-%m', COALESCE(work_date, created_at)) AS month,
       site_name,
       category,
       COUNT(*) AS count,
       SUM(cost) AS cost_total,
       SUM(CASE WHEN billed = 1 THEN cost ELSE 0 END) AS billed_total,
       SUM(CASE WHEN billed = 1 THEN 1 ELSE 0 END) AS billed_count,
       SUM(CASE WHEN paid = 1 THEN cost ELSE 0 END) AS paid_total,
       SUM(CASE WHEN paid = 1 THEN 1 ELSE 0 END) AS paid_count
     FROM records
     GROUP BY month, site_name, category
     ORDER BY month DESC, site_name ASC`
  ).all();
  return json({ rows: results });
}

// ---- 메인 fetch 핸들러 ----

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (!path.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    try {
      // 인증이 필요 없는 엔드포인트
      if (path === "/api/login" && method === "POST") {
        return await handleLogin(request, env);
      }
      if (path === "/api/logout" && method === "POST") {
        return await handleLogout();
      }
      if (path === "/api/me" && method === "GET") {
        return await handleMe(request, env);
      }

      // 이하 전부 인증 필요
      const authed = await isValidSession(request, env.APP_PASSWORD || "");
      if (!authed) return unauthorized();

      if (path === "/api/sites" && method === "GET") {
        return await handleGetSites(env);
      }
      if (path === "/api/sites" && method === "POST") {
        return await handleCreateSite(request, env);
      }
      const siteMatch = path.match(/^\/api\/sites\/(\d+)$/);
      if (siteMatch && method === "DELETE") {
        return await handleDeleteSite(Number(siteMatch[1]), env);
      }

      if (path === "/api/records" && method === "GET") {
        return await handleGetRecords(request, env);
      }
      if (path === "/api/records" && method === "POST") {
        return await handleCreateRecord(request, env);
      }
      const recordMatch = path.match(/^\/api\/records\/(\d+)$/);
      if (recordMatch && method === "PUT") {
        return await handleUpdateRecord(Number(recordMatch[1]), request, env);
      }
      if (recordMatch && method === "DELETE") {
        return await handleDeleteRecord(Number(recordMatch[1]), env);
      }

      if (path === "/api/monthly-summary" && method === "GET") {
        return await handleMonthlySummary(env);
      }

      if (path === "/api/journal" && method === "GET") {
        return await handleGetJournal(request, env);
      }
      if (path === "/api/journal" && method === "POST") {
        return await handleCreateJournal(request, env);
      }
      const journalMatch = path.match(/^\/api\/journal\/(\d+)$/);
      if (journalMatch && method === "PUT") {
        return await handleUpdateJournal(Number(journalMatch[1]), request, env);
      }
      if (journalMatch && method === "DELETE") {
        return await handleDeleteJournal(Number(journalMatch[1]), env);
      }
      if (path === "/api/journal-summary" && method === "GET") {
        return await handleJournalSummary(env);
      }

      if (path === "/api/followups" && method === "GET") {
        return await handleGetFollowups(request, env);
      }
      if (path === "/api/followups" && method === "POST") {
        return await handleCreateFollowup(request, env);
      }
      const followupMatch = path.match(/^\/api\/followups\/(\d+)$/);
      if (followupMatch && method === "PUT") {
        return await handleUpdateFollowup(Number(followupMatch[1]), request, env);
      }
      if (followupMatch && method === "DELETE") {
        return await handleDeleteFollowup(Number(followupMatch[1]), env);
      }

      return json({ error: "Not Found" }, { status: 404 });
    } catch (err) {
      return json({ error: "서버 오류: " + (err && err.message ? err.message : String(err)) }, { status: 500 });
    }
  },
};
