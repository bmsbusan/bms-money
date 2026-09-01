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
  const journalFilterDone = $("#journalFilterDone");
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

  // ---------- 업무 메모 화면 요소 ----------
  const workMemosSection = $("#workMemosSection");
  const workMemoFilterSite = $("#workMemoFilterSite");
  const workMemoFilterDate = $("#workMemoFilterDate");
  const workMemoFilterDone = $("#workMemoFilterDone");
  const workMemoFilterResetBtn = $("#workMemoFilterResetBtn");
  const addWorkMemoBtn = $("#addWorkMemoBtn");
  const workMemoAddForm = $("#workMemoAddForm");
  const newWorkMemoDate = $("#newWorkMemoDate");
  const newWorkMemoSite = $("#newWorkMemoSite");
  const newWorkMemoContent = $("#newWorkMemoContent");
  const newWorkMemoDone = $("#newWorkMemoDone");
  const saveWorkMemoBtn = $("#saveWorkMemoBtn");
  const cancelWorkMemoBtn = $("#cancelWorkMemoBtn");
  const workMemoAddError = $("#workMemoAddError");
  const workMemoBody = $("#workMemoBody");
  const workMemoEmptyMsg = $("#workMemoEmptyMsg");

  // ---------- 경리 업무일지 화면 요소 ----------
  const accountingSection = $("#accountingSection");
  const accountingFilterSite = $("#accountingFilterSite");
  const accountingFilterDate = $("#accountingFilterDate");
  const accountingFilterDone = $("#accountingFilterDone");
  const accountingFilterResetBtn = $("#accountingFilterResetBtn");
  const addAccountingBtn = $("#addAccountingBtn");
  const accountingAddForm = $("#accountingAddForm");
  const newAccountingDate = $("#newAccountingDate");
  const newAccountingSite = $("#newAccountingSite");
  const newAccountingContent = $("#newAccountingContent");
  const newAccountingDue = $("#newAccountingDue");
  const newAccountingDone = $("#newAccountingDone");
  const saveAccountingBtn = $("#saveAccountingBtn");
  const cancelAccountingBtn = $("#cancelAccountingBtn");
  const accountingAddError = $("#accountingAddError");
  const accountingBody = $("#accountingBody");
  const accountingEmptyMsg = $("#accountingEmptyMsg");
  const accountingListHint = $("#accountingListHint");
  const accountingDayPicker = $("#accountingDayPicker");
  const downloadAccountingBtn = $("#downloadAccountingBtn");
  const downloadAccountingTxtBtn = $("#downloadAccountingTxtBtn");
  const accountingExportError = $("#accountingExportError");

  // ---------- 경리 업무일지 조회 화면 요소 ----------
  const accountingOverviewSection = $("#accountingOverviewSection");
  const acctOverviewModeMonthBtn = $("#acctOverviewModeMonthBtn");
  const acctOverviewModeYearBtn = $("#acctOverviewModeYearBtn");
  const acctOverviewPeriodHeader = $("#acctOverviewPeriodHeader");
  const acctOverviewFilterSite = $("#acctOverviewFilterSite");
  const acctOverviewFilterDone = $("#acctOverviewFilterDone");
  const acctOverviewSearchInput = $("#acctOverviewSearchInput");
  const acctOverviewSearchBtn = $("#acctOverviewSearchBtn");
  const acctOverviewSearchResetBtn = $("#acctOverviewSearchResetBtn");
  const acctOverviewSearchHint = $("#acctOverviewSearchHint");
  const acctOverviewTable = $("#acctOverviewTable");
  const acctOverviewBody = $("#acctOverviewBody");
  const acctOverviewSearchTable = $("#acctOverviewSearchTable");
  const acctOverviewSearchBody = $("#acctOverviewSearchBody");
  const acctOverviewEmptyMsg = $("#acctOverviewEmptyMsg");

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
  const followupViewListBtn = $("#followupViewListBtn");
  const followupViewCalendarBtn = $("#followupViewCalendarBtn");
  const followupListView = $("#followupListView");
  const followupCalendarView = $("#followupCalendarView");
  const followupCalPrevBtn = $("#followupCalPrevBtn");
  const followupCalNextBtn = $("#followupCalNextBtn");
  const followupCalTodayBtn = $("#followupCalTodayBtn");
  const followupCalTitle = $("#followupCalTitle");
  const followupCalDays = $("#followupCalDays");
  const followupCalNoDueWrap = $("#followupCalNoDueWrap");
  const followupCalNoDueList = $("#followupCalNoDueList");
  const followupCalDetail = $("#followupCalDetail");
  const followupCalDetailTitle = $("#followupCalDetailTitle");
  const followupCalAddForDateBtn = $("#followupCalAddForDateBtn");
  const followupCalDetailList = $("#followupCalDetailList");
  const followupCalDetailEmpty = $("#followupCalDetailEmpty");

  // ---------- 현장별 계좌번호 정리 화면 요소 ----------
  const siteAccountsSection = $("#siteAccountsSection");
  const siteAccountsSearchInput = $("#siteAccountsSearchInput");
  const siteAccountsSearchResetBtn = $("#siteAccountsSearchResetBtn");
  const addSiteAccountBtn = $("#addSiteAccountBtn");
  const siteAccountAddForm = $("#siteAccountAddForm");
  const newSiteAccountSite = $("#newSiteAccountSite");
  const newSiteAccountBank = $("#newSiteAccountBank");
  const newSiteAccountHolder = $("#newSiteAccountHolder");
  const newSiteAccountNumber = $("#newSiteAccountNumber");
  const saveSiteAccountBtn = $("#saveSiteAccountBtn");
  const cancelSiteAccountBtn = $("#cancelSiteAccountBtn");
  const siteAccountAddError = $("#siteAccountAddError");
  const siteAccountsBody = $("#siteAccountsBody");
  const siteAccountsEmptyMsg = $("#siteAccountsEmptyMsg");

  // ---------- 현장별 1년 스케줄표 화면 요소 ----------
  const siteSchedulesSection = $("#siteSchedulesSection");
  const scheduleFilterSite = $("#scheduleFilterSite");
  const scheduleFilterTag = $("#scheduleFilterTag");
  const scheduleSearchInput = $("#scheduleSearchInput");
  const scheduleSearchResetBtn = $("#scheduleSearchResetBtn");
  const addScheduleBtn = $("#addScheduleBtn");
  const scheduleAddForm = $("#scheduleAddForm");
  const newScheduleSite = $("#newScheduleSite");
  const newScheduleCategory = $("#newScheduleCategory");
  const newScheduleRemarks = $("#newScheduleRemarks");
  const newScheduleDue = $("#newScheduleDue");
  const newScheduleAmount = $("#newScheduleAmount");
  const newScheduleFeeNote = $("#newScheduleFeeNote");
  const newScheduleTag = $("#newScheduleTag");
  const saveScheduleBtn = $("#saveScheduleBtn");
  const cancelScheduleBtn = $("#cancelScheduleBtn");
  const scheduleAddError = $("#scheduleAddError");
  const scheduleViewListBtn = $("#scheduleViewListBtn");
  const scheduleViewCalendarBtn = $("#scheduleViewCalendarBtn");
  const scheduleListView = $("#scheduleListView");
  const scheduleCalendarView = $("#scheduleCalendarView");
  const scheduleBody = $("#scheduleBody");
  const scheduleEmptyMsg = $("#scheduleEmptyMsg");
  const scheduleCalPrevBtn = $("#scheduleCalPrevBtn");
  const scheduleCalNextBtn = $("#scheduleCalNextBtn");
  const scheduleCalTodayBtn = $("#scheduleCalTodayBtn");
  const scheduleCalTitle = $("#scheduleCalTitle");
  const scheduleCalDays = $("#scheduleCalDays");
  const scheduleCalNoDueWrap = $("#scheduleCalNoDueWrap");
  const scheduleCalNoDueList = $("#scheduleCalNoDueList");
  const scheduleCalDetail = $("#scheduleCalDetail");
  const scheduleCalDetailTitle = $("#scheduleCalDetailTitle");
  const scheduleCalAddForDateBtn = $("#scheduleCalAddForDateBtn");
  const scheduleCalDetailList = $("#scheduleCalDetailList");
  const scheduleCalDetailEmpty = $("#scheduleCalDetailEmpty");

  // ---------- 작업내역 조회 화면 요소 ----------
  const overviewSection = $("#overviewSection");
  const overviewModeMonthBtn = $("#overviewModeMonthBtn");
  const overviewModeYearBtn = $("#overviewModeYearBtn");
  const overviewPeriodHeader = $("#overviewPeriodHeader");
  const overviewFilterSite = $("#overviewFilterSite");
  const overviewFilterType = $("#overviewFilterType");
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
  let activeTab = "작업내역"; // "작업내역" | "소독" | "저수조청소" | "history" | "journal" | "workMemos" | "accounting" | "accountingOverview" | "followup" | "overview" | "siteAccounts" | "siteSchedules"
  let historyRows = [];
  let expandedMonths = new Set();
  let historyMode = "month"; // "month" | "year"
  let sortKey = null; // null | "site_name" | "work_date"
  let sortDir = "asc"; // "asc" | "desc"

  // 업무일지 상태
  let journalEntries = [];
  let editingJournalId = null;

  // 업무 메모 상태
  let workMemoEntries = [];
  let editingWorkMemoId = null;

  // 경리 업무일지 상태
  let accountingEntries = [];
  let editingAccountingId = null;

  // 경리 업무일지 조회 상태
  let acctOverviewSummaryRows = [];
  let acctOverviewSearchResults = [];
  let acctOverviewMode = "month"; // "month" | "year"
  let acctOverviewExpandedPeriods = new Set();
  // 기본 화면은 "전체 목록"입니다(월별/연간 집계는 "월별"/"연도별" 버튼을 눌렀을 때만 보여줍니다).
  let acctOverviewSearching = true;
  let acctOverviewDrilldownMonth = ""; // 월별 집계에서 현장별 상세를 눌러 들어왔을 때의 월(YYYY-MM)

  // 후속 작업 상태
  let followupEntries = [];
  let editingFollowupId = null;
  let followupView = "list"; // "list" | "calendar"
  let followupCalYear = new Date().getFullYear();
  let followupCalMonth = new Date().getMonth() + 1; // 1~12
  let followupCalSelectedDate = null; // "YYYY-MM-DD" | null

  // 작업내역 조회 상태
  let overviewSummaryRows = [];
  let overviewSearchResults = [];
  let overviewMode = "month"; // "month" | "year"
  let overviewExpandedPeriods = new Set();
  // 기본값을 true로 두어, 탭을 열면 "검색" 버튼을 누르지 않아도 바로 전체 내역 목록이 보이게 합니다.
  let overviewSearching = true;
  let overviewDrilldownMonth = ""; // 월별 집계에서 현장별 상세를 눌러 들어왔을 때의 월(YYYY-MM)

  // 현장별 계좌번호 정리 상태
  let siteAccounts = [];
  let editingSiteAccountId = null;
  let siteAccountsKeyword = "";
  let siteAccountCopiedTimers = new Map(); // id -> setTimeout id ("복사됨!" 버튼 상태를 되돌리는 타이머)
  let siteAccountAmounts = new Map(); // id -> 입력 중인 납부금액 문자열(다른 행 수정 등으로 표가 다시 그려져도 유지)

  // 현장별 1년 스케줄표 상태
  const SCHEDULE_TAGS = ["보험", "건물 점검", "설비 점검", "소독", "저수조청소", "세금", "기타"];
  let scheduleEntries = [];
  let editingScheduleId = null;
  let scheduleView = "list"; // "list" | "calendar"
  let scheduleCalYear = new Date().getFullYear();
  let scheduleCalMonth = new Date().getMonth() + 1; // 1~12
  let scheduleCalSelectedDate = null; // "YYYY-MM-DD" | null

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
      workMemos: workMemosSection,
      accounting: accountingSection,
      accountingOverview: accountingOverviewSection,
      followup: followupSection,
      overview: overviewSection,
      siteAccounts: siteAccountsSection,
      siteSchedules: siteSchedulesSection,
    };
    listSection.classList.toggle("hidden", !CATEGORIES.includes(tab));
    Object.entries(sectionsByTab).forEach(([key, el]) => {
      el.classList.toggle("hidden", key !== tab);
    });

    if (tab === "history") {
      loadMonthlySummary();
    } else if (tab === "journal") {
      loadJournal();
    } else if (tab === "workMemos") {
      loadWorkMemos();
    } else if (tab === "accounting") {
      loadAccounting();
    } else if (tab === "accountingOverview") {
      loadAccountingOverview();
    } else if (tab === "followup") {
      loadFollowups();
    } else if (tab === "overview") {
      loadOverview();
    } else if (tab === "siteAccounts") {
      loadSiteAccounts();
    } else if (tab === "siteSchedules") {
      loadSchedules();
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
    } else if (activeTab === "workMemos") {
      if (editingWorkMemoId === null) loadWorkMemos();
    } else if (activeTab === "accounting") {
      if (editingAccountingId === null) loadAccounting();
    } else if (activeTab === "accountingOverview") {
      loadAccountingOverview();
    } else if (activeTab === "followup") {
      if (editingFollowupId === null) loadFollowups();
    } else if (activeTab === "overview") {
      loadOverview();
    } else if (activeTab === "siteAccounts") {
      // 이 탭은 계좌번호 드래그(텍스트 선택)나 납부금액 입력 중에 표가 통째로
      // 다시 그려지면 선택/입력이 끊기는 문제가 있어(자동 새로고침 주기와 겹침),
      // 다른 탭과 달리 5초 자동 새로고침 대상에서 제외합니다. 데이터는 탭을 다시
      // 열거나 검색/추가/수정/삭제 시 그때그때 최신으로 불러옵니다.
    } else if (activeTab === "siteSchedules") {
      // 이 탭도 업체명·비고 등 텍스트를 드래그해서 복사하는 경우가 많을 것으로 보여
      // (현장별 계좌번호 정리 탭과 같은 이유로) 5초 자동 새로고침 대상에서 제외합니다.
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
    sites.sort((a, b) => a.name.localeCompare(b.name, "ko"));
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
      [workMemoFilterSite, filterOpts],
      [newWorkMemoSite, pickOpts],
      [accountingFilterSite, filterOpts],
      [newAccountingSite, pickOpts],
      [acctOverviewFilterSite, filterOpts],
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
          <span class="cell-value">${toggleChipHtml("toggle-billed", r.id, r.billed)}</span>
        </td>
        <td class="col-check" data-label="입금">
          <span class="cell-value">${toggleChipHtml("toggle-paid", r.id, r.paid)}</span>
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
          <span class="cell-value">${toggleChipEditHtml("billed", r.billed)}</span>
        </td>
        <td class="col-check" data-label="입금">
          <span class="cell-value">${toggleChipEditHtml("paid", r.paid)}</span>
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
    if (journalFilterDone.value !== "") params.set("done", journalFilterDone.value);
    const data = await api(`/api/journal?${params.toString()}`);
    journalEntries = data.entries;
    // 새 업무를 추가해도 항상 현장명 가나다순으로 보이도록 정렬합니다.
    journalEntries.sort((a, b) => a.site_name.localeCompare(b.site_name, "ko"));
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
  journalFilterDone.addEventListener("change", loadJournal);
  journalFilterResetBtn.addEventListener("click", () => {
    journalFilterSite.value = "";
    journalFilterMonth.value = "";
    journalFilterDone.value = "";
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
      .map((r, i) => (editingJournalId === r.id ? journalEditRowHtml(r, i) : journalViewRowHtml(r, i)))
      .join("");
  }

  function journalViewRowHtml(r, i) {
    return `
      <tr class="${r.done ? "paid-row" : ""}" data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td class="col-date" data-label="작업일"><span class="cell-value">${escapeHtml(r.work_date) || "-"}${
          r.carried_from
            ? ` <span class="carried-badge" title="원래 작업일: ${escapeHtml(r.carried_from)}">이월</span>`
            : ""
        }</span></td>
        <td class="site-badge" data-label="현장명"><span class="cell-value">${escapeHtml(r.site_name)}</span></td>
        <td class="content-cell-wide" data-label="작업내역"><span class="cell-value">${escapeHtml(r.content) || "-"}</span></td>
        <td class="content-cell-wide" data-label="비고"><span class="cell-value">${escapeHtml(r.remarks) || "-"}</span></td>
        <td class="col-check" data-label="완료">
          <span class="cell-value">${toggleChipHtml("toggle-journal-done", r.id, r.done)}</span>
        </td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-ghost btn-sm" data-action="edit-journal" data-id="${r.id}">수정</button>
            <button class="btn btn-danger btn-sm" data-action="delete-journal" data-id="${r.id}">삭제</button>
          </span>
        </td>
      </tr>`;
  }

  function journalEditRowHtml(r, i) {
    const siteOpts = sites
      .map((s) => `<option value="${escapeHtml(s.name)}" ${s.name === r.site_name ? "selected" : ""}>${escapeHtml(s.name)}</option>`)
      .join("");
    return `
      <tr data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td class="col-date" data-label="작업일"><input class="edit-input" type="date" data-edit="work_date" value="${r.work_date || ""}" /></td>
        <td data-label="현장명"><select class="edit-input" data-edit="site_name">${siteOpts}</select></td>
        <td data-label="작업내역"><input class="edit-input" data-edit="content" value="${escapeHtml(r.content)}" /></td>
        <td data-label="비고"><input class="edit-input" data-edit="remarks" value="${escapeHtml(r.remarks)}" /></td>
        <td class="col-check" data-label="완료">
          <span class="cell-value">${toggleChipEditHtml("done", r.done)}</span>
        </td>
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
        done: row.querySelector('[data-edit="done"]').checked,
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

  journalBody.addEventListener("change", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (action === "toggle-journal-done" && id) {
      try {
        await api(`/api/journal/${id}`, { method: "PUT", body: JSON.stringify({ done: e.target.checked }) });
        await loadJournal();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  // ---- 주간 / 월간 시설 작업일지 엑셀 다운로드 (회사 공식 양식 그대로 재현) ----

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

  // ===== 엑셀 스타일 상수 (비엠에스코리아 부산지사 공식 "시설 관리 작업일지" 양식 기준) =====
  const XLS_FONT = "맑은 고딕";
  const XLS_NAVY = "FF1F3864";
  const XLS_GRAY_TEXT = "FF404040";
  const XLS_WHITE = "FFFFFFFF";
  const XLS_HEADER_FILL = "FF2F5597";
  const XLS_BAR_FILL = "FF1F3864";
  const XLS_LABEL_FILL = "FFD9E2F3";
  const XLS_SAT_FILL = "FFEAF1FB";
  const XLS_SAT_TEXT = "FF1F4E79";
  const XLS_SUN_FILL = "FFFDECEC";
  const XLS_SUN_TEXT = "FFC00000";
  const XLS_NOTE_FILL = "FFF2F2F2";
  const XLS_WEEKDAY_KR = ["일", "월", "화", "수", "목", "금", "토"];
  const XLS_THIN = { style: "thin" };
  const XLS_MED = { style: "medium" };
  const XLS_HAIR = { style: "hair" };
  const xlsAllThin = () => ({ top: XLS_THIN, bottom: XLS_THIN, left: XLS_THIN, right: XLS_THIN });

  function xlsStyleCell(cell, opts) {
    // 참고: ExcelJS의 세로 정렬 값은 "center"가 아니라 "middle"입니다("center"를 넣으면
    // 조용히 무시되어 세로 정렬이 전혀 적용되지 않습니다) — 기본값을 "middle"로 둡니다.
    const { size = 10, bold = false, color = "FF000000", fill, align = "left", valign = "middle", wrap = false, border } = opts || {};
    cell.font = { name: XLS_FONT, size, bold, color: { argb: color } };
    cell.alignment = { horizontal: align, vertical: valign, wrapText: !!wrap };
    if (fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
    if (border) cell.border = border;
  }

  function xlsDayStyle(dow) {
    // dow: 0=일 ... 6=토 (JS Date.getUTCDay 기준)
    if (dow === 0) return { fill: XLS_SUN_FILL, text: XLS_SUN_TEXT, bold: true };
    if (dow === 6) return { fill: XLS_SAT_FILL, text: XLS_SAT_TEXT, bold: true };
    return { fill: XLS_WHITE, text: "FF000000", bold: false };
  }

  function groupJournalByDate(rows) {
    const map = new Map();
    (rows || []).forEach((r) => {
      const d = r.work_date || "";
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(r);
    });
    return map;
  }

  function combineJournalDay(entriesForDay) {
    if (!entriesForDay || entriesForDay.length === 0) return { site: "", content: "", remarks: "" };
    if (entriesForDay.length === 1) {
      const e = entriesForDay[0];
      return { site: e.site_name || "", content: e.content || "", remarks: e.remarks || "" };
    }
    return {
      site: entriesForDay.map((e, i) => `${i + 1}) ${e.site_name || ""}`).join("\n"),
      content: entriesForDay.map((e, i) => `${i + 1}) ${e.content || ""}`).join("\n"),
      remarks: entriesForDay.some((e) => e.remarks)
        ? entriesForDay.map((e, i) => `${i + 1}) ${e.remarks || "-"}`).join("\n")
        : "",
    };
  }

  function buildMonthWeekBlocks(year, month) {
    // month: 1~12. 해당 월의 날짜들을 "월요일 시작" 주 단위로 묶는다 (마지막 주는 월말에서 자름).
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const blocks = [];
    let current = [];
    for (let d = 1; d <= lastDay; d++) {
      const dow = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
      current.push({ y: year, m: month, d, dow });
      if (dow === 0 || d === lastDay) {
        blocks.push(current);
        current = [];
      }
    }
    return blocks;
  }

  async function xlsDownloadBlob(workbook, filename) {
    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---- 월간 시설 작업일지 (한 시트에 그 달 전체 주차별 표) ----
  async function buildMonthlyJournalWorkbook(rows, year, month, siteLabel) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("작업일지", { views: [{ showGridLines: false }] });
    ws.columns = [{ width: 11.5 }, { width: 18 }, { width: 30 }, { width: 13 }];
    ws.pageSetup = {
      paperSize: 9, // A4
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      margins: { left: 0.35, right: 0.35, top: 0.35, bottom: 0.3, header: 0.5, footer: 0.5 },
    };
    const byDate = groupJournalByDate(rows);

    let r = 1;
    ws.mergeCells(r, 1, r, 4);
    ws.getCell(r, 1).value = "시 설 관 리 작 업 일 지";
    xlsStyleCell(ws.getCell(r, 1), { size: 18, bold: true, color: XLS_NAVY, align: "center" });
    ws.getRow(r).height = 34;
    r++;

    ws.mergeCells(r, 1, r, 4);
    ws.getCell(r, 1).value = `${year}년 ${month}월${siteLabel ? `  (현장: ${siteLabel})` : ""}`;
    xlsStyleCell(ws.getCell(r, 1), { size: 12, bold: true, color: XLS_GRAY_TEXT, align: "center" });
    ws.getRow(r).height = 22;
    r++;

    r++; // 여백 줄

    ws.mergeCells(r, 2, r, 4);
    ws.getCell(r, 1).value = "소  속";
    xlsStyleCell(ws.getCell(r, 1), { size: 10, bold: true, color: XLS_NAVY, fill: XLS_LABEL_FILL, align: "center", border: xlsAllThin() });
    ws.getCell(r, 2).value = "비엠에스코리아 부산지사";
    xlsStyleCell(ws.getCell(r, 2), { size: 10, bold: true, align: "left", border: xlsAllThin() });
    ws.getRow(r).height = 21;
    r++;

    ws.mergeCells(r, 2, r, 4);
    ws.getCell(r, 1).value = "작 성 자";
    xlsStyleCell(ws.getCell(r, 1), { size: 10, bold: true, color: XLS_NAVY, fill: XLS_LABEL_FILL, align: "center", border: xlsAllThin() });
    xlsStyleCell(ws.getCell(r, 2), { size: 10, bold: false, align: "left", border: xlsAllThin() });
    ws.getRow(r).height = 21;
    r++;

    r++; // 여백 줄

    const headers = ["날  짜", "현 장 명", "작 업 내 용", "비          고"];
    headers.forEach((h, i) => {
      const c = ws.getCell(r, i + 1);
      c.value = h;
      xlsStyleCell(c, {
        size: 11, bold: true, color: XLS_WHITE, fill: XLS_HEADER_FILL, align: "center",
        border: { top: XLS_MED, bottom: XLS_MED, left: i === 0 ? XLS_MED : XLS_THIN, right: i === headers.length - 1 ? XLS_MED : XLS_THIN },
      });
    });
    ws.getRow(r).height = 24;
    r++;

    const blocks = buildMonthWeekBlocks(year, month);
    blocks.forEach((block, idx) => {
      const first = block[0];
      const last = block[block.length - 1];
      ws.mergeCells(r, 1, r, 4);
      ws.getCell(r, 1).value = `제${idx + 1}주    ${first.m}/${first.d}(${XLS_WEEKDAY_KR[first.dow]})  ~  ${last.m}/${last.d}(${XLS_WEEKDAY_KR[last.dow]})`;
      xlsStyleCell(ws.getCell(r, 1), {
        size: 10.5, bold: true, color: XLS_WHITE, fill: XLS_BAR_FILL, align: "left",
        border: { top: XLS_MED, bottom: XLS_MED, left: XLS_MED, right: XLS_THIN },
      });
      ws.getRow(r).height = 20;
      r++;

      block.forEach((day) => {
        const ds = xlsDayStyle(day.dow);
        const key = `${day.y}-${String(day.m).padStart(2, "0")}-${String(day.d).padStart(2, "0")}`;
        const combo = combineJournalDay(byDate.get(key));

        ws.getCell(r, 1).value = `${day.m}/${day.d} (${XLS_WEEKDAY_KR[day.dow]})`;
        xlsStyleCell(ws.getCell(r, 1), {
          size: 10, bold: ds.bold, color: ds.text, fill: ds.fill, align: "center",
          border: { top: XLS_HAIR, bottom: XLS_HAIR, left: XLS_MED, right: XLS_THIN },
        });
        ws.getCell(r, 2).value = combo.site;
        xlsStyleCell(ws.getCell(r, 2), {
          size: 10, fill: ds.fill, align: "left", wrap: combo.site.includes("\n"),
          border: { top: XLS_HAIR, bottom: XLS_HAIR, left: XLS_THIN, right: XLS_THIN },
        });
        ws.getCell(r, 3).value = combo.content;
        xlsStyleCell(ws.getCell(r, 3), {
          size: 10, fill: ds.fill, align: "left", wrap: true,
          border: { top: XLS_HAIR, bottom: XLS_HAIR, left: XLS_THIN, right: XLS_THIN },
        });
        ws.getCell(r, 4).value = combo.remarks;
        xlsStyleCell(ws.getCell(r, 4), {
          size: 10, fill: ds.fill, align: "left", wrap: true,
          border: { top: XLS_HAIR, bottom: XLS_HAIR, left: XLS_THIN, right: XLS_MED },
        });
        ws.getRow(r).height = 20;
        r++;
      });

      ws.getCell(r, 1).value = "주간 특이사항";
      xlsStyleCell(ws.getCell(r, 1), {
        size: 9, bold: true, color: XLS_NAVY, fill: XLS_NOTE_FILL, align: "center",
        border: { top: XLS_THIN, bottom: XLS_MED, left: XLS_MED, right: XLS_THIN },
      });
      ws.mergeCells(r, 2, r, 4);
      xlsStyleCell(ws.getCell(r, 2), {
        size: 11, align: "left", fill: XLS_NOTE_FILL, wrap: true,
        border: { top: XLS_THIN, bottom: XLS_MED, left: XLS_THIN, right: XLS_THIN },
      });
      ws.getRow(r).height = 22;
      r++;
    });

    r++; // 여백 줄

    ws.mergeCells(r, 1, r, 4);
    ws.getCell(r, 1).value = `${year}년        월        일`;
    xlsStyleCell(ws.getCell(r, 1), { size: 11, bold: true, align: "center" });
    ws.getRow(r).height = 26;
    r++;

    ws.mergeCells(r, 1, r, 4);
    ws.getCell(r, 1).value = "비엠에스코리아 부산지사";
    xlsStyleCell(ws.getCell(r, 1), { size: 13, bold: true, color: XLS_NAVY, align: "center" });
    ws.getRow(r).height = 26;
    r++;

    r++; // 여백 줄

    ws.getCell(r, 1).value = "작 성 자";
    xlsStyleCell(ws.getCell(r, 1), { size: 9.5, bold: true, color: XLS_NAVY, fill: XLS_LABEL_FILL, align: "center", border: xlsAllThin() });
    xlsStyleCell(ws.getCell(r, 2), { size: 11, align: "left", border: xlsAllThin() });
    ws.getCell(r, 3).value = "대  표";
    xlsStyleCell(ws.getCell(r, 3), { size: 9.5, bold: true, color: XLS_NAVY, fill: XLS_LABEL_FILL, align: "center", border: xlsAllThin() });
    xlsStyleCell(ws.getCell(r, 4), { size: 11, align: "left", border: xlsAllThin() });
    ws.getRow(r).height = 30;

    ws.pageSetup.printArea = `A1:D${r}`;

    return wb;
  }

  // ---- 주간 시설 작업일지 (선택한 한 주(월~일)만 상세하게 담은 표) ----
  async function buildWeeklyJournalWorkbook(rows, range, siteLabel) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("작업일지", { views: [{ showGridLines: false }] });
    ws.columns = [{ width: 10.5 }, { width: 6.5 }, { width: 16.5 }, { width: 27 }, { width: 22.5 }];
    ws.pageSetup = {
      paperSize: 9, // A4
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      margins: { left: 0.3, right: 0.3, top: 0.35, bottom: 0.3, header: 0.1, footer: 0.1 },
    };
    const byDate = groupJournalByDate(rows);

    const days = [];
    const cursor = new Date(`${range.from}T00:00:00Z`);
    const endD = new Date(`${range.to}T00:00:00Z`);
    while (cursor <= endD) {
      days.push({
        y: cursor.getUTCFullYear(),
        m: cursor.getUTCMonth() + 1,
        d: cursor.getUTCDate(),
        dow: cursor.getUTCDay(),
        iso: cursor.toISOString().slice(0, 10),
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    const first = days[0];
    const last = days[days.length - 1];
    const titleMonth = first.m === last.m ? `${first.y}년 ${first.m}월` : `${first.y}년 ${first.m}월~${last.m}월`;

    let r = 1;
    ws.mergeCells(r, 1, r, 5);
    ws.getCell(r, 1).value = "시 설 관 리 작 업 일 지";
    xlsStyleCell(ws.getCell(r, 1), { size: 20, bold: true, color: XLS_NAVY, align: "center" });
    ws.getRow(r).height = 36;
    r++;

    ws.mergeCells(r, 1, r, 5);
    ws.getCell(r, 1).value = `${titleMonth}  (${range.from} ~ ${range.to})${siteLabel ? `  현장: ${siteLabel}` : ""}`;
    xlsStyleCell(ws.getCell(r, 1), { size: 13, bold: true, color: XLS_GRAY_TEXT, align: "center" });
    ws.getRow(r).height = 24;
    r++;

    ws.mergeCells(r, 2, r, 5);
    ws.getCell(r, 1).value = "소  속";
    xlsStyleCell(ws.getCell(r, 1), { size: 10.5, bold: true, color: XLS_NAVY, fill: XLS_LABEL_FILL, align: "center", border: xlsAllThin() });
    ws.getCell(r, 2).value = "비엠에스코리아 부산지사";
    xlsStyleCell(ws.getCell(r, 2), { size: 10.5, bold: true, align: "left", border: xlsAllThin() });
    ws.getRow(r).height = 22;
    r++;

    ws.mergeCells(r, 2, r, 5);
    ws.getCell(r, 1).value = "작 성 자";
    xlsStyleCell(ws.getCell(r, 1), { size: 10.5, bold: true, color: XLS_NAVY, fill: XLS_LABEL_FILL, align: "center", border: xlsAllThin() });
    xlsStyleCell(ws.getCell(r, 2), { size: 10.5, align: "left", border: xlsAllThin() });
    ws.getRow(r).height = 22;
    r++;

    ws.getRow(r).height = 8;
    r++;

    const headers = ["날  짜", "요일", "현 장 명", "작 업 내 용", "비          고"];
    headers.forEach((h, i) => {
      const c = ws.getCell(r, i + 1);
      c.value = h;
      xlsStyleCell(c, {
        size: 11.5, bold: true, color: XLS_WHITE, fill: XLS_HEADER_FILL, align: "center",
        border: { top: XLS_MED, bottom: XLS_MED, left: i === 0 ? XLS_MED : XLS_THIN, right: i === headers.length - 1 ? XLS_MED : XLS_THIN },
      });
    });
    ws.getRow(r).height = 28;
    r++;

    ws.mergeCells(r, 1, r, 5);
    ws.getCell(r, 1).value = `${first.m}. ${first.d}(${XLS_WEEKDAY_KR[first.dow]})   ~   ${last.m}. ${last.d}(${XLS_WEEKDAY_KR[last.dow]})`;
    xlsStyleCell(ws.getCell(r, 1), {
      size: 12, bold: true, color: XLS_WHITE, fill: XLS_BAR_FILL, align: "left",
      border: { top: XLS_MED, bottom: XLS_MED, left: XLS_MED, right: XLS_THIN },
    });
    ws.getRow(r).height = 28;
    r++;

    days.forEach((day) => {
      const isWeekend = day.dow === 0 || day.dow === 6;
      const ds = xlsDayStyle(day.dow);
      const combo = combineJournalDay(byDate.get(day.iso));

      ws.getCell(r, 1).value = `${day.m} / ${day.d}`;
      xlsStyleCell(ws.getCell(r, 1), {
        size: 12, bold: ds.bold, color: ds.text, fill: ds.fill, align: "center",
        border: { top: XLS_THIN, bottom: XLS_THIN, left: XLS_MED, right: XLS_THIN },
      });
      ws.getCell(r, 2).value = XLS_WEEKDAY_KR[day.dow];
      xlsStyleCell(ws.getCell(r, 2), {
        size: isWeekend ? 12 : 11, bold: isWeekend, color: ds.text, fill: ds.fill, align: "center",
        border: { top: XLS_THIN, bottom: XLS_THIN, left: XLS_THIN, right: XLS_THIN },
      });
      ws.getCell(r, 3).value = combo.site;
      xlsStyleCell(ws.getCell(r, 3), {
        size: 11, fill: ds.fill, align: "center", wrap: combo.site.includes("\n"),
        border: { top: XLS_THIN, bottom: XLS_THIN, left: XLS_THIN, right: XLS_THIN },
      });
      ws.getCell(r, 4).value = combo.content;
      xlsStyleCell(ws.getCell(r, 4), {
        size: 11, fill: ds.fill, align: "left", wrap: true,
        border: { top: XLS_THIN, bottom: XLS_THIN, left: XLS_THIN, right: XLS_THIN },
      });
      ws.getCell(r, 5).value = combo.remarks;
      xlsStyleCell(ws.getCell(r, 5), {
        size: 11, fill: ds.fill, align: "left", wrap: true,
        border: { top: XLS_THIN, bottom: XLS_THIN, left: XLS_THIN, right: XLS_MED },
      });
      ws.getRow(r).height = 72;
      r++;
    });

    ws.getCell(r, 1).value = "주간\n특이사항";
    xlsStyleCell(ws.getCell(r, 1), {
      size: 10, bold: true, color: XLS_NAVY, fill: XLS_NOTE_FILL, align: "center", wrap: true,
      border: { top: XLS_MED, bottom: XLS_THIN, left: XLS_MED, right: XLS_THIN },
    });
    ws.mergeCells(r, 2, r, 5);
    xlsStyleCell(ws.getCell(r, 2), {
      size: 11, align: "left", valign: "top", wrap: true, fill: XLS_NOTE_FILL,
      border: { top: XLS_MED, bottom: XLS_THIN, left: XLS_THIN, right: XLS_THIN },
    });
    ws.getRow(r).height = 62;
    r++;

    ws.getCell(r, 1).value = "작 성 자";
    xlsStyleCell(ws.getCell(r, 1), {
      size: 10, bold: true, color: XLS_NAVY, fill: XLS_LABEL_FILL, align: "center",
      border: { top: XLS_THIN, bottom: XLS_MED, left: XLS_MED, right: XLS_THIN },
    });
    xlsStyleCell(ws.getCell(r, 2), { size: 11, align: "left", border: { top: XLS_THIN, bottom: XLS_MED, left: XLS_THIN, right: XLS_THIN } });
    ws.getCell(r, 3).value = "대     표";
    xlsStyleCell(ws.getCell(r, 3), {
      size: 10, bold: true, color: XLS_NAVY, fill: XLS_LABEL_FILL, align: "center",
      border: { top: XLS_THIN, bottom: XLS_MED, left: XLS_THIN, right: XLS_THIN },
    });
    ws.mergeCells(r, 4, r, 5);
    xlsStyleCell(ws.getCell(r, 4), { size: 11, align: "left", border: { top: XLS_THIN, bottom: XLS_MED, left: XLS_THIN, right: XLS_MED } });
    ws.getRow(r).height = 36;

    ws.pageSetup.printArea = `A1:E${r}`;

    return wb;
  }

  downloadWeeklyBtn.addEventListener("click", async () => {
    exportError.textContent = "";
    if (typeof ExcelJS === "undefined") {
      exportError.textContent = "엑셀 생성 라이브러리를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.";
      return;
    }
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
      const wb = await buildWeeklyJournalWorkbook(data.entries, range, journalFilterSite.value || "");
      await xlsDownloadBlob(wb, `주간시설작업일지_${range.from}_${range.to}.xlsx`);
    } catch (err) {
      exportError.textContent = err.message;
    }
  });

  downloadMonthlyBtn.addEventListener("click", async () => {
    exportError.textContent = "";
    if (typeof ExcelJS === "undefined") {
      exportError.textContent = "엑셀 생성 라이브러리를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.";
      return;
    }
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
      const [y, m] = month.split("-").map(Number);
      const wb = await buildMonthlyJournalWorkbook(data.entries, y, m, journalFilterSite.value || "");
      await xlsDownloadBlob(wb, `월간시설작업일지_${month}.xlsx`);
    } catch (err) {
      exportError.textContent = err.message;
    }
  });

  // ================= 업무 메모 (No / 작업일 / 현장 / 업무 / 완료 — 마감기한 없음) =================
  // 경리 업무일지와 같은 구성이지만 마감기한 없이 간단하게 기록하는 메모용 탭입니다.
  // 경리 업무일지의 자동 이월・지난 완료건 숨김 기능은 없고, 완료된 내역도 이 화면에서
  // (완료 필터를 "전체 상태" 또는 "완료"로 두면) 항상 그대로 조회할 수 있습니다.

  async function loadWorkMemos() {
    const params = new URLSearchParams({ sort: "desc" });
    if (workMemoFilterSite.value) params.set("site", workMemoFilterSite.value);
    if (workMemoFilterDate.value) params.set("date", workMemoFilterDate.value);
    if (workMemoFilterDone.value !== "") params.set("done", workMemoFilterDone.value);
    const data = await api(`/api/work-memos?${params.toString()}`);
    workMemoEntries = data.entries;
    // 완료된 메모가 항상 목록 맨 위로 오도록 정렬하고, 완료 여부가 같으면
    // 그 안에서는 현장명 가나다순으로 보이도록 정렬합니다(경리 업무일지와 동일한 방식).
    workMemoEntries.sort((a, b) => (b.done ? 1 : 0) - (a.done ? 1 : 0) || a.site_name.localeCompare(b.site_name, "ko"));
    renderWorkMemos();
  }

  workMemoFilterSite.addEventListener("change", loadWorkMemos);
  workMemoFilterDate.addEventListener("change", loadWorkMemos);
  workMemoFilterDone.addEventListener("change", loadWorkMemos);
  workMemoFilterResetBtn.addEventListener("click", () => {
    workMemoFilterSite.value = "";
    workMemoFilterDate.value = "";
    workMemoFilterDone.value = "";
    loadWorkMemos();
  });

  addWorkMemoBtn.addEventListener("click", () => {
    workMemoAddError.textContent = "";
    workMemoAddForm.classList.toggle("hidden");
    if (!workMemoAddForm.classList.contains("hidden") && !newWorkMemoDate.value) {
      newWorkMemoDate.value = todayStr();
    }
  });
  cancelWorkMemoBtn.addEventListener("click", () => {
    workMemoAddForm.classList.add("hidden");
    resetWorkMemoAddForm();
  });

  function resetWorkMemoAddForm() {
    newWorkMemoDate.value = todayStr();
    newWorkMemoSite.value = "";
    newWorkMemoContent.value = "";
    newWorkMemoDone.checked = false;
    workMemoAddError.textContent = "";
  }

  saveWorkMemoBtn.addEventListener("click", async () => {
    workMemoAddError.textContent = "";
    if (!newWorkMemoSite.value) { workMemoAddError.textContent = "현장을 선택해주세요."; return; }
    if (!newWorkMemoDate.value) { workMemoAddError.textContent = "작업 날짜를 선택해주세요."; return; }
    if (!newWorkMemoContent.value.trim()) { workMemoAddError.textContent = "업무 내용을 입력해주세요."; return; }
    try {
      await api("/api/work-memos", {
        method: "POST",
        body: JSON.stringify({
          work_date: newWorkMemoDate.value,
          site_name: newWorkMemoSite.value,
          content: newWorkMemoContent.value,
          done: newWorkMemoDone.checked,
        }),
      });
      workMemoAddForm.classList.add("hidden");
      resetWorkMemoAddForm();
      await loadWorkMemos();
    } catch (err) {
      workMemoAddError.textContent = err.message;
    }
  });

  function renderWorkMemos() {
    if (workMemoEntries.length === 0) {
      workMemoBody.innerHTML = "";
      workMemoEmptyMsg.classList.remove("hidden");
      return;
    }
    workMemoEmptyMsg.classList.add("hidden");
    workMemoBody.innerHTML = workMemoEntries
      .map((r, i) => (editingWorkMemoId === r.id ? workMemoEditRowHtml(r, i) : workMemoViewRowHtml(r, i)))
      .join("");
  }

  function workMemoViewRowHtml(r, i) {
    return `
      <tr class="${r.done ? "paid-row" : ""}" data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td class="col-date" data-label="작업일"><span class="cell-value">${escapeHtml(r.work_date) || "-"}</span></td>
        <td class="site-badge" data-label="현장명"><span class="cell-value">${escapeHtml(r.site_name)}</span></td>
        <td class="content-cell-wide" data-label="업무"><span class="cell-value">${escapeHtml(r.content) || "-"}</span></td>
        <td class="col-check" data-label="완료">
          <span class="cell-value">${toggleChipHtml("toggle-work-memo-done", r.id, r.done)}</span>
        </td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-ghost btn-sm" data-action="edit-work-memo" data-id="${r.id}">수정</button>
            <button class="btn btn-danger btn-sm" data-action="delete-work-memo" data-id="${r.id}">삭제</button>
          </span>
        </td>
      </tr>`;
  }

  function workMemoEditRowHtml(r, i) {
    const siteOpts = sites
      .map((s) => `<option value="${escapeHtml(s.name)}" ${s.name === r.site_name ? "selected" : ""}>${escapeHtml(s.name)}</option>`)
      .join("");
    return `
      <tr data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td class="col-date" data-label="작업일"><input class="edit-input" type="date" data-edit="work_date" value="${r.work_date || ""}" /></td>
        <td data-label="현장명"><select class="edit-input" data-edit="site_name">${siteOpts}</select></td>
        <td data-label="업무"><input class="edit-input" data-edit="content" value="${escapeHtml(r.content)}" /></td>
        <td class="col-check" data-label="완료">
          <span class="cell-value">${toggleChipEditHtml("done", r.done)}</span>
        </td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-primary btn-sm" data-action="save-edit-work-memo" data-id="${r.id}">저장</button>
            <button class="btn btn-ghost btn-sm" data-action="cancel-edit-work-memo" data-id="${r.id}">취소</button>
          </span>
        </td>
      </tr>`;
  }

  workMemoBody.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit-work-memo") {
      editingWorkMemoId = Number(id);
      renderWorkMemos();
    } else if (action === "cancel-edit-work-memo") {
      editingWorkMemoId = null;
      renderWorkMemos();
    } else if (action === "save-edit-work-memo") {
      const row = e.target.closest("tr");
      const patch = {
        work_date: row.querySelector('[data-edit="work_date"]').value || null,
        site_name: row.querySelector('[data-edit="site_name"]').value,
        content: row.querySelector('[data-edit="content"]').value,
        done: row.querySelector('[data-edit="done"]').checked,
      };
      try {
        await api(`/api/work-memos/${id}`, { method: "PUT", body: JSON.stringify(patch) });
        editingWorkMemoId = null;
        await loadWorkMemos();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === "delete-work-memo") {
      if (!confirm("이 업무 메모를 삭제할까요?")) return;
      try {
        await api(`/api/work-memos/${id}`, { method: "DELETE" });
        await loadWorkMemos();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  workMemoBody.addEventListener("change", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (action === "toggle-work-memo-done" && id) {
      try {
        await api(`/api/work-memos/${id}`, { method: "PUT", body: JSON.stringify({ done: e.target.checked }) });
        await loadWorkMemos();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  // ================= 경리 업무일지 (No / 현장 / 업무 / 마감기한 / 완료) =================

  async function loadAccounting() {
    const params = new URLSearchParams({ sort: "desc" });
    if (accountingFilterSite.value) params.set("site", accountingFilterSite.value);
    if (accountingFilterDate.value) params.set("date", accountingFilterDate.value);
    if (accountingFilterDone.value !== "") params.set("done", accountingFilterDone.value);
    // 날짜를 특정하지 않았을 때만 "지난 날짜의 완료 건 숨기기"를 서버에 요청합니다.
    // (경리 업무일지 조회 화면의 검색/집계는 이 옵션 없이 별도로 호출되므로 영향받지 않습니다.)
    if (!accountingFilterDate.value) params.set("hideOldDone", "1");
    const data = await api(`/api/accounting?${params.toString()}`);
    accountingEntries = data.entries;
    // 완료된 업무가 항상 목록 맨 위로 오도록 정렬하고, 완료 여부가 같으면
    // 그 안에서는 현장명 가나다순으로 보이도록 정렬합니다.
    accountingEntries.sort((a, b) => (b.done ? 1 : 0) - (a.done ? 1 : 0) || a.site_name.localeCompare(b.site_name, "ko"));
    renderAccounting();
    // 날짜를 특정하지 않았을 때는 지난 날짜의 "완료" 건이 자동으로 숨겨져 있다는 걸 안내하고,
    // 특정 날짜를 선택했을 때는 이월된 건도 원래 작성일 기준으로 함께 보이고 있음을 안내합니다.
    if (accountingFilterDate.value) {
      accountingListHint.textContent = `${accountingFilterDate.value} 기준 — 이월된 건은 원래 작성일로도 함께 조회됩니다.`;
    } else {
      accountingListHint.textContent = "지난 날짜에 작성된 완료 건은 자동으로 숨겨집니다. 지난 내역을 보려면 날짜를 선택하세요.";
    }
  }

  accountingFilterSite.addEventListener("change", loadAccounting);
  accountingFilterDate.addEventListener("change", loadAccounting);
  accountingFilterDone.addEventListener("change", loadAccounting);
  accountingFilterResetBtn.addEventListener("click", () => {
    accountingFilterSite.value = "";
    accountingFilterDate.value = "";
    accountingFilterDone.value = "";
    loadAccounting();
  });

  addAccountingBtn.addEventListener("click", () => {
    accountingAddError.textContent = "";
    accountingAddForm.classList.toggle("hidden");
    if (!accountingAddForm.classList.contains("hidden") && !newAccountingDate.value) {
      newAccountingDate.value = todayStr();
    }
  });
  cancelAccountingBtn.addEventListener("click", () => {
    accountingAddForm.classList.add("hidden");
    resetAccountingAddForm();
  });

  function resetAccountingAddForm() {
    newAccountingDate.value = todayStr();
    newAccountingSite.value = "";
    newAccountingContent.value = "";
    newAccountingDue.value = "";
    newAccountingDone.checked = false;
    accountingAddError.textContent = "";
  }

  saveAccountingBtn.addEventListener("click", async () => {
    accountingAddError.textContent = "";
    if (!newAccountingSite.value) { accountingAddError.textContent = "현장을 선택해주세요."; return; }
    if (!newAccountingDate.value) { accountingAddError.textContent = "작업 날짜를 선택해주세요."; return; }
    if (!newAccountingContent.value.trim()) { accountingAddError.textContent = "업무 내용을 입력해주세요."; return; }
    try {
      await api("/api/accounting", {
        method: "POST",
        body: JSON.stringify({
          work_date: newAccountingDate.value,
          site_name: newAccountingSite.value,
          content: newAccountingContent.value,
          due_date: newAccountingDue.value || null,
          done: newAccountingDone.checked,
        }),
      });
      accountingAddForm.classList.add("hidden");
      resetAccountingAddForm();
      await loadAccounting();
    } catch (err) {
      accountingAddError.textContent = err.message;
    }
  });

  function renderAccounting() {
    if (accountingEntries.length === 0) {
      accountingBody.innerHTML = "";
      accountingEmptyMsg.classList.remove("hidden");
      return;
    }
    accountingEmptyMsg.classList.add("hidden");
    accountingBody.innerHTML = accountingEntries
      .map((r, i) => (editingAccountingId === r.id ? accountingEditRowHtml(r, i) : accountingViewRowHtml(r, i)))
      .join("");
  }

  function accountingViewRowHtml(r, i) {
    return `
      <tr class="${r.done ? "paid-row" : ""}" data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td class="col-date" data-label="작업일"><span class="cell-value">${escapeHtml(r.work_date) || "-"}${
          r.carried_from
            ? ` <span class="carried-badge" title="원래 작업일: ${escapeHtml(r.carried_from)}">이월</span>`
            : ""
        }</span></td>
        <td class="site-badge" data-label="현장명"><span class="cell-value">${escapeHtml(r.site_name)}</span></td>
        <td class="content-cell-wide" data-label="업무"><span class="cell-value">${escapeHtml(r.content) || "-"}</span></td>
        <td class="col-date" data-label="마감기한"><span class="cell-value">${escapeHtml(r.due_date) || "-"}</span></td>
        <td class="col-check" data-label="완료">
          <span class="cell-value">${toggleChipHtml("toggle-accounting-done", r.id, r.done)}</span>
        </td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-ghost btn-sm" data-action="edit-accounting" data-id="${r.id}">수정</button>
            <button class="btn btn-danger btn-sm" data-action="delete-accounting" data-id="${r.id}">삭제</button>
          </span>
        </td>
      </tr>`;
  }

  function accountingEditRowHtml(r, i) {
    const siteOpts = sites
      .map((s) => `<option value="${escapeHtml(s.name)}" ${s.name === r.site_name ? "selected" : ""}>${escapeHtml(s.name)}</option>`)
      .join("");
    return `
      <tr data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td class="col-date" data-label="작업일"><input class="edit-input" type="date" data-edit="work_date" value="${r.work_date || ""}" /></td>
        <td data-label="현장명"><select class="edit-input" data-edit="site_name">${siteOpts}</select></td>
        <td data-label="업무"><input class="edit-input" data-edit="content" value="${escapeHtml(r.content)}" /></td>
        <td class="col-date" data-label="마감기한"><input class="edit-input" type="date" data-edit="due_date" value="${r.due_date || ""}" /></td>
        <td class="col-check" data-label="완료">
          <span class="cell-value">${toggleChipEditHtml("done", r.done)}</span>
        </td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-primary btn-sm" data-action="save-edit-accounting" data-id="${r.id}">저장</button>
            <button class="btn btn-ghost btn-sm" data-action="cancel-edit-accounting" data-id="${r.id}">취소</button>
          </span>
        </td>
      </tr>`;
  }

  accountingBody.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit-accounting") {
      editingAccountingId = Number(id);
      renderAccounting();
    } else if (action === "cancel-edit-accounting") {
      editingAccountingId = null;
      renderAccounting();
    } else if (action === "save-edit-accounting") {
      const row = e.target.closest("tr");
      const patch = {
        work_date: row.querySelector('[data-edit="work_date"]').value || null,
        site_name: row.querySelector('[data-edit="site_name"]').value,
        content: row.querySelector('[data-edit="content"]').value,
        due_date: row.querySelector('[data-edit="due_date"]').value || null,
        done: row.querySelector('[data-edit="done"]').checked,
      };
      try {
        await api(`/api/accounting/${id}`, { method: "PUT", body: JSON.stringify(patch) });
        editingAccountingId = null;
        await loadAccounting();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === "delete-accounting") {
      if (!confirm("이 경리 업무일지를 삭제할까요?")) return;
      try {
        await api(`/api/accounting/${id}`, { method: "DELETE" });
        await loadAccounting();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  accountingBody.addEventListener("change", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (action === "toggle-accounting-done" && id) {
      try {
        await api(`/api/accounting/${id}`, { method: "PUT", body: JSON.stringify({ done: e.target.checked }) });
        await loadAccounting();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  // ---- 경리 업무일지 엑셀 다운로드 (회사 공식 "일일 업무 일지" 양식 그대로 재현) ----

  function accountingWeekOfMonth(dateStr) {
    // 그 달의 첫 번째 월요일을 1주차의 시작으로 보고, 그 이전 며칠(월초 주말 등)은 1주차에 포함합니다.
    const d = new Date(`${dateStr}T00:00:00Z`);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const first = new Date(Date.UTC(year, month - 1, 1));
    const firstDow = first.getUTCDay(); // 0=일 ... 6=토
    const daysUntilFirstMonday = (8 - firstDow) % 7;
    const firstMonday = 1 + daysUntilFirstMonday;
    const week = day < firstMonday ? 1 : Math.floor((day - firstMonday) / 7) + 1;
    return { month, week };
  }

  function estimateAccountingRowHeight(content, charsPerLine) {
    // 엑셀 서식의 "자동 줄 높이"를 흉내내기 위한 근사치 계산입니다 (완전히 동일하지는 않음).
    const lines = String(content || "").split("\n");
    let totalLines = 0;
    lines.forEach((line) => {
      totalLines += Math.max(1, Math.ceil((line.length || 1) / charsPerLine));
    });
    return Math.max(40, totalLines * 18 + 10);
  }

  async function buildAccountingWorkbook(dateStr, entries, followupItems) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("일일업무일지", { views: [{ showGridLines: false }] });
    ws.columns = [{ width: 6 }, { width: 13.5 }, { width: 62.66 }, { width: 12.08 }, { width: 8 }];
    ws.pageSetup = {
      paperSize: 9, // A4
      orientation: "portrait",
      horizontalCentered: true,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.5, footer: 0.5 },
    };

    const { month, week } = accountingWeekOfMonth(dateStr);
    const dateObj = new Date(`${dateStr}T00:00:00Z`);

    let r = 1;
    ws.mergeCells(r, 1, r, 5);
    ws.getCell(r, 1).value = "일일 업무 일지";
    xlsStyleCell(ws.getCell(r, 1), { size: 18, bold: true, color: "FF000000", fill: "FFE6F7FE", align: "center", wrap: true });
    ws.getRow(r).height = 36;
    r++;

    ws.mergeCells(r, 1, r, 5);
    xlsStyleCell(ws.getCell(r, 1), { size: 11, fill: "FFFFFFFF", align: "center" });
    ws.getRow(r).height = 28;
    r++;

    ws.mergeCells(r, 1, r, 5);
    ws.getCell(r, 1).value = `${month}월 ${week}주차`;
    xlsStyleCell(ws.getCell(r, 1), {
      size: 12, bold: true, color: "FFFFFFFF", fill: "FF042C68", align: "center", wrap: true,
      border: { bottom: XLS_THIN },
    });
    ws.getRow(r).height = 26;
    r++;

    ws.mergeCells(r, 1, r, 5);
    const dateCell = ws.getCell(r, 1);
    dateCell.value = dateObj;
    dateCell.numFmt = "mm-dd-yy";
    xlsStyleCell(dateCell, { size: 12, bold: true, color: "FF000000", fill: "FFFFFFEB", align: "center", wrap: true, border: xlsAllThin() });
    ws.getRow(r).height = 24;
    r++;

    const headers = ["No.", "현장", "업무", "마감기한", "완료"];
    headers.forEach((h, i) => {
      const c = ws.getCell(r, i + 1);
      c.value = h;
      xlsStyleCell(c, { size: 12, bold: true, color: "FF000000", fill: "FFE6F7FE", align: "center", wrap: true, border: xlsAllThin() });
    });
    ws.getRow(r).height = 24;
    r++;

    const rowCount = Math.max(10, entries.length);
    for (let i = 0; i < rowCount; i++) {
      const e = entries[i];

      const noCell = ws.getCell(r, 1);
      noCell.value = i + 1;
      xlsStyleCell(noCell, { size: 11, bold: true, color: "FF000000", align: "center", border: xlsAllThin() });

      const siteCell = ws.getCell(r, 2);
      siteCell.value = e ? e.site_name : "";
      xlsStyleCell(siteCell, { size: 11, align: "left", wrap: true, border: xlsAllThin() });

      const contentCell = ws.getCell(r, 3);
      contentCell.value = e ? e.content : "";
      xlsStyleCell(contentCell, { size: 11, align: "left", wrap: true, border: xlsAllThin() });

      const dueCell = ws.getCell(r, 4);
      if (e && e.due_date) {
        dueCell.value = new Date(`${e.due_date}T00:00:00Z`);
        dueCell.numFmt = "mm-dd-yy";
      }
      xlsStyleCell(dueCell, { size: 11, align: "center", wrap: true, border: xlsAllThin() });

      const doneCell = ws.getCell(r, 5);
      doneCell.value = e ? (e.done ? "O" : "-") : "";
      xlsStyleCell(doneCell, { size: 11, align: "center", wrap: true, border: xlsAllThin() });

      ws.getRow(r).height = e ? estimateAccountingRowHeight(e.content, 40) : 40;
      r++;
    }

    ws.mergeCells(r, 1, r, 5);
    ws.getCell(r, 1).value = "진행 필요한 후속 업무";
    xlsStyleCell(ws.getCell(r, 1), {
      size: 12, bold: true, color: "FF000000", fill: "FFE6F7FE", align: "center", wrap: true,
      border: { top: XLS_THIN, bottom: XLS_THIN },
    });
    ws.getRow(r).height = 26;
    r++;

    for (let i = 0; i < followupItems.length; i++) {
      const f = followupItems[i];

      const noCell = ws.getCell(r, 1);
      noCell.value = i + 1;
      xlsStyleCell(noCell, { size: 11, bold: true, color: "FF000000", align: "center", wrap: true, border: xlsAllThin() });

      const siteCell = ws.getCell(r, 2);
      siteCell.value = f.site_name;
      xlsStyleCell(siteCell, { size: 11, align: "left", wrap: true, border: xlsAllThin() });

      ws.mergeCells(r, 3, r, 5);
      const contentCell = ws.getCell(r, 3);
      contentCell.value = f.content;
      xlsStyleCell(contentCell, { size: 11, align: "left", wrap: true, border: xlsAllThin() });

      ws.getRow(r).height = estimateAccountingRowHeight(f.content, 52);
      r++;
    }

    return wb;
  }

  downloadAccountingBtn.addEventListener("click", async () => {
    accountingExportError.textContent = "";
    if (typeof ExcelJS === "undefined") {
      accountingExportError.textContent = "엑셀 생성 라이브러리를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.";
      return;
    }
    const date = accountingDayPicker.value;
    if (!date) { accountingExportError.textContent = "다운로드할 날짜를 선택해주세요."; return; }
    try {
      const params = new URLSearchParams({ date, sort: "asc" });
      const data = await api(`/api/accounting?${params.toString()}`);
      const followupData = await api(`/api/followups?status=0`);
      // "후속 작업" 탭과 번호가 어긋나지 않도록, 화면과 동일하게 현장명 가나다순으로 정렬합니다.
      const followupItems = (followupData.followups || []).slice()
        .sort((a, b) => a.site_name.localeCompare(b.site_name, "ko"));
      // 화면과 동일하게, 완료된 업무가 위로 오도록 정렬한 뒤(완료 여부가 같으면 현장명 가나다순)
      // 엑셀의 No. 번호도 이 정렬된 순서를 그대로 따르게 합니다.
      const entries = (data.entries || []).slice()
        .sort((a, b) => (b.done ? 1 : 0) - (a.done ? 1 : 0) || a.site_name.localeCompare(b.site_name, "ko"));
      const wb = await buildAccountingWorkbook(date, entries, followupItems);
      await xlsDownloadBlob(wb, `일일업무일지_${date}.xlsx`);
    } catch (err) {
      accountingExportError.textContent = err.message;
    }
  });

  // 현재 화면에 표시된(필터가 적용된) 경리 업무일지 목록을 그대로
  // 맨 위 "[yyyymmdd 일일업무일지]" 제목 줄 + "번호. 현장명 / 줄바꿈 / 업무내용" 형태의
  // 텍스트 파일로 내보냅니다.
  function downloadTextBlob(text, filename) {
    // Windows 메모장 등에서 한글이 깨지지 않도록 UTF-8 BOM을 붙입니다.
    const blob = new Blob(["﻿" + text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  downloadAccountingTxtBtn.addEventListener("click", () => {
    accountingExportError.textContent = "";
    if (accountingEntries.length === 0) {
      accountingExportError.textContent = "다운로드할 목록이 없습니다.";
      return;
    }
    const dateLabel = accountingFilterDate.value || todayStr();
    const dateCompact = dateLabel.replace(/-/g, "");
    const body = accountingEntries
      .map((r, i) => `${i + 1}. ${r.site_name}\n${r.content || "-"}`)
      .join("\n\n");
    const text = `[${dateCompact} 일일업무일지]\n\n${body}`;
    downloadTextBlob(text, `경리업무일지_${dateLabel}.txt`);
  });

  // ================= 경리 업무일지 조회 (월별/연간 통합 + 검색) =================
  // "경리 업무일지"(accounting_journal) 데이터를 월별/연도별로 집계해서 보여주고,
  // 현장별 상세 드릴다운 및 현장명/업무 키워드·완료여부 검색을 제공합니다.

  async function loadAccountingOverview() {
    if (acctOverviewSearching) {
      await runAcctOverviewSearch();
    } else {
      await loadAcctOverviewSummary();
    }
  }

  async function loadAcctOverviewSummary() {
    const data = await api("/api/accounting-summary");
    acctOverviewSummaryRows = data.rows || [];
    renderAcctOverviewSummary();
  }

  async function switchAcctOverviewMode(mode) {
    acctOverviewMode = mode;
    acctOverviewModeMonthBtn.classList.toggle("subtab-active", mode === "month");
    acctOverviewModeYearBtn.classList.toggle("subtab-active", mode === "year");
    acctOverviewPeriodHeader.textContent = mode === "month" ? "월" : "연도";
    acctOverviewExpandedPeriods.clear();
    // "월별"/"연도별" 버튼은 화면을 명시적으로 집계 표로 전환합니다(기본 화면은 전체 목록입니다).
    acctOverviewSearching = false;
    await loadAcctOverviewSummary();
  }
  acctOverviewModeMonthBtn.addEventListener("click", () => switchAcctOverviewMode("month"));
  acctOverviewModeYearBtn.addEventListener("click", () => switchAcctOverviewMode("year"));
  acctOverviewFilterSite.addEventListener("change", () => {
    if (acctOverviewSearching) {
      runAcctOverviewSearch();
    } else {
      acctOverviewExpandedPeriods.clear();
      renderAcctOverviewSummary();
    }
  });
  acctOverviewFilterDone.addEventListener("change", () => {
    if (acctOverviewSearching) {
      runAcctOverviewSearch();
    } else {
      acctOverviewExpandedPeriods.clear();
      renderAcctOverviewSummary();
    }
  });

  function renderAcctOverviewSummary() {
    acctOverviewSearchTable.classList.add("hidden");
    acctOverviewTable.classList.remove("hidden");

    const siteFilter = acctOverviewFilterSite.value;
    const doneFilter = acctOverviewFilterDone.value; // "" | "0" | "1"
    const filteredRows = acctOverviewSummaryRows.filter((r) => {
      if (siteFilter && r.site_name !== siteFilter) return false;
      if (doneFilter !== "" && String(r.done) !== doneFilter) return false;
      return true;
    });

    if (filteredRows.length === 0) {
      acctOverviewBody.innerHTML = "";
      acctOverviewEmptyMsg.classList.remove("hidden");
      return;
    }
    acctOverviewEmptyMsg.classList.add("hidden");

    const byPeriod = new Map();
    for (const row of filteredRows) {
      const m = row.month || "미상";
      const key = acctOverviewMode === "year" ? (m.slice(0, 4) || "미상") : m;
      if (!byPeriod.has(key)) {
        byPeriod.set(key, { period: key, doneCount: 0, undoneCount: 0, sitesMap: new Map() });
      }
      const bucket = byPeriod.get(key);
      const s = bucket.sitesMap.get(row.site_name) || { site_name: row.site_name, doneCount: 0, undoneCount: 0 };
      if (Number(row.done)) {
        bucket.doneCount += row.count;
        s.doneCount += row.count;
      } else {
        bucket.undoneCount += row.count;
        s.undoneCount += row.count;
      }
      bucket.sitesMap.set(row.site_name, s);
    }

    const periods = Array.from(byPeriod.values()).sort((a, b) => (a.period < b.period ? 1 : -1));

    acctOverviewBody.innerHTML = periods
      .map((m) => {
        const isExpanded = acctOverviewExpandedPeriods.has(m.period);
        const siteRows = Array.from(m.sitesMap.values()).sort((a, b) => a.site_name.localeCompare(b.site_name, "ko"));
        const total = m.doneCount + m.undoneCount;
        const detailRows = isExpanded
          ? siteRows
              .map((s, i) => {
                const siteTotal = s.doneCount + s.undoneCount;
                return `
              <tr class="site-detail-row ${i === siteRows.length - 1 ? "last-detail" : ""}" data-period="${m.period}" data-site="${escapeHtml(s.site_name)}">
                <td class="site-detail-name" data-label="현장명"><span class="cell-value">${escapeHtml(s.site_name)}</span></td>
                <td class="col-cost" data-label="미완료 건수"><span class="cell-value">${s.undoneCount}건</span></td>
                <td class="col-cost" data-label="완료 건수"><span class="cell-value">${s.doneCount}건</span></td>
                <td class="col-cost" data-label="합계 건수"><span class="cell-value">${siteTotal}건</span></td>
                <td class="col-cost" data-label="참여 현장 수"><span class="cell-value">-</span></td>
              </tr>`;
              })
              .join("")
          : "";
        const periodLabel = acctOverviewMode === "year" ? m.period + "년" : m.period;
        return `
          <tr class="month-row ${isExpanded ? "expanded" : ""}" data-period="${m.period}">
            <td class="period-cell" data-label="${acctOverviewMode === "year" ? "연도" : "월"}">
              <span class="expand-icon">▶</span><span class="cell-value">${escapeHtml(periodLabel)}</span><span class="period-hint">${isExpanded ? "접기" : "현장별 보기"}</span>
            </td>
            <td class="col-cost" data-label="미완료 건수"><span class="cell-value">${m.undoneCount}건</span></td>
            <td class="col-cost" data-label="완료 건수"><span class="cell-value">${m.doneCount}건</span></td>
            <td class="col-cost" data-label="합계 건수"><span class="cell-value">${total}건</span></td>
            <td class="col-cost" data-label="참여 현장 수"><span class="cell-value">${m.sitesMap.size}곳</span></td>
          </tr>
          ${detailRows}`;
      })
      .join("");
  }

  acctOverviewBody.addEventListener("click", (e) => {
    const detail = e.target.closest(".site-detail-row");
    if (detail) {
      if (acctOverviewMode === "year") return;
      const site = detail.getAttribute("data-site") || "";
      const period = detail.getAttribute("data-period") || "";
      drilldownAcctOverview(site, period);
      return;
    }
    const row = e.target.closest(".month-row");
    if (!row) return;
    const period = row.getAttribute("data-period");
    if (acctOverviewExpandedPeriods.has(period)) acctOverviewExpandedPeriods.delete(period);
    else acctOverviewExpandedPeriods.add(period);
    renderAcctOverviewSummary();
  });

  // 현장별 상세 줄을 누르면, 그 현장·그 달의 실제 경리 업무일지 내역을
  // 검색 결과와 같은 형태로 바로 보여줍니다.
  async function drilldownAcctOverview(site, month) {
    acctOverviewSearching = true;
    acctOverviewFilterSite.value = site;
    acctOverviewSearchInput.value = "";
    await runAcctOverviewSearch({ month });
  }

  async function fetchAcctOverviewEntries({ keyword = "", month = "" } = {}) {
    const site = acctOverviewFilterSite.value;
    const done = acctOverviewFilterDone.value;
    const params = new URLSearchParams({ sort: "desc" });
    if (keyword) params.set("keyword", keyword);
    if (site) params.set("site", site);
    if (done !== "") params.set("done", done);
    if (month) {
      params.set("from", `${month}-01`);
      params.set("to", `${month}-31`);
    }
    const data = await api(`/api/accounting?${params.toString()}`);
    return data.entries || [];
  }

  async function runAcctOverviewSearch(opts = {}) {
    const keyword = acctOverviewSearchInput.value.trim();
    const month = opts.month !== undefined ? opts.month : acctOverviewDrilldownMonth;
    acctOverviewDrilldownMonth = month;
    acctOverviewSearchResults = await fetchAcctOverviewEntries({ keyword, month });
    renderAcctOverviewSearch(keyword, month);
  }

  function renderAcctOverviewSearch(keyword, month) {
    acctOverviewTable.classList.add("hidden");
    acctOverviewSearchTable.classList.remove("hidden");

    acctOverviewSearchHint.classList.remove("hidden");
    if (keyword) {
      acctOverviewSearchHint.textContent = `"${keyword}" 검색 결과 ${acctOverviewSearchResults.length}건`;
    } else if (month) {
      acctOverviewSearchHint.textContent = `${acctOverviewFilterSite.value || "전체 현장"} · ${month} 전체 내역 ${acctOverviewSearchResults.length}건`;
    } else {
      acctOverviewSearchHint.textContent = `전체 내역 ${acctOverviewSearchResults.length}건`;
    }

    if (acctOverviewSearchResults.length === 0) {
      acctOverviewSearchBody.innerHTML = "";
      acctOverviewEmptyMsg.classList.remove("hidden");
      return;
    }
    acctOverviewEmptyMsg.classList.add("hidden");

    acctOverviewSearchBody.innerHTML = acctOverviewSearchResults
      .map(
        (r) => `
        <tr class="${r.done ? "paid-row" : ""}">
          <td class="col-date" data-label="작업일"><span class="cell-value">${escapeHtml(r.work_date) || "-"}${
            r.carried_from
              ? ` <span class="carried-badge" title="원래 작업일: ${escapeHtml(r.carried_from)}">이월</span>`
              : ""
          }</span></td>
          <td class="site-badge" data-label="현장명"><span class="cell-value">${highlightKeyword(r.site_name, keyword)}</span></td>
          <td class="content-cell-wide" data-label="업무"><span class="cell-value">${highlightKeyword(r.content, keyword)}</span></td>
          <td class="col-date" data-label="마감기한"><span class="cell-value">${escapeHtml(r.due_date) || "-"}</span></td>
          <td class="col-check" data-label="완료"><span class="cell-value">${r.done ? "✅ 완료" : "미완료"}</span></td>
        </tr>`
      )
      .join("");
  }

  acctOverviewSearchBtn.addEventListener("click", async () => {
    acctOverviewSearching = true;
    await runAcctOverviewSearch({ month: "" });
  });
  acctOverviewSearchInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      acctOverviewSearching = true;
      await runAcctOverviewSearch({ month: "" });
    }
  });
  acctOverviewSearchResetBtn.addEventListener("click", async () => {
    // 초기화하면 필터만 지우고, 기본 화면인 "전체 목록"으로 돌아갑니다.
    acctOverviewSearching = true;
    acctOverviewDrilldownMonth = "";
    acctOverviewSearchInput.value = "";
    acctOverviewFilterSite.value = "";
    acctOverviewFilterDone.value = "";
    acctOverviewSearchHint.classList.add("hidden");
    acctOverviewExpandedPeriods.clear();
    await runAcctOverviewSearch({ month: "" });
  });

  // ================= 후속 작업 (앞으로 진행해야 하는 업무 등록/조회) =================

  async function loadFollowups() {
    const params = new URLSearchParams();
    if (followupFilterSite.value) params.set("site", followupFilterSite.value);
    if (followupFilterStatus.value !== "") params.set("status", followupFilterStatus.value);
    const data = await api(`/api/followups?${params.toString()}`);
    followupEntries = data.followups;
    // 현장명 가나다순으로 정렬(같은 현장 안에서는 서버가 내려준 순서(완료여부/예정일 등)를 그대로 유지)
    followupEntries.sort((a, b) => a.site_name.localeCompare(b.site_name, "ko"));
    if (followupView === "calendar") {
      renderFollowupCalendar();
    } else {
      renderFollowups();
    }
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
      .map((r, i) => (editingFollowupId === r.id ? followupEditRowHtml(r, i) : followupViewRowHtml(r, i)))
      .join("");
  }

  function followupViewRowHtml(r, i) {
    const rowClass = r.status ? "paid-row" : isOverdue(r) ? "overdue-row" : "";
    return `
      <tr class="${rowClass}" data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td class="site-badge" data-label="현장명"><span class="cell-value">${escapeHtml(r.site_name)}</span></td>
        <td class="content-cell-wide" data-label="내용"><span class="cell-value">${escapeHtml(r.content) || "-"}</span></td>
        <td class="col-date" data-label="예정일"><span class="cell-value">${escapeHtml(r.due_date) || "-"}</span></td>
        <td class="content-cell-wide" data-label="비고"><span class="cell-value">${escapeHtml(r.remarks) || "-"}</span></td>
        <td class="col-check" data-label="완료">
          <span class="cell-value">${toggleChipHtml("toggle-followup-status", r.id, r.status)}</span>
        </td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-ghost btn-sm" data-action="edit-followup" data-id="${r.id}">수정</button>
            <button class="btn btn-danger btn-sm" data-action="delete-followup" data-id="${r.id}">삭제</button>
          </span>
        </td>
      </tr>`;
  }

  function followupEditRowHtml(r, i) {
    const siteOpts = sites
      .map((s) => `<option value="${escapeHtml(s.name)}" ${s.name === r.site_name ? "selected" : ""}>${escapeHtml(s.name)}</option>`)
      .join("");
    return `
      <tr data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td data-label="현장명"><select class="edit-input" data-edit="site_name">${siteOpts}</select></td>
        <td data-label="내용"><input class="edit-input" data-edit="content" value="${escapeHtml(r.content)}" /></td>
        <td class="col-date" data-label="예정일"><input class="edit-input" type="date" data-edit="due_date" value="${r.due_date || ""}" /></td>
        <td data-label="비고"><input class="edit-input" data-edit="remarks" value="${escapeHtml(r.remarks)}" /></td>
        <td class="col-check" data-label="완료">
          <span class="cell-value">${toggleChipEditHtml("status", r.status)}</span>
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

  // ---- 후속 작업: 목록 보기 / 달력 보기 전환 ----
  function switchFollowupView(view) {
    followupView = view;
    followupViewListBtn.classList.toggle("subtab-active", view === "list");
    followupViewCalendarBtn.classList.toggle("subtab-active", view === "calendar");
    followupListView.classList.toggle("hidden", view !== "list");
    followupCalendarView.classList.toggle("hidden", view !== "calendar");
    if (view === "calendar") renderFollowupCalendar();
  }
  followupViewListBtn.addEventListener("click", () => switchFollowupView("list"));
  followupViewCalendarBtn.addEventListener("click", () => switchFollowupView("calendar"));

  // ---- 후속 작업: 달력 보기 ----
  followupCalPrevBtn.addEventListener("click", () => {
    followupCalMonth -= 1;
    if (followupCalMonth < 1) { followupCalMonth = 12; followupCalYear -= 1; }
    renderFollowupCalendar();
  });
  followupCalNextBtn.addEventListener("click", () => {
    followupCalMonth += 1;
    if (followupCalMonth > 12) { followupCalMonth = 1; followupCalYear += 1; }
    renderFollowupCalendar();
  });
  followupCalTodayBtn.addEventListener("click", () => {
    const t = new Date();
    followupCalYear = t.getFullYear();
    followupCalMonth = t.getMonth() + 1;
    followupCalSelectedDate = todayStr();
    renderFollowupCalendar();
  });

  function groupFollowupsByDate(entries) {
    const map = new Map();
    entries.forEach((r) => {
      if (!r.due_date) return;
      if (!map.has(r.due_date)) map.set(r.due_date, []);
      map.get(r.due_date).push(r);
    });
    return map;
  }

  function followupCalChipHtml(r) {
    const cls = r.status ? "cal-chip-done" : isOverdue(r) ? "cal-chip-overdue" : "";
    const label = `${r.site_name}${r.content ? " · " + r.content : ""}`;
    return `<div class="cal-chip ${cls}" title="${escapeHtml(label)}">${escapeHtml(r.site_name)}</div>`;
  }

  function renderFollowupCalendar() {
    followupCalTitle.textContent = `${followupCalYear}년 ${followupCalMonth}월`;

    const byDate = groupFollowupsByDate(followupEntries);
    const noDue = followupEntries.filter((r) => !r.due_date);
    if (noDue.length === 0) {
      followupCalNoDueWrap.classList.add("hidden");
      followupCalNoDueList.innerHTML = "";
    } else {
      followupCalNoDueWrap.classList.remove("hidden");
      followupCalNoDueList.innerHTML = noDue.map(followupCalChipHtml).join("");
    }

    // 이번 달 앞뒤로 달력 6주(42칸)를 채웁니다(월요일 시작이 아니라 일요일 시작 표준 달력).
    const daysInMonth = new Date(Date.UTC(followupCalYear, followupCalMonth, 0)).getUTCDate();
    const firstDow = new Date(Date.UTC(followupCalYear, followupCalMonth - 1, 1)).getUTCDay(); // 0=일
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null); // 이전 달 자리는 빈 칸으로 둡니다.
    for (let d = 1; d <= daysInMonth; d++) cells.push({ y: followupCalYear, m: followupCalMonth, d });
    while (cells.length % 7 !== 0) cells.push(null);

    const today = todayStr();
    const maxShow = 3;
    followupCalDays.innerHTML = cells
      .map((c, idx) => {
        if (!c) return `<div class="cal-day cal-day-outside" style="cursor:default"></div>`;
        const key = `${c.y}-${String(c.m).padStart(2, "0")}-${String(c.d).padStart(2, "0")}`;
        const dow = idx % 7;
        const items = byDate.get(key) || [];
        const shown = items.slice(0, maxShow);
        const moreCount = items.length - shown.length;
        const chips = shown.map(followupCalChipHtml).join("");
        const moreHtml = moreCount > 0 ? `<div class="cal-day-more">+${moreCount}건 더</div>` : "";
        const classes = [
          "cal-day",
          key === today ? "cal-day-today" : "",
          key === followupCalSelectedDate ? "cal-day-selected" : "",
          dow === 0 ? "cal-day-sun" : dow === 6 ? "cal-day-sat" : "",
        ].filter(Boolean).join(" ");
        return `<div class="${classes}" data-date="${key}"><div class="cal-day-num">${c.d}</div>${chips}${moreHtml}</div>`;
      })
      .join("");

    renderFollowupCalDetail();
  }

  followupCalDays.addEventListener("click", (e) => {
    const cell = e.target.closest(".cal-day[data-date]");
    if (!cell) return;
    followupCalSelectedDate = cell.getAttribute("data-date");
    renderFollowupCalendar();
  });

  function renderFollowupCalDetail() {
    if (!followupCalSelectedDate) {
      followupCalDetail.classList.add("hidden");
      return;
    }
    followupCalDetail.classList.remove("hidden");
    const [y, m, d] = followupCalSelectedDate.split("-").map(Number);
    followupCalDetailTitle.textContent = `${y}년 ${m}월 ${d}일 후속 작업`;
    const items = followupEntries.filter((r) => r.due_date === followupCalSelectedDate);
    if (items.length === 0) {
      followupCalDetailList.innerHTML = "";
      followupCalDetailEmpty.classList.remove("hidden");
    } else {
      followupCalDetailEmpty.classList.add("hidden");
      followupCalDetailList.innerHTML = items
        .map((r) => `
          <div class="cal-detail-item" data-id="${r.id}">
            ${toggleChipHtml("toggle-followup-status", r.id, r.status)}
            <span class="cal-detail-site">${escapeHtml(r.site_name)}</span>
            <span class="cal-detail-content">${escapeHtml(r.content) || "-"}</span>
            <span class="cal-detail-remarks">${escapeHtml(r.remarks) || ""}</span>
            <span class="row-actions">
              <button class="btn btn-ghost btn-sm" data-action="edit-followup-from-cal" data-id="${r.id}">수정</button>
              <button class="btn btn-danger btn-sm" data-action="delete-followup" data-id="${r.id}">삭제</button>
            </span>
          </div>`)
        .join("");
    }
  }

  followupCalDetailList.addEventListener("change", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (action === "toggle-followup-status" && id) {
      try {
        await api(`/api/followups/${id}`, { method: "PUT", body: JSON.stringify({ status: e.target.checked }) });
        await loadFollowups();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  followupCalDetailList.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;
    if (action === "edit-followup-from-cal") {
      editingFollowupId = Number(id);
      switchFollowupView("list");
      renderFollowups();
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

  followupCalAddForDateBtn.addEventListener("click", () => {
    switchFollowupView("list");
    followupAddForm.classList.remove("hidden");
    followupAddError.textContent = "";
    newFollowupDue.value = followupCalSelectedDate || "";
  });

  // ================= 작업 내역 및 시설 업무일지 조회 (월별/연간 통합 + 검색) =================
  // "청구 내역"(records 표, category=작업내역/소독/저수조청소 전부 포함)과 "시설 업무일지"
  // (journal_entries 표)를 한 화면에서 같이 집계/검색할 수 있게 합니다.

  async function loadOverview() {
    if (overviewSearching) {
      await runOverviewSearch();
    } else {
      await loadOverviewSummary();
    }
  }

  async function loadOverviewSummary() {
    const [journalData, recordData] = await Promise.all([
      api("/api/journal-summary"),
      api("/api/monthly-summary"),
    ]);
    const journalRows = (journalData.rows || []).map((r) => ({
      month: r.month, site_name: r.site_name, count: r.count, source: "journal",
    }));
    // category를 따로 필터링하지 않고 작업내역/소독/저수조청소를 모두 "청구 내역"으로 합산합니다.
    const recordRows = (recordData.rows || []).map((r) => ({
      month: r.month, site_name: r.site_name, count: r.count, source: "record", category: r.category,
    }));
    overviewSummaryRows = [...journalRows, ...recordRows];
    renderOverviewSummary();
  }

  // "월별/연도별" 버튼은 화면을 명시적으로 집계 표로 전환합니다(기본 화면은 전체 목록입니다).
  async function switchOverviewMode(mode) {
    overviewMode = mode;
    overviewModeMonthBtn.classList.toggle("subtab-active", mode === "month");
    overviewModeYearBtn.classList.toggle("subtab-active", mode === "year");
    overviewPeriodHeader.textContent = mode === "month" ? "월" : "연도";
    overviewExpandedPeriods.clear();
    overviewSearching = false;
    await loadOverviewSummary();
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
  overviewFilterType.addEventListener("change", () => {
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
    const typeFilter = overviewFilterType.value; // "all" | "record" | "journal"
    const filteredRows = overviewSummaryRows.filter((r) => {
      if (siteFilter && r.site_name !== siteFilter) return false;
      if (typeFilter === "record" && r.source !== "record") return false;
      if (typeFilter === "journal" && r.source !== "journal") return false;
      return true;
    });

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
        byPeriod.set(key, { period: key, recordCount: 0, journalCount: 0, sitesMap: new Map() });
      }
      const bucket = byPeriod.get(key);
      const s = bucket.sitesMap.get(row.site_name) || { site_name: row.site_name, recordCount: 0, journalCount: 0 };
      if (row.source === "record") {
        bucket.recordCount += row.count;
        s.recordCount += row.count;
      } else {
        bucket.journalCount += row.count;
        s.journalCount += row.count;
      }
      bucket.sitesMap.set(row.site_name, s);
    }

    const periods = Array.from(byPeriod.values()).sort((a, b) => (a.period < b.period ? 1 : -1));

    overviewBody.innerHTML = periods
      .map((m) => {
        const isExpanded = overviewExpandedPeriods.has(m.period);
        const siteRows = Array.from(m.sitesMap.values()).sort((a, b) => a.site_name.localeCompare(b.site_name, "ko"));
        const total = m.recordCount + m.journalCount;
        const detailRows = isExpanded
          ? siteRows
              .map((s, i) => {
                const siteTotal = s.recordCount + s.journalCount;
                return `
              <tr class="site-detail-row ${i === siteRows.length - 1 ? "last-detail" : ""}" data-period="${m.period}" data-site="${escapeHtml(s.site_name)}">
                <td class="site-detail-name" data-label="현장명"><span class="cell-value">${escapeHtml(s.site_name)}</span></td>
                <td class="col-cost" data-label="청구 내역 건수"><span class="cell-value">${s.recordCount}건</span></td>
                <td class="col-cost" data-label="시설 업무일지 건수"><span class="cell-value">${s.journalCount}건</span></td>
                <td class="col-cost" data-label="합계 건수"><span class="cell-value">${siteTotal}건</span></td>
                <td class="col-cost" data-label="참여 현장 수"><span class="cell-value">-</span></td>
              </tr>`;
              })
              .join("")
          : "";
        const periodLabel = overviewMode === "year" ? m.period + "년" : m.period;
        return `
          <tr class="month-row ${isExpanded ? "expanded" : ""}" data-period="${m.period}">
            <td class="period-cell" data-label="${overviewMode === "year" ? "연도" : "월"}">
              <span class="expand-icon">▶</span><span class="cell-value">${escapeHtml(periodLabel)}</span><span class="period-hint">${isExpanded ? "접기" : "현장별 보기"}</span>
            </td>
            <td class="col-cost" data-label="청구 내역 건수"><span class="cell-value">${m.recordCount}건</span></td>
            <td class="col-cost" data-label="시설 업무일지 건수"><span class="cell-value">${m.journalCount}건</span></td>
            <td class="col-cost" data-label="합계 건수"><span class="cell-value">${total}건</span></td>
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
      const site = detail.getAttribute("data-site") || "";
      const period = detail.getAttribute("data-period") || "";
      drilldownOverview(site, period);
      return;
    }
    const row = e.target.closest(".month-row");
    if (!row) return;
    const period = row.getAttribute("data-period");
    if (overviewExpandedPeriods.has(period)) overviewExpandedPeriods.delete(period);
    else overviewExpandedPeriods.add(period);
    renderOverviewSummary();
  });

  // 현장별 상세 줄을 누르면, 그 현장·그 달의 실제 내역(청구 작업내역 + 시설 업무일지)을
  // 검색 결과와 같은 형태로 바로 보여줍니다.
  async function drilldownOverview(site, month) {
    overviewSearching = true;
    overviewFilterSite.value = site;
    overviewSearchInput.value = "";
    await runOverviewSearch({ month });
  }

  async function fetchOverviewEntries({ keyword = "", month = "" } = {}) {
    const typeFilter = overviewFilterType.value; // "all" | "record" | "journal"
    const site = overviewFilterSite.value;
    const tasks = [];

    if (typeFilter !== "record") {
      const params = new URLSearchParams({ sort: "desc" });
      if (keyword) params.set("keyword", keyword);
      if (site) params.set("site", site);
      if (month) params.set("month", month);
      tasks.push(
        api(`/api/journal?${params.toString()}`).then((data) =>
          (data.entries || []).map((r) => ({
            work_date: r.work_date,
            site_name: r.site_name,
            source: "journal",
            content: r.content,
            note: r.remarks,
          }))
        )
      );
    }
    if (typeFilter !== "journal") {
      // category 파라미터를 지정하지 않으면 작업내역/소독/저수조청소가 모두 함께 조회됩니다.
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (site) params.set("site", site);
      if (month) params.set("month", month);
      tasks.push(
        api(`/api/records?${params.toString()}`).then((data) =>
          (data.records || []).map((r) => ({
            work_date: r.work_date,
            site_name: r.site_name,
            source: "record",
            category: r.category,
            content: r.content,
            note: `${won(r.cost)} · 청구${r.billed ? "완료" : "대기"} · 입금${r.paid ? "완료" : "대기"}`,
          }))
        )
      );
    }

    const lists = await Promise.all(tasks);
    return lists.flat().sort((a, b) => {
      const av = a.work_date || "";
      const bv = b.work_date || "";
      if (!av && !bv) return 0;
      if (!av) return 1;
      if (!bv) return -1;
      return av < bv ? 1 : av > bv ? -1 : 0;
    });
  }

  async function runOverviewSearch(opts = {}) {
    const keyword = overviewSearchInput.value.trim();
    const month = opts.month !== undefined ? opts.month : overviewDrilldownMonth;
    overviewDrilldownMonth = month;
    overviewSearchResults = await fetchOverviewEntries({ keyword, month });
    renderOverviewSearch(keyword, month);
  }

  function highlightKeyword(text, keyword) {
    const escaped = escapeHtml(text);
    if (!keyword) return escaped || "-";
    const escapedKeyword = escapeHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return (escaped || "-").replace(new RegExp(escapedKeyword, "gi"), (m) => `<mark>${m}</mark>`);
  }

  function sourceBadgeHtml(source, category) {
    if (source !== "record") {
      return `<span class="source-badge source-journal">시설 업무일지</span>`;
    }
    const label = category === "소독" ? "소독" : category === "저수조청소" ? "저수조 청소" : "청구 작업내역";
    return `<span class="source-badge source-record">${label}</span>`;
  }

  function renderOverviewSearch(keyword, month) {
    overviewTable.classList.add("hidden");
    overviewSearchTable.classList.remove("hidden");

    overviewSearchHint.classList.remove("hidden");
    if (keyword) {
      overviewSearchHint.textContent = `"${keyword}" 검색 결과 ${overviewSearchResults.length}건`;
    } else if (month) {
      overviewSearchHint.textContent = `${overviewFilterSite.value || "전체 현장"} · ${month} 전체 내역 ${overviewSearchResults.length}건`;
    } else {
      overviewSearchHint.textContent = `전체 내역 ${overviewSearchResults.length}건`;
    }

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
          <td data-label="구분"><span class="cell-value">${sourceBadgeHtml(r.source, r.category)}</span></td>
          <td class="site-badge" data-label="현장명"><span class="cell-value">${highlightKeyword(r.site_name, keyword)}</span></td>
          <td class="content-cell-wide" data-label="작업내용"><span class="cell-value">${highlightKeyword(r.content, keyword)}</span></td>
          <td class="content-cell-wide" data-label="비고"><span class="cell-value">${r.source === "journal" ? highlightKeyword(r.note, keyword) : escapeHtml(r.note)}</span></td>
        </tr>`
      )
      .join("");
  }

  overviewSearchBtn.addEventListener("click", async () => {
    overviewSearching = true;
    await runOverviewSearch({ month: "" });
  });
  overviewSearchInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      overviewSearching = true;
      await runOverviewSearch({ month: "" });
    }
  });
  overviewSearchResetBtn.addEventListener("click", async () => {
    // 초기화하면 필터만 지우고, 기본 화면인 "전체 목록"으로 돌아갑니다.
    overviewSearching = true;
    overviewDrilldownMonth = "";
    overviewSearchInput.value = "";
    overviewFilterSite.value = "";
    overviewFilterType.value = "all";
    overviewSearchHint.classList.add("hidden");
    overviewExpandedPeriods.clear();
    await runOverviewSearch({ month: "" });
  });

  // ================= 현장별 계좌번호 정리 (관리비 납부 계좌 안내 문구 복사) =================

  async function loadSiteAccounts() {
    const params = new URLSearchParams();
    if (siteAccountsKeyword) params.set("keyword", siteAccountsKeyword);
    const data = await api(`/api/site-accounts?${params.toString()}`);
    siteAccounts = data.accounts;
    renderSiteAccounts();
  }

  siteAccountsSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      siteAccountsKeyword = siteAccountsSearchInput.value.trim();
      loadSiteAccounts();
    }
  });
  siteAccountsSearchResetBtn.addEventListener("click", () => {
    siteAccountsSearchInput.value = "";
    siteAccountsKeyword = "";
    loadSiteAccounts();
  });

  addSiteAccountBtn.addEventListener("click", () => {
    siteAccountAddError.textContent = "";
    siteAccountAddForm.classList.toggle("hidden");
  });
  cancelSiteAccountBtn.addEventListener("click", () => {
    siteAccountAddForm.classList.add("hidden");
    resetSiteAccountAddForm();
  });

  function resetSiteAccountAddForm() {
    newSiteAccountSite.value = "";
    newSiteAccountBank.value = "";
    newSiteAccountHolder.value = "";
    newSiteAccountNumber.value = "";
    siteAccountAddError.textContent = "";
  }

  saveSiteAccountBtn.addEventListener("click", async () => {
    siteAccountAddError.textContent = "";
    if (!newSiteAccountSite.value.trim()) { siteAccountAddError.textContent = "현장명을 입력해주세요."; return; }
    if (!newSiteAccountNumber.value.trim()) { siteAccountAddError.textContent = "계좌번호를 입력해주세요."; return; }
    try {
      await api("/api/site-accounts", {
        method: "POST",
        body: JSON.stringify({
          site_name: newSiteAccountSite.value,
          bank: newSiteAccountBank.value,
          account_holder: newSiteAccountHolder.value,
          account_number: newSiteAccountNumber.value,
        }),
      });
      siteAccountAddForm.classList.add("hidden");
      resetSiteAccountAddForm();
      await loadSiteAccounts();
    } catch (err) {
      siteAccountAddError.textContent = err.message;
    }
  });

  function renderSiteAccounts() {
    if (siteAccounts.length === 0) {
      siteAccountsBody.innerHTML = "";
      siteAccountsEmptyMsg.classList.remove("hidden");
      return;
    }
    siteAccountsEmptyMsg.classList.add("hidden");
    siteAccountsBody.innerHTML = siteAccounts
      .map((r, i) => (editingSiteAccountId === r.id ? siteAccountEditRowHtml(r, i) : siteAccountViewRowHtml(r, i)))
      .join("");
  }

  function siteAccountViewRowHtml(r, i) {
    return `
      <tr data-id="${r.id}">
        <td class="site-badge" data-label="현장명"><span class="cell-value">${escapeHtml(r.site_name)}</span></td>
        <td data-label="은행"><span class="cell-value">${escapeHtml(r.bank) || "-"}</span></td>
        <td data-label="예금주"><span class="cell-value">${escapeHtml(r.account_holder) || "-"}</span></td>
        <td class="content-cell-wide" data-label="계좌번호"><span class="cell-value">${escapeHtml(r.account_number)}</span></td>
        <td data-label="납부금액"><span class="cell-value"><input class="edit-input amount-input" type="text" inputmode="numeric" data-amount-id="${r.id}" placeholder="예: 150000" value="${escapeHtml(siteAccountAmounts.get(r.id) || "")}" /></span></td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-primary btn-sm" data-action="copy-site-account" data-id="${r.id}">텍스트 복사</button>
            <button class="btn btn-ghost btn-sm" data-action="edit-site-account" data-id="${r.id}">수정</button>
            <button class="btn btn-danger btn-sm" data-action="delete-site-account" data-id="${r.id}">삭제</button>
          </span>
        </td>
      </tr>`;
  }

  function siteAccountEditRowHtml(r, i) {
    return `
      <tr data-id="${r.id}">
        <td data-label="현장명"><input class="edit-input" data-edit="site_name" value="${escapeHtml(r.site_name)}" /></td>
        <td data-label="은행"><input class="edit-input" data-edit="bank" value="${escapeHtml(r.bank)}" /></td>
        <td data-label="예금주"><input class="edit-input" data-edit="account_holder" value="${escapeHtml(r.account_holder)}" /></td>
        <td class="content-cell-wide" data-label="계좌번호"><input class="edit-input" data-edit="account_number" value="${escapeHtml(r.account_number)}" /></td>
        <td data-label="납부금액"><span class="cell-value">-</span></td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-primary btn-sm" data-action="save-edit-site-account" data-id="${r.id}">저장</button>
            <button class="btn btn-ghost btn-sm" data-action="cancel-edit-site-account" data-id="${r.id}">취소</button>
          </span>
        </td>
      </tr>`;
  }

  function buildSiteAccountMessage(r, amountRaw) {
    const amountDigits = String(amountRaw || "").replace(/[^0-9]/g, "");
    const amountLine = amountDigits ? `${Number(amountDigits).toLocaleString("ko-KR")}원` : "";
    return (
      `안녕하십니까 ${r.site_name} 관리업체 비엠에스코리아 부산지사입니다.\n` +
      `관리비 납부 계좌 안내드립니다.\n` +
      `계좌번호: (${r.bank}) ${r.account_holder} ${r.account_number}\n` +
      `납부금액: ${amountLine}`
    );
  }

  // 납부금액 입력칸은 서버에 저장되지 않으므로, 다른 행을 수정/삭제해 표 전체가
  // 다시 그려지더라도 입력하던 값이 사라지지 않도록 여기(siteAccountAmounts)에 따로 보관합니다.
  siteAccountsBody.addEventListener("input", (e) => {
    const amountId = e.target.getAttribute("data-amount-id");
    if (!amountId) return;
    siteAccountAmounts.set(Number(amountId), e.target.value);
  });

  siteAccountsBody.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit-site-account") {
      editingSiteAccountId = Number(id);
      renderSiteAccounts();
    } else if (action === "cancel-edit-site-account") {
      editingSiteAccountId = null;
      renderSiteAccounts();
    } else if (action === "save-edit-site-account") {
      const row = e.target.closest("tr");
      const patch = {
        site_name: row.querySelector('[data-edit="site_name"]').value,
        bank: row.querySelector('[data-edit="bank"]').value,
        account_holder: row.querySelector('[data-edit="account_holder"]').value,
        account_number: row.querySelector('[data-edit="account_number"]').value,
      };
      try {
        await api(`/api/site-accounts/${id}`, { method: "PUT", body: JSON.stringify(patch) });
        editingSiteAccountId = null;
        await loadSiteAccounts();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === "delete-site-account") {
      if (!confirm("이 계좌 정보를 삭제할까요?")) return;
      try {
        await api(`/api/site-accounts/${id}`, { method: "DELETE" });
        await loadSiteAccounts();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === "copy-site-account") {
      const record = siteAccounts.find((s) => s.id === Number(id));
      if (!record) return;
      const row = e.target.closest("tr");
      const amountInput = row.querySelector(`[data-amount-id="${id}"]`);
      const message = buildSiteAccountMessage(record, amountInput ? amountInput.value : "");
      try {
        await navigator.clipboard.writeText(message);
      } catch (err) {
        alert("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
        return;
      }
      const btn = e.target;
      const originalText = btn.textContent;
      btn.textContent = "복사됨!";
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-success");
      const prevTimer = siteAccountCopiedTimers.get(id);
      if (prevTimer) clearTimeout(prevTimer);
      const timer = setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove("btn-success");
        btn.classList.add("btn-primary");
        siteAccountCopiedTimers.delete(id);
      }, 1500);
      siteAccountCopiedTimers.set(id, timer);
    }
  });

  // ================= 현장별 1년 스케줄표 (보험 만기·법정 점검·소독·저수조청소 등) =================
  // 사용자가 업로드한 "현장별 1년 스케줄표.xlsx"를 초기 데이터로 반영한 화면입니다.
  // 만기 도래일 기준 오름차순 정렬이 기본이며, 만기 도래일이 없는(해당없음) 항목은
  // 정렬 순서상 맨 뒤로 보냅니다(서버에서 이미 이렇게 정렬해서 내려줍니다).
  // 현장/태그/키워드 필터는 서버에서 전체를 한 번 불러온 뒤 화면(클라이언트)에서
  // 적용합니다 — 이렇게 하면 "현장" 드롭다운이 필터링 중에도 항상 전체 현장 목록을
  // 그대로 유지합니다(서버 필터링 방식이면 현장을 하나 고른 뒤 드롭다운이 그 현장
  // 하나로 좁아져 버리는 문제가 있음).

  const SCHEDULE_TAG_CLASS = {
    "보험": "insurance",
    "건물 점검": "building",
    "설비 점검": "equipment",
    "소독": "disinfect",
    "저수조청소": "tank",
    "세금": "tax",
    "기타": "etc",
  };

  function renderScheduleTagSelects() {
    const filterOpts = `<option value="">전체 태그</option>` +
      SCHEDULE_TAGS.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("");
    scheduleFilterTag.innerHTML = filterOpts;
    newScheduleTag.innerHTML = SCHEDULE_TAGS
      .map((t) => `<option value="${escapeHtml(t)}" ${t === "기타" ? "selected" : ""}>${escapeHtml(t)}</option>`)
      .join("");
  }

  function scheduleTagBadgeHtml(tag) {
    const cls = SCHEDULE_TAG_CLASS[tag] || "etc";
    return `<span class="tag-badge tag-${cls}">${escapeHtml(tag)}</span>`;
  }

  let scheduleAllEntries = []; // 필터 적용 전, 서버에서 받은 전체 목록(만기 도래일 오름차순)

  async function loadSchedules() {
    const data = await api("/api/site-schedules?sort=asc");
    scheduleAllEntries = data.entries;
    renderScheduleSiteFilterOptions();
    applyScheduleFilters();
  }

  function renderScheduleSiteFilterOptions() {
    const prev = scheduleFilterSite.value;
    const names = Array.from(new Set(scheduleAllEntries.map((r) => r.site_name))).sort((a, b) => a.localeCompare(b, "ko"));
    scheduleFilterSite.innerHTML = `<option value="">전체 현장</option>` +
      names.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
    if (names.includes(prev)) scheduleFilterSite.value = prev;
  }

  function applyScheduleFilters() {
    const site = scheduleFilterSite.value;
    const tag = scheduleFilterTag.value;
    const keyword = scheduleSearchInput.value.trim().toLowerCase();
    scheduleEntries = scheduleAllEntries.filter((r) => {
      if (site && r.site_name !== site) return false;
      if (tag && r.tag !== tag) return false;
      if (keyword) {
        const hay = `${r.site_name} ${r.category} ${r.remarks}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });
    renderSchedule();
    if (scheduleView === "calendar") renderScheduleCalendar();
  }

  scheduleFilterSite.addEventListener("change", applyScheduleFilters);
  scheduleFilterTag.addEventListener("change", applyScheduleFilters);
  scheduleSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyScheduleFilters();
  });
  scheduleSearchResetBtn.addEventListener("click", () => {
    scheduleFilterSite.value = "";
    scheduleFilterTag.value = "";
    scheduleSearchInput.value = "";
    applyScheduleFilters();
  });

  addScheduleBtn.addEventListener("click", () => {
    scheduleAddError.textContent = "";
    scheduleAddForm.classList.toggle("hidden");
  });
  cancelScheduleBtn.addEventListener("click", () => {
    scheduleAddForm.classList.add("hidden");
    resetScheduleAddForm();
  });

  function resetScheduleAddForm() {
    newScheduleSite.value = "";
    newScheduleCategory.value = "";
    newScheduleRemarks.value = "";
    newScheduleDue.value = "";
    newScheduleAmount.value = "";
    newScheduleFeeNote.value = "";
    newScheduleTag.value = "기타";
    scheduleAddError.textContent = "";
  }

  saveScheduleBtn.addEventListener("click", async () => {
    scheduleAddError.textContent = "";
    if (!newScheduleSite.value.trim()) { scheduleAddError.textContent = "현장명을 입력해주세요."; return; }
    if (!newScheduleCategory.value.trim()) { scheduleAddError.textContent = "구분(업무 내용)을 입력해주세요."; return; }
    try {
      await api("/api/site-schedules", {
        method: "POST",
        body: JSON.stringify({
          site_name: newScheduleSite.value,
          category: newScheduleCategory.value,
          remarks: newScheduleRemarks.value,
          due_date: newScheduleDue.value || null,
          amount: newScheduleAmount.value,
          fee_note: newScheduleFeeNote.value,
          tag: newScheduleTag.value,
        }),
      });
      scheduleAddForm.classList.add("hidden");
      resetScheduleAddForm();
      await loadSchedules();
    } catch (err) {
      scheduleAddError.textContent = err.message;
    }
  });

  function isScheduleOverdue(r) {
    return !!r.due_date && r.due_date < todayStr();
  }

  function renderSchedule() {
    if (scheduleEntries.length === 0) {
      scheduleBody.innerHTML = "";
      scheduleEmptyMsg.classList.remove("hidden");
      return;
    }
    scheduleEmptyMsg.classList.add("hidden");
    scheduleBody.innerHTML = scheduleEntries
      .map((r, i) => (editingScheduleId === r.id ? scheduleEditRowHtml(r, i) : scheduleViewRowHtml(r, i)))
      .join("");
  }

  function scheduleViewRowHtml(r, i) {
    const rowClass = isScheduleOverdue(r) ? "overdue-row" : "";
    return `
      <tr class="${rowClass}" data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td class="site-badge" data-label="현장명"><span class="cell-value">${escapeHtml(r.site_name)}</span></td>
        <td class="content-cell-wide" data-label="구분"><span class="cell-value">${escapeHtml(r.category) || "-"}</span></td>
        <td class="content-cell-wide" data-label="비고"><span class="cell-value">${escapeHtml(r.remarks) || "-"}</span></td>
        <td class="col-date" data-label="만기 도래일"><span class="cell-value">${escapeHtml(r.due_date) || "-"}</span></td>
        <td data-label="금액"><span class="cell-value">${escapeHtml(r.amount) || "-"}</span></td>
        <td data-label="관리비 적용"><span class="cell-value">${escapeHtml(r.fee_note) || "-"}</span></td>
        <td data-label="태그"><span class="cell-value">${scheduleTagBadgeHtml(r.tag)}</span></td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-ghost btn-sm" data-action="edit-schedule" data-id="${r.id}">수정</button>
            <button class="btn btn-danger btn-sm" data-action="delete-schedule" data-id="${r.id}">삭제</button>
          </span>
        </td>
      </tr>`;
  }

  function scheduleEditRowHtml(r, i) {
    const tagOpts = SCHEDULE_TAGS
      .map((t) => `<option value="${escapeHtml(t)}" ${t === r.tag ? "selected" : ""}>${escapeHtml(t)}</option>`)
      .join("");
    return `
      <tr data-id="${r.id}">
        <td class="col-no" data-label="No."><span class="cell-value">${i + 1}</span></td>
        <td data-label="현장명"><input class="edit-input" data-edit="site_name" value="${escapeHtml(r.site_name)}" /></td>
        <td data-label="구분"><input class="edit-input" data-edit="category" value="${escapeHtml(r.category)}" /></td>
        <td data-label="비고"><input class="edit-input" data-edit="remarks" value="${escapeHtml(r.remarks)}" /></td>
        <td class="col-date" data-label="만기 도래일"><input class="edit-input" type="date" data-edit="due_date" value="${r.due_date || ""}" /></td>
        <td data-label="금액"><input class="edit-input" data-edit="amount" value="${escapeHtml(r.amount)}" /></td>
        <td data-label="관리비 적용"><input class="edit-input" data-edit="fee_note" value="${escapeHtml(r.fee_note)}" /></td>
        <td data-label="태그"><select class="edit-input" data-edit="tag">${tagOpts}</select></td>
        <td class="col-manage" data-label="관리">
          <span class="row-actions">
            <button class="btn btn-primary btn-sm" data-action="save-edit-schedule" data-id="${r.id}">저장</button>
            <button class="btn btn-ghost btn-sm" data-action="cancel-edit-schedule" data-id="${r.id}">취소</button>
          </span>
        </td>
      </tr>`;
  }

  scheduleBody.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit-schedule") {
      editingScheduleId = Number(id);
      renderSchedule();
    } else if (action === "cancel-edit-schedule") {
      editingScheduleId = null;
      renderSchedule();
    } else if (action === "save-edit-schedule") {
      const row = e.target.closest("tr");
      const patch = {
        site_name: row.querySelector('[data-edit="site_name"]').value,
        category: row.querySelector('[data-edit="category"]').value,
        remarks: row.querySelector('[data-edit="remarks"]').value,
        due_date: row.querySelector('[data-edit="due_date"]').value || null,
        amount: row.querySelector('[data-edit="amount"]').value,
        fee_note: row.querySelector('[data-edit="fee_note"]').value,
        tag: row.querySelector('[data-edit="tag"]').value,
      };
      try {
        await api(`/api/site-schedules/${id}`, { method: "PUT", body: JSON.stringify(patch) });
        editingScheduleId = null;
        await loadSchedules();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === "delete-schedule") {
      if (!confirm("이 일정을 삭제할까요?")) return;
      try {
        await api(`/api/site-schedules/${id}`, { method: "DELETE" });
        await loadSchedules();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  // ---- 현장별 1년 스케줄표: 목록 보기 / 달력 보기 전환 ----
  function switchScheduleView(view) {
    scheduleView = view;
    scheduleViewListBtn.classList.toggle("subtab-active", view === "list");
    scheduleViewCalendarBtn.classList.toggle("subtab-active", view === "calendar");
    scheduleListView.classList.toggle("hidden", view !== "list");
    scheduleCalendarView.classList.toggle("hidden", view !== "calendar");
    if (view === "calendar") renderScheduleCalendar();
  }
  scheduleViewListBtn.addEventListener("click", () => switchScheduleView("list"));
  scheduleViewCalendarBtn.addEventListener("click", () => switchScheduleView("calendar"));

  // ---- 현장별 1년 스케줄표: 달력 보기 ----
  scheduleCalPrevBtn.addEventListener("click", () => {
    scheduleCalMonth -= 1;
    if (scheduleCalMonth < 1) { scheduleCalMonth = 12; scheduleCalYear -= 1; }
    renderScheduleCalendar();
  });
  scheduleCalNextBtn.addEventListener("click", () => {
    scheduleCalMonth += 1;
    if (scheduleCalMonth > 12) { scheduleCalMonth = 1; scheduleCalYear += 1; }
    renderScheduleCalendar();
  });
  scheduleCalTodayBtn.addEventListener("click", () => {
    const t = new Date();
    scheduleCalYear = t.getFullYear();
    scheduleCalMonth = t.getMonth() + 1;
    scheduleCalSelectedDate = todayStr();
    renderScheduleCalendar();
  });

  function groupSchedulesByDate(entries) {
    const map = new Map();
    entries.forEach((r) => {
      if (!r.due_date) return;
      if (!map.has(r.due_date)) map.set(r.due_date, []);
      map.get(r.due_date).push(r);
    });
    return map;
  }

  function scheduleCalChipHtml(r) {
    const cls = isScheduleOverdue(r) ? "cal-chip-overdue" : `cal-chip-tag-${SCHEDULE_TAG_CLASS[r.tag] || "etc"}`;
    const label = `${r.site_name}${r.category ? " · " + r.category : ""}`;
    return `<div class="cal-chip ${cls}" title="${escapeHtml(label)}">${escapeHtml(r.site_name)}</div>`;
  }

  function renderScheduleCalendar() {
    scheduleCalTitle.textContent = `${scheduleCalYear}년 ${scheduleCalMonth}월`;

    const byDate = groupSchedulesByDate(scheduleEntries);
    const noDue = scheduleEntries.filter((r) => !r.due_date);
    if (noDue.length === 0) {
      scheduleCalNoDueWrap.classList.add("hidden");
      scheduleCalNoDueList.innerHTML = "";
    } else {
      scheduleCalNoDueWrap.classList.remove("hidden");
      scheduleCalNoDueList.innerHTML = noDue.map(scheduleCalChipHtml).join("");
    }

    // 이번 달 앞뒤로 달력 6주(42칸)를 채웁니다(일요일 시작 표준 달력).
    const daysInMonth = new Date(Date.UTC(scheduleCalYear, scheduleCalMonth, 0)).getUTCDate();
    const firstDow = new Date(Date.UTC(scheduleCalYear, scheduleCalMonth - 1, 1)).getUTCDay(); // 0=일
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push({ y: scheduleCalYear, m: scheduleCalMonth, d });
    while (cells.length % 7 !== 0) cells.push(null);

    const today = todayStr();
    const maxShow = 3;
    scheduleCalDays.innerHTML = cells
      .map((c, idx) => {
        if (!c) return `<div class="cal-day cal-day-outside" style="cursor:default"></div>`;
        const key = `${c.y}-${String(c.m).padStart(2, "0")}-${String(c.d).padStart(2, "0")}`;
        const dow = idx % 7;
        const items = byDate.get(key) || [];
        const shown = items.slice(0, maxShow);
        const moreCount = items.length - shown.length;
        const chips = shown.map(scheduleCalChipHtml).join("");
        const moreHtml = moreCount > 0 ? `<div class="cal-day-more">+${moreCount}건 더</div>` : "";
        const classes = [
          "cal-day",
          key === today ? "cal-day-today" : "",
          key === scheduleCalSelectedDate ? "cal-day-selected" : "",
          dow === 0 ? "cal-day-sun" : dow === 6 ? "cal-day-sat" : "",
        ].filter(Boolean).join(" ");
        return `<div class="${classes}" data-date="${key}"><div class="cal-day-num">${c.d}</div>${chips}${moreHtml}</div>`;
      })
      .join("");

    renderScheduleCalDetail();
  }

  scheduleCalDays.addEventListener("click", (e) => {
    const cell = e.target.closest(".cal-day[data-date]");
    if (!cell) return;
    scheduleCalSelectedDate = cell.getAttribute("data-date");
    renderScheduleCalendar();
  });

  function renderScheduleCalDetail() {
    if (!scheduleCalSelectedDate) {
      scheduleCalDetail.classList.add("hidden");
      return;
    }
    scheduleCalDetail.classList.remove("hidden");
    const [y, m, d] = scheduleCalSelectedDate.split("-").map(Number);
    scheduleCalDetailTitle.textContent = `${y}년 ${m}월 ${d}일 만기 도래 일정`;
    const items = scheduleEntries.filter((r) => r.due_date === scheduleCalSelectedDate);
    if (items.length === 0) {
      scheduleCalDetailList.innerHTML = "";
      scheduleCalDetailEmpty.classList.remove("hidden");
    } else {
      scheduleCalDetailEmpty.classList.add("hidden");
      scheduleCalDetailList.innerHTML = items
        .map((r) => `
          <div class="cal-detail-item" data-id="${r.id}">
            ${scheduleTagBadgeHtml(r.tag)}
            <span class="cal-detail-site">${escapeHtml(r.site_name)}</span>
            <span class="cal-detail-content">${escapeHtml(r.category) || "-"}</span>
            <span class="cal-detail-remarks">${escapeHtml(r.remarks) || ""}</span>
            <span class="row-actions">
              <button class="btn btn-ghost btn-sm" data-action="edit-schedule-from-cal" data-id="${r.id}">수정</button>
              <button class="btn btn-danger btn-sm" data-action="delete-schedule" data-id="${r.id}">삭제</button>
            </span>
          </div>`)
        .join("");
    }
  }

  scheduleCalDetailList.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const id = e.target.getAttribute("data-id");
    if (!action || !id) return;
    if (action === "edit-schedule-from-cal") {
      editingScheduleId = Number(id);
      switchScheduleView("list");
      renderSchedule();
    } else if (action === "delete-schedule") {
      if (!confirm("이 일정을 삭제할까요?")) return;
      try {
        await api(`/api/site-schedules/${id}`, { method: "DELETE" });
        await loadSchedules();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  scheduleCalAddForDateBtn.addEventListener("click", () => {
    switchScheduleView("list");
    scheduleAddForm.classList.remove("hidden");
    scheduleAddError.textContent = "";
    newScheduleDue.value = scheduleCalSelectedDate || "";
  });

  // ---------- 상태 토글 버튼 (품의/입금/완료) 공통 렌더링 ----------
  // 체크박스는 그대로 두고(기존 change 이벤트 로직 재사용), 화면에는 버튼처럼 보이는
  // .toggle-chip-face 를 보여줍니다. 미완료(대기)/완료 문구는 체크 여부에 따라 CSS로 전환됩니다.
  function toggleChipHtml(action, id, checked) {
    return `
      <label class="toggle-chip">
        <input type="checkbox" data-action="${action}" data-id="${id}" ${checked ? "checked" : ""} />
        <span class="toggle-chip-face"><span class="toggle-chip-box"></span><span class="toggle-chip-off">대기</span><span class="toggle-chip-on">완료</span></span>
      </label>`;
  }

  // 인라인 수정(edit) 행에서 쓰는 버전: data-id 없이 data-edit 키만 붙입니다
  // (저장 시 같은 행 안에서 querySelector('[data-edit="..."]')로 값을 읽어갑니다).
  function toggleChipEditHtml(editKey, checked) {
    return `
      <label class="toggle-chip">
        <input type="checkbox" data-edit="${editKey}" ${checked ? "checked" : ""} />
        <span class="toggle-chip-face"><span class="toggle-chip-box"></span><span class="toggle-chip-off">대기</span><span class="toggle-chip-on">완료</span></span>
      </label>`;
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  // ---------- 시작 ----------
  renderScheduleTagSelects();
  checkAuth();
})();
