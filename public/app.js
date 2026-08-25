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

  // ---------- 업무일지 화면 요소 ----------
  const journalSection = $("#journalSection");
  const journalFilterSite = $("#journalFilterSite");
  const journalFilterMonth = $("#journalFilterMonth");
  const journalFilterResetBtn = $("#journalFilterResetBtn");
  const addJournalBtn = $("#addJournalBtn");
  const journalAddForm = $("#journalAddForm");
  const newJournalDate = $("#newJournalDate");
  const newJournalSite = $("#newJournalSite");
  const newJournalContent = $("#newJournalContent");
  const newJournalRemarks = $("#newJournalRemarks");
  const saveJournalBtn = $("#saveJournalBtn");
  const cancelJournalBtn = $("#cancelJournalBtn");
  const journalAddError = $("#journalAddError");
  const journalBody = $("#journalBody");
  const journalEmptyMsg = $("#journalEmptyMsg");
  const journalWeekPicker = $("#journalWeekPicker");
  const journalMonthPicker = $("#journalMonthPicker");
  const downloadWeeklyBtn = $("#downloadWeeklyBtn");
  const downloadMonthlyBtn = $("#downloadMonthlyBtn");
  const exportError = $("#exportError");

  // ---------- 후속 작업 화면 요소 ----------
  const followupSection = $("#followupSection");
  const followupFilterSite = $("#followupFilterSite");
  const followupFilterStatus = $("#followupFilterStatus");
  const followupFilterResetBtn = $("#followupFilterResetBtn");
  const addFollowupBtn = $("#addFollowupBtn");
  const followupAddForm = $("#followupAddForm");
  const newFollowupSite = $("#newFollowupSite");
  const newFollowupContent = $("#newFollowupContent");
  const newFollowupDue = $("#newFollowupDue");
  const newFollowupRemarks = $("#newFollowupRemarks");
  const saveFollowupBtn = $("#saveFollowupBtn");
  const cancelFollowupBtn = $("#cancelFollowupBtn");
  const followupAddError = $("#followupAddError");
  const followupBody = $("#followupBody");
  const followupEmptyMsg = $("#followupEmptyMsg");

  // ---------- 작업내역 조회 화면 요소 ----------
  const overviewSection = $("#overviewSection");
  const overviewModeMonthBtn = $("#overviewModeMonthBtn");
  const overviewModeYearBtn = $("#overviewModeYearBtn");
  const overviewPeriodHeader = $("#overviewPeriodHeader");
  const overviewFilterSite = $("#overviewFilterSite");
  const overviewSearchInput = $("#overviewSearchInput");
  const overviewSearchBtn = $("#overviewSearchBtn");
  const overviewSearchResetBtn = $("#overviewSearchResetBtn");
  const overviewSearchHint = $("#overviewSearchHint");
  const overviewTable = $("#overviewTable");
  const overviewBody = $("#overviewBody");
  const overviewSearchTable = $("#overviewSearchTable");
  const overviewSearchBody = $("#overviewSearchBody");
  const overviewEmptyMsg = $("#overviewEmptyMsg");

  let sites = [];
  let records = [];
  let editingId = null;
  let pollTimer = null;
  let activeTab = "작업내역"; // "작업내역" | "소독" | "저수조청소" | "history" | "journal" | "followup" | "overview"
  let historyRows = [];
  let expandedMonths = new Set();
  let historyMode = "month"; // "month" | "year"
  let sortKey = null; // null | "site_name" | "work_date"
  let sortDir = "asc"; // "asc" | "desc"

  // 업무일지 상태
  let journalEntries = [];
  let editingJournalId = null;

  // 후속 작업 상태
  let followupEntries = [];
  let editingFollowupId = null;

  // 작업내역 조회 상태
  let overviewSummaryRows = [];
  let overviewSearchResults = [];
  let overviewMode = "month"; // "month" | "year"
  let overviewExpandedPeriods = new Set();
  let overviewSearching = false;

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

    const sectionsByTab = {
      history: historyView,
      journal: journalSection,
      followup: followupSection,
      overview: overviewSection,
    };
    listSection.classList.toggle("hidden", !CATEGORIES.includes(tab));
    Object.entries(sectionsByTab).forEach(([key, el]) => {
      el.classList.toggle("hidden", key !== tab);
    });

    if (tab === "history") {
      loadMonthlySummary();
    } else if (tab === "journal") {
      loadJournal();
    } else if (tab === "followup") {
      loadFollowups();
    } else if (tab === "overview") {
      loadOverview();
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

  function refreshActiveTab() {
    if (activeTab === "history") {
      loadMonthlySummary();
    } else if (activeTab === "journal") {
      if (editingJournalId === null) loadJournal();
    } else if (activeTab === "followup") {
      if (editingFollowupId === null) loadFollowups();
    } else if (activeTab === "overview") {
      loadOverview();
    } else {
      if (editingId === null) loadRecords();
    }
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(refreshActiveTab, 5000);
  }
  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !appView.classList.contains("hidden")) {
      refreshActiveTab();
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
    const filterOpts = `<option value="">전체 현장</option>${opts}`;
    const pickOpts = `<option value="">현장 선택</option>${opts}`;

    const targets = [
      [filterSite, filterOpts],
      [newSite, pickOpts],
      [historyFilterSite, filterOpts],
      [journalFilterSite, filterOpts],
      [newJournalSite, pickOpts],
      [followupFilterSite, filterOpts],
      [newFollowupSite, pickOpts],
      [overviewFilterSite, filterOpts],
    ];

    const prevValues = targets.map(([el]) => el.value);
    targets.forEach(([el, html]) => { el.innerHTML = html; });
    targets.forEach(([el], i) => {
      if (sites.some((s) => s.name === prevValues[i])) el.value = prevValues[i];
    });
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
        <td class="site-badge" data-label="현장명"><span class="cell-value">${escapeHtml(r.site_name)}</span></td>
        <td class="col-date" data-label="작업일"><span class="cell-value">${escapeHtml(r.work_date) || "-"}</span></td>
        <td class="content-cell" data-label="내용" title="${escapeHtml(r.content)}"><span class="cell-value">${escapeHtml(r.content) || "-"}</span></td>
        <td class="col-cost" data-label="비용"><span class="cell-value">${won(r.cost)}</span></td>
        <td class="col-check" data-label="품의">
          <input type="checkbox" data-action="toggle-billed" data-id="${r.id}" ${r.billed ? "checked" : ""} />
        </td>
        <td class="col-check" data-label="입금">
          <input type="checkbox" data-action="toggle-paid" data-id="${r.id}" ${r.paid ? "checked" : ""} />
        </td>
        <td class="col-date" data-label="입금일">
          <input type="date" class="edit-input" data-action="change-date" data-id="${r.id}" value="${r.paid_date || ""}" />
        </td>
        <td class="col-bank" data-label="입금 통장">
          <select class="edit-input" data-action="change-bank" data-id="${r.id}">${bankAccountOptionsHtml(r.bank_account)}</select>
        </td>
        <td class="col-manage" data-label="관리">
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
        <td data-label="현장명"><select class="edit-input" data-edit="site_name">${siteOpts}</select></td>
        <td class="col-date" data-label="작업일"><input class="edit-input" type="date" data-edit="work_date" value="${r.work_date || ""}" /></td>
        <td data-label="내용"><input class="edit-input" data-edit="content" value="${escapeHtml(r.content)}" /></td>
        <td class="col-cost" data-label="비용"><input class="edit-input" type="number" min="0" data-edit="cost" value="${r.cost}" /></td>
        <td class="col-check" data-label="품의">
          <input type="checkbox" data-edit="billed" ${r.billed ? "checked" : ""} />
        </td>
        <td class="col-check" data-label="입금">
          <input type="checkbox" data-edit="paid" ${r.paid ? "checked" : ""} />
        </td>
        <td class="col-date" data-label="입금일"><input class="edit-input" type="date" data-edit="paid_date" value="${r.paid_date || ""}" /></td>
        <td class="col-bank" data-label="입금 통장"><select class="edit-input" data-edit="bank_account">${bankAccountOptionsHtml(r.bank_account)}</select></td>
        <td class="col-manage" data-label="관리">
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
                (s, i) => `
              <tr class="site-detail-row ${i === siteRows.length - 1 ? "last-detail" : ""}" data-period="${m.period}" data-site="${escapeHtml(s.site_name)}">
                <td class="site-detail-name" data-label="현장명"><span class="cell-value">${escapeHtml(s.site_name)}</span></td>
                <td class="col-cost" data-label="작업 건수"><span class="cell-value">${s.count}건</span></td>
                <td class="col-cost" data-label="청구금액"><span class="cell-value">${won(s.billed_total)} (${s.count}건)</span></td>
                <td class="col-cost" data-label="입금금액"><span class="cell-value">${won(s.paid_total)} (${s.paid_count}건)</span></td>
                <td class="col-cost" data-label="미수금"><span class="cell-value">${won((s.billed_total || 0) - (s.paid_total || 0))}</span></td>
              </tr>`
              )
              .join("")
          : "";
        const periodLabel = historyMode === "year" ? m.period + "년" : m.period;
        return `
          <tr class="month-row ${isExpanded ? "expanded" : ""}" data-period="${m.period}">
            <td class="period-cell" data-label="${historyMode === "year" ? "연도" : "월"}">
              <span class="expand-icon">▶</span><span class="cell-value">${escapeHtml(periodLabel)}</span><span class="period-hint">${isExpanded ? "접기" : "현장별 보기"}</span>
            </td>
            <td class="col-cost" data-label="작업 건수"><span class="cell-value">${m.count}건</span></td>
            <td class="col-cost" data-label="청구금액 합계"><span class="cell-value">${won(m.billed_total)}</span></td>
            <td class="col-cost" data-label="입금금액 합계"><span class="cell-value">${won(m.paid_total)}</span></td>
            <td class="col-cost ${deficit > 0 ? "deficit" : "deficit-zero"}" data-label="미수금"><span class="cell-value">${won(deficit)}</span></td>
          </tr>
          ${detailRows}`;
      })
      .join("");
  }

  historyBody.addEventListener("click", (e) => {
    // 현장별 상세 줄을 누르면 그 달 + 그 현장의 실제 내역으로 이동
    const detail = e.target.closest(".site-detail-row");
    if (detail) {
      if (historyMode === "year") return;
      filterMonth.value = detail.getAttribute("data-period");
      filterSite.value = detail.getAttribute("data-site") || "";
      switchTab(historyFilterCategory.value || "작업내역");
      return;
    }

    const row = e.target.closest(".month-row");
    if (!row) return;
    const period = row.getAttribute("data-period");

    // 기간 칸(펼침 아이콘이 있는 칸)을 누르면 현장별 상세 펼치기/접기
    if (e.target.closest(".period-cell")) {
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

  // ================= 업무일지 (현장명 / 작업내역 / 비고) =================

  async function loadJournal() {
    const params = new URLSearchParams();
    if (journalFilterSite.value) params.set("site", journalFilterSite.value);
    if (journalFilterMonth.value) params.set("month", journalFilterMonth.value);
    const data = await api(`/api/journal?${params.toString()}`);
    journalEntries = data.entries;
    rebuildJournalMonthFilterOptions();
    renderJournal();
  }

  function rebuildJournalMonthFilterOptions() {
    const months = new Set(journalEntries.map((r) => (r.work_date || "").slice(0, 7)).filter(Boolean));
    const prev = journalFilterMonth.value;
    const sorted = Array.from(months).sort().reverse();
    journalFilterMonth.innerHTML =
      `<option value="">전체 기간</option>` + sorted.map((m) => `<option value="${m}">${m}</option>`).join("");
    if (sorted.includes(prev)) journalFilterMonth.value = prev;
  }

  journalFilterSite.addEventListener("change", loadJournal);
  journalFilterMonth.addEventListener("change", loadJournal);
  journalFilterResetBtn.addEventListener("click", () => {
    journalFilterSite.value = "";
    journalFilterMonth.value = "";
    loadJournal();
  });

  addJournalBtn.addEventListener("click", () => {
    journalAddError.textContent = "";
    journalAddForm.classList.toggle("hidden");
    if (!journalAddForm.classList.contains("hidden") && !newJournalDate.value) {
      newJournalDate.value = todayStr();
    }
  });
  cancelJournalBtn.addEventListener("click", () => {
    journalAddForm.classList.add("hidden");
    resetJournalAddForm();
  });

  function resetJournalAddForm() {
    newJournalDate.value = todayStr();
    newJournalSite.value = "";
    newJournalContent.value = "";
    newJournalRemarks.value = "";
    journalAddError.textContent = "";
  }

  saveJournalBtn.addEventListener("click", async () => {
    journalAddError.textContent = "";
    if (!newJournalSite.value) { journalAddError.textContent = "현장을 선택해주세요."; return; }
    if (!newJournalDate.value) { journalAddError.textContent = "작업 날짜를 선택해주세요."; return; }
    try {
      await api("/api/journal", {
        method: "POST",
        body: JSON.stringify({
          work_date: newJournalDate.value,
          site_name: newJournalSite.value,
          content: newJournalContent.value,
          remarks: newJournalRemarks.value,
        }),
      });
      journalAddForm.classList.add("hidden");
      resetJournalAddForm();
      await loadJournal();
    } catch (err) {
      journalAddError.textContent = err.message;
    }
  });

  function renderJournal() {
    if (journalEntries.length === 0) {
      journalBody.innerHTML = "";
      journalEmptyMsg.classList.remove("hidden");
      return;
    }
    journalEmptyMsg.classList.add("hidden");
    journalBody.innerHTML = journalEntries
      .map((r) => (editingJournalId === r.id ? journalEditRowHtml(r) : journalViewRowHtml(r)))
      .join("");
  }

  function journalViewRowHtml(r) {
    return `
      <tr data-id="${r.id}">
        <td class="col-date" data-label="작업일"><span class="cell-value">${escapeHtml(r.work_date) || "-"}</span></td>
        <td class="site-badge" data-label="현장명"><span class="cell-value">${escapeHtml(r.site_name)}</span></td>
        <td class="content-cell-wide" data-label="작업내역"><span class="cell-value">${escapeHtml(r.content) || "-"}</span></td>
        <td class="content-cell-wide" data-label="비고"><span class="cell-value">${escapeHtml(r.remarks) || "-"}</span></td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-ghost btn-sm" data-action="edit-journal" data-id="${r.id}">수정</button>
            <button class="btn btn-danger btn-sm" data-action="delete-journal" data-id="${r.id}">삭제</button>
          </span>
        </td>
      </tr>`;
  }

  function journalEditRowHtml(r) {
    const siteOpts = sites
      .map((s) => `<option value="${escapeHtml(s.name)}" ${s.name === r.site_name ? "selected" : ""}>${escapeHtml(s.name)}</option>`)
      .join("");
    return `
      <tr data-id="${r.id}">
        <td class="col-date" data-label="작업일"><input class="edit-input" type="date" data-edit="work_date" value="${r.work_date || ""}" /></td>
        <td data-label="현장명"><select class="edit-input" data-edit="site_name">${siteOpts}</select></td>
        <td data-label="작업내역"><input class="edit-input" data-edit="content" value="${escapeHtml(r.content)}" /></td>
        <td data-label="비고"><input class="edit-input" data-edit="remarks" value="${escapeHtml(r.remarks)}" /></td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-primary btn-sm" data-action="save-edit-journal" data-id="${r.id}">저장</button>
            <button class="btn btn-ghost btn-sm" data-action="cancel-edit-journal" data-id="${r.id}">취소</button>
          </span>
        </td>
      </tr>`;
  }

  journalBody.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit-journal") {
      editingJournalId = Number(id);
      renderJournal();
    } else if (action === "cancel-edit-journal") {
      editingJournalId = null;
      renderJournal();
    } else if (action === "save-edit-journal") {
      const row = e.target.closest("tr");
      const patch = {
        work_date: row.querySelector('[data-edit="work_date"]').value || null,
        site_name: row.querySelector('[data-edit="site_name"]').value,
        content: row.querySelector('[data-edit="content"]').value,
        remarks: row.querySelector('[data-edit="remarks"]').value,
      };
      try {
        await api(`/api/journal/${id}`, { method: "PUT", body: JSON.stringify(patch) });
        editingJournalId = null;
        await loadJournal();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === "delete-journal") {
      if (!confirm("이 업무일지를 삭제할까요?")) return;
      try {
        await api(`/api/journal/${id}`, { method: "DELETE" });
        await loadJournal();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  // ---- 주간 / 월간 시설 작업일지 엑셀 다운로드 ----

  function isoWeekToRange(weekStr) {
    // weekStr: "YYYY-Www" (예: "2026-W35") -> 그 주의 월요일 ~ 일요일 날짜 범위 (ISO 8601 기준)
    const m = /^(\d{4})-W(\d{2})$/.exec(weekStr || "");
    if (!m) return null;
    const year = Number(m[1]);
    const week = Number(m[2]);
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7; // 월=1 ... 일=7
    const week1Monday = new Date(jan4);
    week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
    const monday = new Date(week1Monday);
    monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const fmt = (d) => d.toISOString().slice(0, 10);
    return { from: fmt(monday), to: fmt(sunday), label: `${fmt(monday)} ~ ${fmt(sunday)}` };
  }

  function buildJournalWorkbook(rows, title, filename) {
    if (typeof XLSX === "undefined") {
      throw new Error("엑셀 생성 라이브러리를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.");
    }
    const aoa = [];
    aoa.push([`비엠에스코리아 부산지사 ${title}`]);
    aoa.push([]);
    aoa.push(["번호", "작업일", "현장명", "작업내역", "비고"]);
    rows.forEach((r, i) => {
      aoa.push([i + 1, r.work_date || "", r.site_name || "", r.content || "", r.remarks || ""]);
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    ws["!cols"] = [{ wch: 6 }, { wch: 13 }, { wch: 20 }, { wch: 55 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "작업일지");
    XLSX.writeFile(wb, filename);
  }

  downloadWeeklyBtn.addEventListener("click", async () => {
    exportError.textContent = "";
    const range = isoWeekToRange(journalWeekPicker.value);
    if (!range) { exportError.textContent = "다운로드할 주(week)를 선택해주세요."; return; }
    try {
      const params = new URLSearchParams({ from: range.from, to: range.to, sort: "asc" });
      if (journalFilterSite.value) params.set("site", journalFilterSite.value);
      const data = await api(`/api/journal?${params.toString()}`);
      if (!data.entries || data.entries.length === 0) {
        exportError.textContent = "선택한 주간에 등록된 업무일지가 없습니다.";
        return;
      }
      buildJournalWorkbook(data.entries, `주간 시설 작업일지 (${range.label})`, `주간시설작업일지_${range.from}_${range.to}.xlsx`);
    } catch (err) {
      exportError.textContent = err.message;
    }
  });

  downloadMonthlyBtn.addEventListener("click", async () => {
    exportError.textContent = "";
    const month = journalMonthPicker.value; // "YYYY-MM"
    if (!month) { exportError.textContent = "다운로드할 월을 선택해주세요."; return; }
    try {
      const params = new URLSearchParams({ month, sort: "asc" });
      if (journalFilterSite.value) params.set("site", journalFilterSite.value);
      const data = await api(`/api/journal?${params.toString()}`);
      if (!data.entries || data.entries.length === 0) {
        exportError.textContent = "선택한 월에 등록된 업무일지가 없습니다.";
        return;
      }
      buildJournalWorkbook(data.entries, `월간 시설 작업일지 (${month})`, `월간시설작업일지_${month}.xlsx`);
    } catch (err) {
      exportError.textContent = err.message;
    }
  });

  // ================= 후속 작업 (앞으로 진행해야 하는 업무 등록/조회) =================

  async function loadFollowups() {
    const params = new URLSearchParams();
    if (followupFilterSite.value) params.set("site", followupFilterSite.value);
    if (followupFilterStatus.value !== "") params.set("status", followupFilterStatus.value);
    const data = await api(`/api/followups?${params.toString()}`);
    followupEntries = data.followups;
    renderFollowups();
  }

  followupFilterSite.addEventListener("change", loadFollowups);
  followupFilterStatus.addEventListener("change", loadFollowups);
  followupFilterResetBtn.addEventListener("click", () => {
    followupFilterSite.value = "";
    followupFilterStatus.value = "";
    loadFollowups();
  });

  addFollowupBtn.addEventListener("click", () => {
    followupAddError.textContent = "";
    followupAddForm.classList.toggle("hidden");
  });
  cancelFollowupBtn.addEventListener("click", () => {
    followupAddForm.classList.add("hidden");
    resetFollowupAddForm();
  });

  function resetFollowupAddForm() {
    newFollowupSite.value = "";
    newFollowupContent.value = "";
    newFollowupDue.value = "";
    newFollowupRemarks.value = "";
    followupAddError.textContent = "";
  }

  saveFollowupBtn.addEventListener("click", async () => {
    followupAddError.textContent = "";
    if (!newFollowupSite.value) { followupAddError.textContent = "현장을 선택해주세요."; return; }
    if (!newFollowupContent.value.trim()) { followupAddError.textContent = "내용을 입력해주세요."; return; }
    try {
      await api("/api/followups", {
        method: "POST",
        body: JSON.stringify({
          site_name: newFollowupSite.value,
          content: newFollowupContent.value,
          due_date: newFollowupDue.value || null,
          remarks: newFollowupRemarks.value,
        }),
      });
      followupAddForm.classList.add("hidden");
      resetFollowupAddForm();
      await loadFollowups();
    } catch (err) {
      followupAddError.textContent = err.message;
    }
  });

  function isOverdue(r) {
    if (r.status || !r.due_date) return false;
    return r.due_date < todayStr();
  }

  function renderFollowups() {
    if (followupEntries.length === 0) {
      followupBody.innerHTML = "";
      followupEmptyMsg.classList.remove("hidden");
      return;
    }
    followupEmptyMsg.classList.add("hidden");
    followupBody.innerHTML = followupEntries
      .map((r) => (editingFollowupId === r.id ? followupEditRowHtml(r) : followupViewRowHtml(r)))
      .join("");
  }

  function followupViewRowHtml(r) {
    const rowClass = r.status ? "paid-row" : isOverdue(r) ? "overdue-row" : "";
    return `
      <tr class="${rowClass}" data-id="${r.id}">
        <td class="site-badge" data-label="현장명"><span class="cell-value">${escapeHtml(r.site_name)}</span></td>
        <td class="content-cell-wide" data-label="내용"><span class="cell-value">${escapeHtml(r.content) || "-"}</span></td>
        <td class="col-date" data-label="예정일"><span class="cell-value">${escapeHtml(r.due_date) || "-"}</span></td>
        <td class="content-cell-wide" data-label="비고"><span class="cell-value">${escapeHtml(r.remarks) || "-"}</span></td>
        <td class="col-check" data-label="완료">
          <input type="checkbox" data-action="toggle-followup-status" data-id="${r.id}" ${r.status ? "checked" : ""} />
        </td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-ghost btn-sm" data-action="edit-followup" data-id="${r.id}">수정</button>
            <button class="btn btn-danger btn-sm" data-action="delete-followup" data-id="${r.id}">삭제</button>
          </span>
        </td>
      </tr>`;
  }

  function followupEditRowHtml(r) {
    const siteOpts = sites
      .map((s) => `<option value="${escapeHtml(s.name)}" ${s.name === r.site_name ? "selected" : ""}>${escapeHtml(s.name)}</option>`)
      .join("");
    return `
      <tr data-id="${r.id}">
        <td data-label="현장명"><select class="edit-input" data-edit="site_name">${siteOpts}</select></td>
        <td data-label="내용"><input class="edit-input" data-edit="content" value="${escapeHtml(r.content)}" /></td>
        <td class="col-date" data-label="예정일"><input class="edit-input" type="date" data-edit="due_date" value="${r.due_date || ""}" /></td>
        <td data-label="비고"><input class="edit-input" data-edit="remarks" value="${escapeHtml(r.remarks)}" /></td>
        <td class="col-check" data-label="완료">
          <input type="checkbox" data-edit="status" ${r.status ? "checked" : ""} />
        </td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-primary btn-sm" data-action="save-edit-followup" data-id="${r.id}">저장</button>
            <button class="btn btn-ghost btn-sm" data-action="cancel-edit-followup" data-id="${r.id}">취소</button>
          </span>
        </td>
      </tr>`;
  }

  followupBody.addEventListener("change", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;
    if (action === "toggle-followup-status") {
      try {
        await api(`/api/followups/${id}`, { method: "PUT", body: JSON.stringify({ status: e.target.checked }) });
        await loadFollowups();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  followupBody.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit-followup") {
      editingFollowupId = Number(id);
      renderFollowups();
    } else if (action === "cancel-edit-followup") {
      editingFollowupId = null;
      renderFollowups();
    } else if (action === "save-edit-followup") {
      const row = e.target.closest("tr");
      const patch = {
        site_name: row.querySelector('[data-edit="site_name"]').value,
        content: row.querySelector('[data-edit="content"]').value,
        due_date: row.querySelector('[data-edit="due_date"]').value || null,
        remarks: row.querySelector('[data-edit="remarks"]').value,
        status: row.querySelector('[data-edit="status"]').checked,
      };
      try {
        await api(`/api/followups/${id}`, { method: "PUT", body: JSON.stringify(patch) });
        editingFollowupId = null;
        await loadFollowups();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === "delete-followup") {
      if (!confirm("이 후속 작업을 삭제할까요?")) return;
      try {
        await api(`/api/followups/${id}`, { method: "DELETE" });
        await loadFollowups();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  // ================= 작업내역 조회 (월별/연간 통합 + 현장/키워드 검색) =================

  async function loadOverview() {
    if (overviewSearching) {
      await runOverviewSearch();
    } else {
      await loadOverviewSummary();
    }
  }

  async function loadOverviewSummary() {
    const data = await api("/api/journal-summary");
    overviewSummaryRows = data.rows || [];
    renderOverviewSummary();
  }

  function switchOverviewMode(mode) {
    overviewMode = mode;
    overviewModeMonthBtn.classList.toggle("subtab-active", mode === "month");
    overviewModeYearBtn.classList.toggle("subtab-active", mode === "year");
    overviewPeriodHeader.textContent = mode === "month" ? "월" : "연도";
    overviewExpandedPeriods.clear();
    renderOverviewSummary();
  }
  overviewModeMonthBtn.addEventListener("click", () => switchOverviewMode("month"));
  overviewModeYearBtn.addEventListener("click", () => switchOverviewMode("year"));
  overviewFilterSite.addEventListener("change", () => {
    if (overviewSearching) {
      runOverviewSearch();
    } else {
      overviewExpandedPeriods.clear();
      renderOverviewSummary();
    }
  });

  function renderOverviewSummary() {
    overviewSearchTable.classList.add("hidden");
    overviewTable.classList.remove("hidden");

    const siteFilter = overviewFilterSite.value;
    const filteredRows = overviewSummaryRows.filter((r) => !siteFilter || r.site_name === siteFilter);

    if (filteredRows.length === 0) {
      overviewBody.innerHTML = "";
      overviewEmptyMsg.classList.remove("hidden");
      return;
    }
    overviewEmptyMsg.classList.add("hidden");

    const byPeriod = new Map();
    for (const row of filteredRows) {
      const m = row.month || "미상";
      const key = overviewMode === "year" ? (m.slice(0, 4) || "미상") : m;
      if (!byPeriod.has(key)) {
        byPeriod.set(key, { period: key, count: 0, sitesMap: new Map() });
      }
      const bucket = byPeriod.get(key);
      bucket.count += row.count;
      const s = bucket.sitesMap.get(row.site_name) || { site_name: row.site_name, count: 0 };
      s.count += row.count;
      bucket.sitesMap.set(row.site_name, s);
    }

    const periods = Array.from(byPeriod.values()).sort((a, b) => (a.period < b.period ? 1 : -1));

    overviewBody.innerHTML = periods
      .map((m) => {
        const isExpanded = overviewExpandedPeriods.has(m.period);
        const siteRows = Array.from(m.sitesMap.values()).sort((a, b) => a.site_name.localeCompare(b.site_name, "ko"));
        const detailRows = isExpanded
          ? siteRows
              .map(
                (s, i) => `
              <tr class="site-detail-row ${i === siteRows.length - 1 ? "last-detail" : ""}" data-period="${m.period}" data-site="${escapeHtml(s.site_name)}">
                <td class="site-detail-name" data-label="현장명"><span class="cell-value">${escapeHtml(s.site_name)}</span></td>
                <td class="col-cost" data-label="작업 건수"><span class="cell-value">${s.count}건</span></td>
                <td class="col-cost" data-label="참여 현장 수"><span class="cell-value">-</span></td>
              </tr>`
              )
              .join("")
          : "";
        const periodLabel = overviewMode === "year" ? m.period + "년" : m.period;
        return `
          <tr class="month-row ${isExpanded ? "expanded" : ""}" data-period="${m.period}">
            <td class="period-cell" data-label="${overviewMode === "year" ? "연도" : "월"}">
              <span class="expand-icon">▶</span><span class="cell-value">${escapeHtml(periodLabel)}</span><span class="period-hint">${isExpanded ? "접기" : "현장별 보기"}</span>
            </td>
            <td class="col-cost" data-label="작업 건수"><span class="cell-value">${m.count}건</span></td>
            <td class="col-cost" data-label="참여 현장 수"><span class="cell-value">${m.sitesMap.size}곳</span></td>
          </tr>
          ${detailRows}`;
      })
      .join("");
  }

  overviewBody.addEventListener("click", (e) => {
    const detail = e.target.closest(".site-detail-row");
    if (detail) {
      if (overviewMode === "year") return;
      journalFilterSite.value = detail.getAttribute("data-site") || "";
      journalFilterMonth.value = detail.getAttribute("data-period") || "";
      switchTab("journal");
      return;
    }
    const row = e.target.closest(".month-row");
    if (!row) return;
    const period = row.getAttribute("data-period");
    if (overviewExpandedPeriods.has(period)) overviewExpandedPeriods.delete(period);
    else overviewExpandedPeriods.add(period);
    renderOverviewSummary();
  });

  async function runOverviewSearch() {
    const keyword = overviewSearchInput.value.trim();
    const params = new URLSearchParams({ sort: "desc" });
    if (keyword) params.set("keyword", keyword);
    if (overviewFilterSite.value) params.set("site", overviewFilterSite.value);
    const data = await api(`/api/journal?${params.toString()}`);
    overviewSearchResults = data.entries || [];
    renderOverviewSearch(keyword);
  }

  function highlightKeyword(text, keyword) {
    const escaped = escapeHtml(text);
    if (!keyword) return escaped || "-";
    const escapedKeyword = escapeHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return (escaped || "-").replace(new RegExp(escapedKeyword, "gi"), (m) => `<mark>${m}</mark>`);
  }

  function renderOverviewSearch(keyword) {
    overviewTable.classList.add("hidden");
    overviewSearchTable.classList.remove("hidden");

    overviewSearchHint.classList.remove("hidden");
    overviewSearchHint.textContent = keyword
      ? `"${keyword}" 검색 결과 ${overviewSearchResults.length}건`
      : `전체 업무일지 ${overviewSearchResults.length}건`;

    if (overviewSearchResults.length === 0) {
      overviewSearchBody.innerHTML = "";
      overviewEmptyMsg.classList.remove("hidden");
      return;
    }
    overviewEmptyMsg.classList.add("hidden");

    overviewSearchBody.innerHTML = overviewSearchResults
      .map(
        (r) => `
        <tr>
          <td class="col-date" data-label="작업일"><span class="cell-value">${escapeHtml(r.work_date) || "-"}</span></td>
          <td class="site-badge" data-label="현장명"><span class="cell-value">${highlightKeyword(r.site_name, keyword)}</span></td>
          <td class="content-cell-wide" data-label="작업내역"><span class="cell-value">${highlightKeyword(r.content, keyword)}</span></td>
          <td class="content-cell-wide" data-label="비고"><span class="cell-value">${highlightKeyword(r.remarks, keyword)}</span></td>
        </tr>`
      )
      .join("");
  }

  overviewSearchBtn.addEventListener("click", async () => {
    overviewSearching = true;
    await runOverviewSearch();
  });
  overviewSearchInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      overviewSearching = true;
      await runOverviewSearch();
    }
  });
  overviewSearchResetBtn.addEventListener("click", async () => {
    overviewSearching = false;
    overviewSearchInput.value = "";
    overviewSearchHint.classList.add("hidden");
    await loadOverviewSummary();
  });

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  // ---------- 시작 ----------
  checkAuth();
})();
