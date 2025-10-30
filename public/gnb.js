(function () {
  const API_BASE = "http://localhost:3000";
  const NOTICE_API = `${API_BASE}/api/notices`;
  const $ = (s, el = document) => el.querySelector(s);

  function escapeHTML(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  // ===== 읽음 처리 =====
  function getDeptId() {
    return sessionStorage.getItem("department_id");
  }

  async function markAsRead(id) {
    const deptId = getDeptId();
    if (!deptId || !id) return;

    try {
      const res = await fetch(`${NOTICE_API}/${id}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ department_id: Number(deptId) }),
      });
      if (!res.ok) throw new Error(`read api 실패: ${res.status}`);
    } catch (e) {
      console.error("읽음 처리 실패:", e);
    }
  }

  // 드롭다운 엘리먼트 확보
  function ensureAlarmDropdown() {
    const container = $(".alarm-container");
    if (!container) return null;
    let dropdown = $(".alarm-dropdown", container);
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "alarm-dropdown";
      dropdown.style.display = "none";
      dropdown.innerHTML = `
        <ul class="alarm-list">
          <li class="loading">불러오는 중...</li>
        </ul>
      `;
      container.appendChild(dropdown);
    }
    return dropdown;
  }

  async function fetchLatestByDepartment(limit = 3) {
    const deptId = sessionStorage.getItem("department_id");
    if (!deptId) return [];
    const res = await fetch(`${NOTICE_API}?department_id=${encodeURIComponent(deptId)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const list = await res.json();
    if (!Array.isArray(list)) return [];
    return list.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0, limit);
  }

  function renderAlarmList(notices) {
    const dropdown = ensureAlarmDropdown();
    if (!dropdown) return;
    const ul = $(".alarm-list", dropdown) || dropdown.appendChild(document.createElement("ul"));
    ul.className = "alarm-list";

    if (!notices.length) {
      ul.innerHTML = `<li class="empty">새 알림이 없습니다</li>`;
      return;
    }

    ul.innerHTML = notices.map(n => `
      <li data-id="${n.id}" class="${n.is_read ? '' : 'unread'}">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <strong style="flex:1;white-space:normal;word-break:break-word;">
            ${escapeHTML(n.title ?? "")}
          </strong>
          ${n.is_read ? '' : '<span class="red-dot" style="width:8px;height:8px;border-radius:50%;background:#f33;flex-shrink:0;"></span>'}
        </div>
        <span>${escapeHTML(n.source ?? "")}</span>
      </li>
    `).join("");

    // li 클릭 → 읽음 처리 후 mail_detail 이동
    ul.onclick = async (e) => {
      const li = e.target.closest("li[data-id]");
      if (!li) return;

      const id = li.dataset.id;

      // UI 즉시 반영
      li.classList.remove("unread");
      const dot = li.querySelector(".red-dot");
      if (dot) dot.remove();

      // 서버 반영: 완료 or 150ms 중 빠른 쪽
      const done = markAsRead(id).catch(() => {});
      await Promise.race([done, new Promise(r => setTimeout(r, 150))]);

      try { sessionStorage.setItem("last_notice_id", String(id)); } catch {}
      const url = new URL("./mail_detail.html", location.href);
      url.searchParams.set("id", id);
      location.href = url.href;
    };
  }

  async function refreshAlarmList() {
    const items = await fetchLatestByDepartment(3);
    renderAlarmList(items);
  }

  // ===== 바인딩은 모두 DOMContentLoaded 안에서 =====
  document.addEventListener("DOMContentLoaded", () => {
    const dropdown = ensureAlarmDropdown();
    const alarmIcon = $(".alarm-icon");

    // 로고 클릭 → department.html
    const gnbLogo = $(".gnb-logo");
    gnbLogo?.addEventListener("click", () => {
      location.href = new URL("./department.html", location.href).href;
    });

    // 로그아웃
    const logoutBtn = $(".logout-btn");
    logoutBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        // 로그인/부서 관련 저장 값 정리
        sessionStorage.clear();
        localStorage.removeItem("deptName");
        localStorage.removeItem("token");
      } catch {}
      // 루트의 index.html로 이동 (상대 경로 안전)
      location.href = new URL("./index.html", location.href).href;
    });

    // 최초 1회 갱신
    refreshAlarmList();

    // 알림 아이콘 토글 시 열릴 때마다 갱신
    alarmIcon?.addEventListener("click", () => {
      if (!dropdown) return;
      const open = dropdown.style.display === "block";
      if (!open) refreshAlarmList();
    });
  });
})();
