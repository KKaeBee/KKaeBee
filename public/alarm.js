(function () {
  const API_ROOT = "http://localhost:3000";
  const NOTICE_API = `${API_ROOT}/api/notices`;
  const qs = (sel, el = document) => el.querySelector(sel);

  // ====== container 보장 ======
  function ensureToastContainer() {
    let el = document.getElementById("toastContainer");
    if (!el) {
      el = document.createElement("div");
      el.id = "toastContainer";
      el.className = "toast-container";
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-atomic", "true");
      document.body.appendChild(el);
    }
    return el;
  }
  const toastContainer = ensureToastContainer();

  // ====== utils ======
  function escapeHTML(str) {
    return String(str ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }
  function formatISODate(iso) {
    if (!iso) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // ====== API ======
  async function fetchNotice(id) {
    const res = await fetch(`${NOTICE_API}/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) throw new Error("Notice not found");
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  async function fetchLatestByDepartment(limit = 7) {
    const departmentId = sessionStorage.getItem("department_id") || "10";
    const res = await fetch(
      `${NOTICE_API}?department_id=${encodeURIComponent(departmentId)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    const list = await res.json();
    if (!Array.isArray(list)) return [];
    const sorted = list.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted.slice(0, Number(limit) || 7);
  }

  // ====== 빈 목록 모달 ======
  function showEmptyModal() {
    // overlay
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    // 최소한의 스타일만 지정 (나머지는 style.css에서 원하는 대로 커스텀)
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,.6)",
      display: "grid",
      placeItems: "center",
      zIndex: "9999",
    });

    // modal
    const modal = document.createElement("div");
    modal.className = "modal-card";
    Object.assign(modal.style, {
      background: "#fff",
      borderRadius: "16px",
      padding: "24px 28px",
      width: "min(440px, 90vw)",
      textAlign: "center",
    });

    const msg = document.createElement("p");
    msg.className = "modal-message";
    msg.textContent = "사원님의 부서에서 받으실 메일 알림이 없습니다.";

    const btn = document.createElement("button");
    btn.className = "modal-confirm";
    btn.textContent = "확인";
    Object.assign(btn.style, {
      width: "100%", height: "44px",
      border: "0", borderRadius: "10px",
      cursor: "pointer", color: "#fff", background: "#222"
    });

    // 이벤트: 배경 클릭 → alarm.html / 모달 내부 클릭은 전파 막기 / 확인 → all_mail.html
    overlay.addEventListener("click", () => { location.href = "alarm.html"; });
    modal.addEventListener("click", (e) => e.stopPropagation());
    btn.addEventListener("click", () => { location.href = "all_mail.html"; });

    modal.appendChild(msg);
    modal.appendChild(btn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // ====== UI (토스트) ======
  function createToast(notice) {
    const { id, title, date, source } = notice || {};
    const toast = document.createElement("section");
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
      <header class="toast-header">
        <img class="toast-logo" src="logo/gnb_Logo.png" alt="KKAEBEE"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2228%22 height=%2228%22><rect width=%2228%22 height=%2228%22 rx=%225%22 fill=%22%23eee%22/></svg>'" />
        <span class="toast-brand">KKAEBEE</span>
        <span class="toast-spacer"></span>
        <button class="toast-icon-btn toast-menu" title="메뉴" aria-label="메뉴">⋯</button>
        <button class="toast-icon-btn toast-close" title="닫기" aria-label="닫기">×</button>
      </header>
      <div class="toast-body">
        <h3 class="toast-title">${escapeHTML(title || "제목 없음")}</h3>
        <div class="toast-footer">
          <span class="badge ${source?.includes("금융위") ? "orange" : "yellow"}">${source ?? ""}</span>
          <time class="toast-date">${escapeHTML(formatISODate(date))}</time>
        </div>
      </div>
    `;

    qs(".toast-close", toast).addEventListener("click", (e) => {
      e.stopPropagation();
      dismissToast(toast);
    });

    qs(".toast-body", toast).addEventListener("click", () => {
      if (id != null) {
        try { sessionStorage.setItem("last_notice_id", String(id)); } catch {}
      }
      try { sessionStorage.setItem("last_list", "alarm"); } catch {}
      const target = new URL("./mail_detail.html", location.href);
      if (id != null) target.searchParams.set("id", String(id));
      location.href = target.href;
      dismissToast(toast);
    });

    // 자동 닫힘
    let remaining = 8000, timerId = null, startedAt = null;
    const startTimer = () => { startedAt = Date.now(); timerId = setTimeout(() => dismissToast(toast), remaining); };
    const pauseTimer = () => { if (!timerId) return; clearTimeout(timerId); timerId = null; remaining -= Date.now() - startedAt; };
    toast.addEventListener("mouseenter", pauseTimer);
    toast.addEventListener("mouseleave", () => { if (!timerId) startTimer(); });

    toastContainer.prepend(toast);
    startTimer();
    return toast;
  }

  function dismissToast(toast) {
    toast.classList.add("toast-leave");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }

  // ====== Public API ======
  window.showAlarm = async function (noticeId) {
    try {
      const data = await fetchNotice(noticeId);
      createToast(data);
    } catch (err) {
      createToast({
        title: err.message || "알림을 불러오지 못했습니다",
        source: "알림",
        date: new Date().toISOString(),
      });
    }
  };

  window.showLatestToasts = async function (limit = 7, intervalMs = 400) {
    try {
      const list = await fetchLatestByDepartment(limit);
      if (!list.length) {
        showEmptyModal(); // << 비어 있으면 모달
        return;
      }
      list.forEach((notice, idx) => {
        setTimeout(() => createToast(notice), idx * intervalMs);
      });
    } catch (err) {
      createToast({
        title: err.message || "목록을 불러오지 못했습니다",
        source: "알림",
        date: new Date().toISOString(),
      });
    }
  };

  // ====== Auto bootstrap ======
  document.addEventListener("DOMContentLoaded", () => {
    const p = new URL(location.href).searchParams;
    const id = p.get("id");
    const top = p.get("top");

    if (id) window.showAlarm(Number(id));
    if (top) window.showLatestToasts(Number(top));

    const btn = document.getElementById("demoBtn");
    if (btn) btn.addEventListener("click", () => window.showLatestToasts(7, 400));
  });

  // 뒤로가기 버튼
  window.goBackToAllMail = function () {
    window.location.href = "all_mail.html";
  };
})();
