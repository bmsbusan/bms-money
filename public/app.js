(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

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
  const newContent = $("#newContent");
  const newCost = $("#newCost");
  const newBilled = $("#newBilled");
  const newPaid = $("#newPaid");
  const newPaidDate = $("#newPaidDate");
  const saveNewBtn = $("#saveNewBtn");
  const cancelNewBtn = $("#cancelNewBtn");
  const addError = $("#addError");

  const recordsBody = $("#recordsBody");
  const emptyMsg = $("#emptyMsg");

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

  const won = (n) => (Number(n) || 0).toLocaleString("ko-KR") + "원";

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
      loadRecords();
    }, 5000);
  }
  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !appView.classList.contains("hidden")) {
      loadRecords();
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
    filterSite.innerHTML = `<option value="">전체 현장</option>${opts}`;
    newSite.innerHTML = `<option value="">현장 선택</option>${opts}`;
    if (sites.some((s) => s.name === prevFilter)) filterSite.value = prevFilter;
    if (sites.some((s) => s.name === prevNew)) newSite.value = prevNew;
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
    const months = new Set(records.map((r) => (r.created_at || "").slice(0, 7)).filter(Boolean));
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

  function renderRecords() {
    if (records.length === 0) {
      recordsBody.innerHTML = "";
      emptyMsg.classList.remove("hidden");
      return;
    }
    emptyMsg.classList.add("hidden");

    recordsBody.innerHTML = records
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
        <td><input class="edit-input" data-edit="content" value="${escapeHtml(r.content)}" /></td>
        <td class="col-cost"><input class="edit-input" type="number" min="0" data-edit="cost" value="${r.cost}" /></td>
        <td class="col-check">
          <input type="checkbox" data-edit="billed" ${r.billed ? "checked" : ""} />
        </td>
        <td class="col-check">
          <input type="checkbox" data-edit="paid" ${r.paid ? "checked" : ""} />
        </td>
        <td class="col-date"><input class="edit-input" type="date" data-edit="paid_date" value="${r.paid_date || ""}" /></td>
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
        content: row.querySelector('[data-edit="content"]').value,
        cost: Number(row.querySelector('[data-edit="cost"]').value) || 0,
        billed: row.querySelector('[data-edit="billed"]').checked,
        paid: row.querySelector('[data-edit="paid"]').checked,
        paid_date: row.querySelector('[data-edit="paid_date"]').value || null,
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
  });
  cancelNewBtn.addEventListener("click", () => {
    addForm.classList.add("hidden");
    resetAddForm();
  });

  function resetAddForm() {
    newSite.value = "";
    newContent.value = "";
    newCost.value = "";
    newBilled.checked = false;
    newPaid.checked = false;
    newPaidDate.value = "";
    addError.textContent = "";
  }

  saveNewBtn.addEventListener("click", async () => {
    addError.textContent = "";
    if (!newSite.value) { addError.textContent = "현장을 선택해주세요."; return; }
    try {
      await api("/api/records", {
        method: "POST",
        body: JSON.stringify({
          site_name: newSite.value,
          content: newContent.value,
          cost: Number(newCost.value) || 0,
          billed: newBilled.checked,
          paid: newPaid.checked,
          paid_date: newPaidDate.value || null,
        }),
      });
      addForm.classList.add("hidden");
      resetAddForm();
      await loadRecords();
    } catch (err) {
      addError.textContent = err.message;
    }
  });

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  // ---------- 시작 ----------
  checkAuth();
})();
