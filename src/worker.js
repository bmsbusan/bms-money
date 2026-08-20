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

  let query = "SELECT * FROM records WHERE 1=1";
  const binds = [];
  if (site) {
    query += " AND site_name = ?";
    binds.push(site);
  }
  if (month) {
    query += " AND strftime('%Y-%m', COALESCE(work_date, created_at)) = ?";
    binds.push(month);
  }
  query += " ORDER BY paid ASC, COALESCE(work_date, created_at) DESC, id DESC";

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

  if (!site_name) return badRequest("현장명을 선택해주세요.");
  if (!work_date) return badRequest("작업 날짜를 선택해주세요.");

  const result = await env.DB.prepare(
    `INSERT INTO records (site_name, work_date, content, cost, billed, paid, paid_date, bank_account, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  )
    .bind(site_name, work_date, content, cost, billed, paid, paid_date, bank_account)
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

async function handleMonthlySummary(env) {
  // 월 + 현장별로 집계한 뒤, 프론트에서 월별 합계 / 현장별 상세로 다시 묶어서 보여줍니다.
  const { results } = await env.DB.prepare(
    `SELECT
       strftime('%Y-%m', COALESCE(work_date, created_at)) AS month,
       site_name,
       COUNT(*) AS count,
       SUM(cost) AS cost_total,
       SUM(CASE WHEN billed = 1 THEN cost ELSE 0 END) AS billed_total,
       SUM(CASE WHEN billed = 1 THEN 1 ELSE 0 END) AS billed_count,
       SUM(CASE WHEN paid = 1 THEN cost ELSE 0 END) AS paid_total,
       SUM(CASE WHEN paid = 1 THEN 1 ELSE 0 END) AS paid_count
     FROM records
     GROUP BY month, site_name
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

      return json({ error: "Not Found" }, { status: 404 });
    } catch (err) {
      return json({ error: "서버 오류: " + (err && err.message ? err.message : String(err)) }, { status: 500 });
    }
  },
};
