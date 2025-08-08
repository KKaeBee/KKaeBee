// alarm.js
// - 단건 알림: showAlarm(id)
// - 상위 N개 알림: showTopNotices(limit)
// - 쿼리스트링 지원: ?id=10, ?top=10
(function () {
  // ────────────────────────────────────────────────────────────────
  // API 설정: 필요시 window.ALARM_API_BASE 로 오버라이드 가능
  // 예) window.ALARM_API_BASE = "https://api.yourhost.com/api/notices";
  const API_BASE =
    window.ALARM_API_BASE || "http://localhost:3000/api/notices";
  // ────────────────────────────────────────────────────────────────

  const qs = (sel, el = document) => el.querySelector(sel);
  const toastContainer = ensureToastContainer();

  // ====== Utils ======
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

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]));
  }

  function formatISODate(iso) {
    if (!iso) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // ====== API ======
  async function fetchNotice(id) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) throw new Error("Notice not found");
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  async function fetchNotices(limit = 10) {
    const res = await fetch(`${API_BASE}?limit=${encodeURIComponent(limit)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json(); // 배열 가정
  }

  // ====== UI ======
  function createToast(notice) {
    const { title, date, source, url } = notice || {};

    const toast = document.createElement("section");
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
      <header class="toast-header">
        <img class="toast-logo" src="logo/gnb_Logo.png" alt="KKAEBEE"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2222%22 height=%2222%22><rect width=%2222%22 height=%2222%22 rx=%224%22 fill=%22%23eee%22/></svg>'" />
        <span class="toast-brand">KKAEBEE</span>
        <span class="toast-spacer"></span>
        <button class="toast-icon-btn toast-menu" title="메뉴" aria-label="메뉴">⋯</button>
        <button class="toast-icon-btn toast-close" title="닫기" aria-label="닫기">×</button>
      </header>
      <div class="toast-body">
        <h3 class="toast-title">${escapeHTML(title || "제목 없음")}</h3>
        <div class="toast-footer">
          <span class="badge chip">${escapeHTML(source || "알림")}</span>
          <time class="toast-date">${escapeHTML(formatISODate(date || new Date().toISOString()))}</time>
        </div>
      </div>
    `;

    // 닫기
    qs(".toast-close", toast).addEventListener("click", (e) => {
      e.stopPropagation();
      dismissToast(toast);
    });

    // // 본문 클릭 → 링크 이동
    // qs(".toast-body", toast).addEventListener("click", () => {
    //   if (url) window.open(url, "_blank", "noopener,noreferrer");
    //   dismissToast(toast);
    // });
    // 본문 클릭 → mail_detail로 이동
    qs(".toast-body", toast).addEventListener("click", () => {
      if (typeof notice?.id !== "undefined") {
        localStorage.setItem("selectedMailId", String(notice.id));
        // 필요하면 쿼리 방식도 가능: location.href = `mail_detail.html?id=${notice.id}`;
        location.href = "mail_detail.html";
      } else {
        console.warn("[alarm] notice.id가 없어 mail_detail로 이동하지 못했습니다.");
      }
      dismissToast(toast);
    });

    // 자동 닫힘(호버 시 일시정지)
    let remaining = 8000;
    let timerId = null;
    let startedAt = null;
    const startTimer = () => {
      startedAt = Date.now();
      timerId = setTimeout(() => dismissToast(toast), remaining);
    };
    const pauseTimer = () => {
      if (!timerId) return;
      clearTimeout(timerId);
      timerId = null;
      remaining -= Date.now() - startedAt;
    };
    toast.addEventListener("mouseenter", pauseTimer);
    toast.addEventListener("mouseleave", () => {
      if (!timerId) startTimer();
    });

    toastContainer.prepend(toast);
    startTimer();
    return toast;
  }

  function dismissToast(toast) {
    toast.classList.add("toast-leave");
    toast.addEventListener(
      "animationend",
      () => toast.remove(),
      { once: true }
    );
  }

  // ====== Public API ======
  // 단건 알림
  window.showAlarm = async function (noticeId) {
    try {
      const data = await fetchNotice(noticeId);
      createToast(data);
    } catch (err) {
      createToast({
        title: err.message || "알림을 불러오지 못했습니다",
        source: "알림",
        date: new Date().toISOString(),
        url: null,
      });
    }
  };

  // 상위 N개 알림
  window.showTopNotices = async function (limit = 10) {
    try {
      const list = await fetchNotices(limit);
      if (!Array.isArray(list)) throw new Error("Invalid data format");
      list.forEach((notice, idx) => {
        setTimeout(() => createToast(notice), idx * 300);
      });
    } catch (err) {
      createToast({
        title: err.message || "목록을 불러오지 못했습니다",
        source: "알림",
        date: new Date().toISOString(),
        url: null,
      });
    }
  };

  // ====== Auto bootstrap (쿼리스트링 지원 + 데모 버튼) ======
  document.addEventListener("DOMContentLoaded", () => {
    const p = new URL(location.href).searchParams;
    const id = p.get("id");
    const top = p.get("top");

    if (id) window.showAlarm(Number(id));
    if (top) window.showTopNotices(Number(top));

    const btn = document.getElementById("demoBtn");
    if (btn) btn.addEventListener("click", () => window.showTopNotices(10));
  });
})();
