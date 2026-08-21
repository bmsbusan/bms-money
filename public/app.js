(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // 입금 통장 목록 (고정)
  const BANK_ACCOUNTS = [
    "비엠에스코리아부산지사 통장 (부산 101-2094-3567-03)",
    "정우이엔지 통장 (부산 113-2020-6145-00)",
    "박은희 B통장 (부산 112-2254-7975-09)",
    "이영웅 B통장 (부산 112-2357-7881-04)",
  ];

  // 내역 구분 (탭) 종류 — 값은 서버(worker.js)의 ALLOWED_CATEGORIES 와 동일해야 합니다.
  const CATEGORIES = ["작업내역", "소독", "저수조청소"];

  const loginView = $("#loginView");
  const appView = $("#appView");
  const loginForm = $("#loginForm");
  const loginPassword = $("#loginPassword");
  const loginError = $("#loginError");
  const logoutBtn = $("#logoutBtn");
  const lastSyncEl = $("#lastSync");

  const filterSite = $("#filterSite");
  const filterMonth = $("#filterMonth");
  const filterResetBtn = $("#filterResetBtn");

  const addRecordBtn = $("#addRecordBtn");
  const addForm = $("#addForm");
  const newSite = $("#newSite");
  const newWorkDate = $("#newWorkDate");
  const newContent = $("#newContent");
  const newCost = $("#newCost");
  const newBilled = $("#newBilled");
  const newPaid = $("#newPaid");
  const newPaidDate = $("#newPaidDate");
  const newBankAccount = $("#newBankAccount");
  const saveNewBtn = $("#saveNewBtn");
  const cancelNewBtn = $("#cancelNewBtn");
  const addError = $("#addError");

  const tabBtns = $$(".tab-btn");
  const listSection = $("#listSection");
  const historyView = $("#historyView");
  const historyBody = $("#historyBody");
  const historyEmptyMsg = $("#historyEmptyMsg");
  const historyModeMonthBtn = $("#historyModeMonthBtn");
  const historyModeYearBtn = $("#historyModeYearBtn");
  const historyPeriodHeader = $("#historyPeriodHeader");
  const historyFilterCategory = $("#historyFilterCategory");
  const historyFilterSite = $("#historyFilterSite");

  const recordsBody = $("#recordsBody");
  const emptyMsg = $("#emptyMsg");
  const sortableHeaders = $$("#recordsTable thead th.sortable");

  const sumTotal = $("#sumTotal");
  const sumUnbilled = $("#sumUnbilled");
  const sumUnpaid = $("#sumUnpaid");
  const sumPaidCost = $("#sumPaidCost");

  const siteManageBtn = $("#siteManageBtn");
  const siteModal = $("#siteModal");
  const siteModalCloseBtn = $("#siteModalCloseBtn");
  const siteNewName = $("#siteNewName");
  const siteAddBtn = $("#siteAddBtn");
  const siteList = $("#siteList");
  const siteError = $("#siteError");

  let sites = [];
  let records = [];
  let editingId = null;
  let pollTimer = null;
  let activeTab = "작업내역"; // "작업내역" | "소독" | "저수조청소" | "history"
  let historyRows = [];
  let expandedMonths = new Set();
  let historyMode = "month"; // "month" | "year"
  let sortKey = null; // null | "site_name" | "work_date"
  let sortDir = "asc"; // "asc" | "desc"

  const won = (n) => (Number(n) || 0).toLocaleString("ko-KR") + "원";

  function bankAccountOptionsHtml(selected) {
    const opts = BANK_ACCOUNTS.map(
      (b) => `<option value="${escapeHtml(b)}" ${b === selected ? "selected" : ""}>${escapeHtml(b)}</option>`
    ).join("");
    return `<option value="" ${!selected ? "selected" : ""}>통장 선택</option>${opts}`;
  }
  newBankAccount.innerHTML = bankAccountOptionsHtml("");

  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    let data = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (!res.ok) {
      const msg = (data && data.error) || `요청 실패 (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  // ---------- 인증 ----------

  async function checkAuth() {
    const data = await api("/api/me").catch(() => ({ authenticated: false }));
    if (data.authenticated) {
      showApp();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    stopPolling();
    loginView.classList.remove("hidden");
    appView.classList.add("hidden");
    loginPassword.value = "";
    loginError.textContent = "";
  }

  async function showApp() {
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    await loadSites();
    await loadRecords();
    startPolling();
  }

  // ---------- 탭 전환 (작업 내역 / 소독 / 저수조 청소 / 히스토리) ----------

  function switchTab(tab) {
    activeTab = tab;
    tabBtns.forEach((btn) => btn.classList.toggle("tab-active", btn.dataset.tab === tab));
    const isHistory = tab === "history";
    listSection.classList.toggle("hidden", isHistory);
    historyView.classList.toggle("hidden", !isHistory);
    if (isHistory) {
      loadMonthlySummary();
    } else {
      loadRecords();
    }
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    try {
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ password: loginPassword.value }),
      });
      await showApp();
    } catch (err) {
      loginError.textContent = err.message;
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await api("/api/logout", { method: "POST" }).catch(() => {});
    showLogin();
  });

  // ---------- 폴링 (몇 초마다 자동 새로고침) ----------

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(() => {
      if (editingId !== null) return; // 편집 중에는 화면을 덮어쓰지 않음
      if (activeTab === "history") {
        loadMonthlySummary();
      } else {
        loadRecords();
      }
    }, 5000);
  }
  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !appView.classList.contains("hidden")) {
      if (activeTab === "history") loadMonthlySummary();
      else loadRecords();
    }
  });

  // ---------- 현장 목록 ----------

  async function loadSites() {
    const data = await api("/api/sites");
    sites = data.sites;
    renderSiteSelects();
    renderSiteModalList();
  }

  function renderSiteSelects() {
    const opts = sites.map((s) => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join("");
    const prevFilter = filterSite.value;
    const prevNew = newSite.value;
    const prevHistoryFilter = historyFilterSite.value;
    filterSite.innerHTML = `<option value="">전체 현장</option>${opts}`;
    newSite.innerHTML = `<option value="">현장 선택</option>${opts}`;
    historyFilterSite.innerHTML = `<option value="">전체 현장</option>${opts}`;
    if (sites.some((s) => s.name === prevFilter)) filterSite.value = prevFilter;
    if (sites.some((s) => s.name === prevNew)) newSite.value = prevNew;
    if (sites.some((s) => s.name === prevHistoryFilter)) historyFilterSite.value = prevHistoryFilter;
  }

  function renderSiteModalList() {
    if (sites.length === 0) {
      siteList.innerHTML = `<li style="color:#9aa0aa">등록된 현장이 없습니다.</li>`;
      return;
    }
    siteList.innerHTML = sites
      .map(
        (s) => `
        <li>
          <span>${escapeHtml(s.name)}</span>
          <button class="btn btn-danger btn-sm" data-site-del="${s.id}">삭제</button>
        </li>`
      )
      .join("");
  }

  siteManageBtn.addEventListener("click", () => {
    siteError.textContent = "";
    siteModal.classList.remove("hidden");
  });
  siteModalCloseBtn.addEventListener("click", () => siteModal.classList.add("hidden"));
  siteModal.addEventListener("click", (e) => {
    if (e.target === siteModal) siteModal.classList.add("hidden");
  });

  siteAddBtn.addEventListener("click", async () => {
    const name = siteNewName.value.trim();
    siteError.textContent = "";
    if (!name) { siteError.textContent = "현장명을 입력해주세요."; return; }
    try {
      await api("/api/sites", { method: "POST", body: JSON.stringify({ name }) });
      siteNewName.value = "";
      await loadSites();
    } catch (err) {
      siteError.textContent = err.message;
    }
  });

  siteList.addEventListener("click", async (e) => {
    const id = e.target.getAttribute("data-site-del");
    if (!id) return;
    if (!confirm("이 현장을 목록에서 삭제할까요? (기존 내역은 그대로 남습니다)")) return;
    try {
      await api(`/api/sites/${id}`, { method: "DELETE" });
      await loadSites();
    } catch (err) {
      siteError.textContent = err.message;
    }
  });

  // ---------- 내역 목록 ----------

  async function loadRecords() {
    const params = new URLSearchParams();
    params.set("category", CATEGORIES.includes(activeTab) ? activeTab : CATEGORIES[0]);
    if (filterSite.value) params.set("site", filterSite.value);
    if (filterMonth.value) params.set("month", filterMonth.value);
    const data = await api(`/api/records?${params.toString()}`);
    records = data.records;
    rebuildMonthFilterOptions();
    renderRecords();
    renderSummary();
    lastSyncEl.textContent = "마지막 갱신 " + new Date().toLocaleTimeString("ko-KR");
  }

  function rebuildMonthFilterOptions() {
    const months = new Set(
      records.map((r) => (r.work_date || r.created_at || "").slice(0, 7)).filter(Boolean)
    );
    const prev = filterMonth.value;
    const sorted = Array.from(months).sort().reverse();
    filterMonth.innerHTML =
      `<option value="">전체 기간</option>` +
      sorted.map((m) => `<option value="${m}">${m}</option>`).join("");
    if (sorted.includes(prev)) filterMonth.value = prev;
  }

  filterSite.addEventListener("change", loadRecords);
  filterMonth.addEventListener("change", loadRecords);
  filterResetBtn.addEventListener("click", () => {
    filterSite.value = "";
    filterMonth.value = "";
    loadRecords();
  });

  function renderSummary() {
    const total = records.length;
    const unbilled = records.filter((r) => !r.billed).length;
    const unpaid = records.filter((r) => !r.paid).length;
    const paidCostSum = records.filter((r) => r.paid).reduce((s, r) => s + (r.cost || 0), 0);
    sumTotal.textContent = total;
    sumUnbilled.textContent = unbilled;
    sumUnpaid.textContent = unpaid;
    sumPaidCost.textContent = won(paidCostSum);
  }

  function sortedRecords() {
    if (!sortKey) return records; // 정렬 안 함 -> 서버 기본 순서(입금 대기 먼저, 최신순) 그대로
    const dir = sortDir === "desc" ? -1 : 1;
    return [...records].sort((a, b) => {
      let av = a[sortKey] || "";
      let bv = b[sortKey] || "";
      if (sortKey === "site_name") {
        return av.localeCompare(bv, "ko") * dir;
      }
      // work_date: "YYYY-MM-DD" 문자열이라 그대로 비교 가능. 값이 없으면 항상 뒤로 보냄.
      if (!av && !bv) return 0;
      if (!av) return 1;
      if (!bv) return -1;
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });
  }

  function updateSortHeaders() {
    sortableHeaders.forEach((th) => {
      const key = th.dataset.sort;
      const arrow = th.querySelector(".sort-arrow");
      const active = key === sortKey;
      th.classList.toggle("sort-active", active);
      arrow.textContent = active ? (sortDir === "asc" ? "▲" : "▼") : "";
    });
  }

  sortableHeaders.forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (sortKey !== key) {
        sortKey = key;
        sortDir = "asc";
      } else if (sortDir === "asc") {
        sortDir = "desc";
      } else {
        sortKey = null; // 세 번째 클릭 -> 정렬 해제, 기본 순서로 복귀
      }
      updateSortHeaders();
      renderRecords();
    });
  });

  function renderRecords() {
    if (records.length === 0) {
      recordsBody.innerHTML = "";
      emptyMsg.classList.remove("hidden");
      return;
    }
    emptyMsg.classList.add("hidden");

    recordsBody.innerHTML = sortedRecords()
      .map((r) => {
        if (editingId === r.id) return editRowHtml(r);
        return viewRowHtml(r);
      })
      .join("");
  }

  function viewRowHtml(r) {
    return `
      <tr class="${r.paid ? "paid-row" : ""}" data-id="${r.id}">
        <td class="site-badge">${escapeHtml(r.site_name)}</td>
        <td class="col-date">${escapeHtml(r.work_date) || "-"}</td>
        <td class="content-cell" title="${escapeHtml(r.content)}">${escapeHtml(r.content) || "-"}</td>
        <td class="col-cost">${won(r.cost)}</td>
        <td class="col-check">
          <input type="checkbox" data-action="toggle-billed" data-id="${r.id}" ${r.billed ? "checked" : ""} />
        </td>
        <td class="col-check">
          <input type="checkbox" data-action="toggle-paid" data-id="${r.id}" ${r.paid ? "checked" : ""} />
        </td>
        <td class="col-date">
          <input type="date" class="edit-input" data-action="change-date" data-id="${r.id}" value="${r.paid_date || ""}" />
        </td>
        <td class="col-bank">
          <select class="edit-input" data-action="change-bank" data-id="${r.id}">${bankAccountOptionsHtml(r.bank_account)}</select>
        </td>
        <td class="col-manage">
          <span class="row-actions">
            <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${r.id}">수정</button>
            <button class="btn btn-danger btn-sm" data-action="delete" data-id="${r.id}">삭제</button>
          </span>
        </td>
      </tr>`;
  }

  function editRowHtml(r) {
    const siteOpts = sites
      .map((s) => `<option value="${escapeHtml(s.name)}" ${s.name === r.site_name ? "selected" : ""}>${escapeHtml(s.name)}</option>`)
      .join("");
    return `
      <tr data-id="${r.id}">
        <td><select class="edit-input" data-edit="site_name">${siteOpts}</select></td>
        <td class="col-date"><input class="edit-input" type="date" data-edit="work_date" value="${r.work_date || ""}" /></td>
        <td><input class="edit-input" data-edit="content" value="${escapeHtml(r.content)}" /></td>
        <td class="col-cost"><input class="edit-input" type="number" min="0" data-edit="cost" value="${r.cost}" /></td>
        <td class="col-check">
          <input type="checkbox" data-edit="billed" ${r.billed ? "checked" : ""} />
        </td>
        <td class="col-check">
          <input type="checkbox" data-edit="paid" ${r.paid ? "checked" : ""} />
        </td>
        <td class="col-date"><input class="edit-input" type="date" data-edit="paid_date" value="${r.paid_date || ""}" /></td>
        <td class="col-bank"><select class="edit-input" data-edit="bank_account">${bankAccountOptionsHtml(r.bank_account)}</select></td>
        <td class="col-manage">
          <span class="row-actions">
            <button class="btn btn-primary btn-sm" data-action="save-edit" data-id="${r.id}">저장</button>
            <button class="btn btn-ghost btn-sm" data-action="cancel-edit" data-id="${r.id}">취소</button>
          </span>
        </td>
      </tr>`;
  }

  recordsBody.addEventListener("change", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "toggle-billed") {
      await patchRecord(id, { billed: e.target.checked });
    } else if (action === "toggle-paid") {
      await patchRecord(id, { paid: e.target.checked });
    } else if (action === "change-date") {
      await patchRecord(id, { paid_date: e.target.value });
    } else if (action === "change-bank") {
      await patchRecord(id, { bank_account: e.target.value });
    }
  });

  recordsBody.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit") {
      editingId = Number(id);
      renderRecords();
    } else if (action === "cancel-edit") {
      editingId = null;
      renderRecords();
    } else if (action === "save-edit") {
      const row = e.target.closest("tr");
      const patch = {
        site_name: row.querySelector('[data-edit="site_name"]').value,
        work_date: row.querySelector('[data-edit="work_date"]').value || null,
        content: row.querySelector('[data-edit="content"]').value,
        cost: Number(row.querySelector('[data-edit="cost"]').value) || 0,
        billed: row.querySelector('[data-edit="billed"]').checked,
        paid: row.querySelector('[data-edit="paid"]').checked,
        paid_date: row.querySelector('[data-edit="paid_date"]').value || null,
        bank_account: row.querySelector('[data-edit="bank_account"]').value || "",
      };
      try {
        await patchRecord(id, patch, false);
        editingId = null;
        await loadRecords();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === "delete") {
      if (!confirm("이 내역을 삭제할까요?")) return;
      try {
        await api(`/api/records/${id}`, { method: "DELETE" });
        await loadRecords();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  async function patchRecord(id, patch, refresh = true) {
    await api(`/api/records/${id}`, { method: "PUT", body: JSON.stringify(patch) });
    if (refresh) await loadRecords();
  }

  // ---------- 새 내역 추가 ----------

  addRecordBtn.addEventListener("click", () => {
    addError.textContent = "";
    addForm.classList.toggle("hidden");
    if (!addForm.classList.contains("hidden") && !newWorkDate.value) {
      newWorkDate.value = todayStr();
    }
  });
  cancelNewBtn.addEventListener("click", () => {
    addForm.classList.add("hidden");
    resetAddForm();
  });

  function todayStr() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function resetAddForm() {
    newSite.value = "";
    newWorkDate.value = todayStr();
    newContent.value = "";
    newCost.value = "";
    newBilled.checked = false;
    newPaid.checked = false;
    newPaidDate.value = "";
    newBankAccount.value = "";
    addError.textContent = "";
  }

  saveNewBtn.addEventListener("click", async () => {
    addError.textContent = "";
    if (!newSite.value) { addError.textContent = "현장을 선택해주세요."; return; }
    if (!newWorkDate.value) { addError.textContent = "작업 날짜를 선택해주세요."; return; }
    try {
      await api("/api/records", {
        method: "POST",
        body: JSON.stringify({
          site_name: newSite.value,
          work_date: newWorkDate.value,
          content: newContent.value,
          cost: Number(newCost.value) || 0,
          billed: newBilled.checked,
          paid: newPaid.checked,
          paid_date: newPaidDate.value || null,
          bank_account: newBankAccount.value || "",
          category: CATEGORIES.includes(activeTab) ? activeTab : CATEGORIES[0],
        }),
      });
      addForm.classList.add("hidden");
      resetAddForm();
      await loadRecords();
    } catch (err) {
      addError.textContent = err.message;
    }
  });

  // ---------- 월별 히스토리 ----------

  async function loadMonthlySummary() {
    const data = await api("/api/monthly-summary");
    historyRows = data.rows || [];
    renderHistory();
  }

  function switchHistoryMode(mode) {
    historyMode = mode;
    historyModeMonthBtn.classList.toggle("subtab-active", mode === "month");
    historyModeYearBtn.classList.toggle("subtab-active", mode === "year");
    historyPeriodHeader.textContent = mode === "month" ? "월" : "연도";
    expandedMonths.clear();
    renderHistory();
  }
  historyModeMonthBtn.addEventListener("click", () => switchHistoryMode("month"));
  historyModeYearBtn.addEventListener("click", () => switchHistoryMode("year"));
  historyFilterSite.addEventListener("change", () => {
    expandedMonths.clear();
    renderHistory();
  });
  historyFilterCategory.addEventListener("change", () => {
    expandedMonths.clear();
    renderHistory();
  });

  function renderHistory() {
    const siteFilter = historyFilterSite.value;
    const categoryFilter = historyFilterCategory.value;
    const filteredRows = historyRows.filter((r) => {
      if (siteFilter && r.site_name !== siteFilter) return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      return true;
    });

    if (filteredRows.length === 0) {
      historyBody.innerHTML = "";
      historyEmptyMsg.classList.remove("hidden");
      return;
    }
    historyEmptyMsg.classList.add("hidden");

    // 월별 또는 연도별로 묶기 (연도별은 월별 데이터를 다시 합산)
    const byPeriod = new Map();
    for (const row of filteredRows) {
      const m = row.month || "미상";
      const key = historyMode === "year" ? m.slice(0, 4) || "미상" : m;
      if (!byPeriod.has(key)) {
        byPeriod.set(key, { period: key, count: 0, billed_total: 0, paid_total: 0, sitesMap: new Map() });
      }
      const bucket = byPeriod.get(key);
      bucket.count += row.count;
      // 청구금액 합계는 "품의 올림" 체크 여부와 상관없이, 등록된 전체 비용을 기준으로 집계합니다.
      bucket.billed_total += row.cost_total || 0;
      bucket.paid_total += row.paid_total || 0;

      // 연도별일 때는 같은 현장이 여러 달에 걸쳐 나올 수 있으므로 현장 기준으로 다시 합산
      const s = bucket.sitesMap.get(row.site_name) || {
        site_name: row.site_name, count: 0, billed_total: 0, paid_total: 0, paid_count: 0,
      };
      s.count += row.count;
      s.billed_total += row.cost_total || 0;
      s.paid_total += row.paid_total || 0;
      s.paid_count += row.paid_count || 0;
      bucket.sitesMap.set(row.site_name, s);
    }

    const periods = Array.from(byPeriod.values()).sort((a, b) => (a.period < b.period ? 1 : -1));

    historyBody.innerHTML = periods
      .map((m) => {
        const deficit = m.billed_total - m.paid_total;
        const isExpanded = expandedMonths.has(m.period);
        const siteRows = Array.from(m.sitesMap.values()).sort((a, b) => a.site_name.localeCompare(b.site_name, "ko"));
        const detailRows = isExpanded
          ? siteRows
              .map(
                (s) => `
              <tr class="site-detail-row">
                <td></td>
                <td class="site-detail-name">${escapeHtml(s.site_name)}</td>
                <td class="col-cost">${s.count}건</td>
                <td class="col-cost">${won(s.billed_total)} (${s.count}건)</td>
                <td class="col-cost">${won(s.paid_total)} (${s.paid_count}건)</td>
                <td class="col-cost">${won((s.billed_total || 0) - (s.paid_total || 0))}</td>
              </tr>`
              )
              .join("")
          : "";
        return `
          <tr class="month-row ${isExpanded ? "expanded" : ""}" data-period="${m.period}">
            <td class="expand-cell"><span class="expand-icon">▶</span></td>
            <td class="site-badge">${escapeHtml(historyMode === "year" ? m.period + "년" : m.period)}</td>
            <td class="col-cost">${m.count}건</td>
            <td class="col-cost">${won(m.billed_total)}</td>
            <td class="col-cost">${won(m.paid_total)}</td>
            <td class="col-cost ${deficit > 0 ? "deficit" : "deficit-zero"}">${won(deficit)}</td>
          </tr>
          ${detailRows}`;
      })
      .join("");
  }

  historyBody.addEventListener("click", (e) => {
    const row = e.target.closest(".month-row");
    if (!row) return;
    const period = row.getAttribute("data-period");

    // 아이콘(또는 행의 첫 칸)을 클릭하면 상세 펼치기/접기
    if (e.target.closest(".expand-cell")) {
      if (expandedMonths.has(period)) expandedMonths.delete(period);
      else expandedMonths.add(period);
      renderHistory();
      return;
    }

    if (historyMode === "year") {
      // 연도별 화면에서는 목록에 연도 단위 필터가 없으므로, 행 클릭으로도 상세를 펼치고/접습니다.
      if (expandedMonths.has(period)) expandedMonths.delete(period);
      else expandedMonths.add(period);
      renderHistory();
      return;
    }

    // 월 행 클릭 -> 해당 구분 탭으로 이동해서 그 월(및 현장 필터 중이면 그 현장)로 필터링
    // (히스토리에서 구분을 선택하지 않은 상태라면 기본으로 "작업내역" 탭으로 이동합니다)
    filterMonth.value = period;
    filterSite.value = historyFilterSite.value || "";
    switchTab(historyFilterCategory.value || "작업내역");
  });

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  // ---------- 시작 ----------
  checkAuth();
})();
