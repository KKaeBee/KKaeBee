// alarm.js
// - 단건 알림: showAlarm(id)  → /api/notices/:id
// - 최신 N개 알림: showLatestToasts(limit, intervalMs)
//   * /api/notices?department_id=... 로 받아 프론트에서 날짜 내림차순 정렬 후 상위 N개 표시
// - 쿼리스트링: ?id=10  또는  ?top=7

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

  // 부서 메일 목록 → 날짜 내림차순 정렬
  async function fetchLatestByDepartment(limit = 7) {
    // 세션에 저장된 부서 ID 사용 (없으면 10 같은 기본값 사용)
    const departmentId = sessionStorage.getItem("department_id") || "10";

    const res = await fetch(
      `${NOTICE_API}?department_id=${encodeURIComponent(departmentId)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    const list = await res.json();
    if (!Array.isArray(list)) return [];

    // date 기준 내림차순
    const sorted = list
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted.slice(0, Number(limit) || 7);
  }

  // ====== UI ======
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
          <span class="badge ${source.includes("금융위") ? "orange" : "yellow"}">${source}</span>
          <time class="toast-date">${escapeHTML(formatISODate(date))}</time>
        </div>
      </div>
    `;

    // 닫기 버튼
    qs(".toast-close", toast).addEventListener("click", (e) => {
      e.stopPropagation();
      dismissToast(toast);
    });

    // 본문 클릭 → mail_detail로 이동 (해당 id)
    qs(".toast-body", toast).addEventListener("click", () => {
      // 1) id 백업 저장 (상세에서 쿼리스트링이 유실되는 드문 케이스 대비)
      if (id != null) {
        try { sessionStorage.setItem("last_notice_id", String(id)); } catch (_) {}
      }
      // 출발지 기록: alarm
      try { sessionStorage.setItem("last_list", "alarm"); } catch (_) {}
      // 2) 어떤 경로에서든 mail_detail.html을 정확히 가리키도록 URL 생성
      const target = new URL("./mail_detail.html", location.href);
      if (id != null) target.searchParams.set("id", String(id));
      location.href = target.href;
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
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }

  // ====== Public API ======
  // 단건 알림 (직접 id 지정)
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

  // 최신 N개 알림 (부서함 기준)
  window.showLatestToasts = async function (limit = 7, intervalMs = 400) {
    try {
      const list = await fetchLatestByDepartment(limit);
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

  // ====== Auto bootstrap (쿼리스트링 + 데모 버튼) ======
  document.addEventListener("DOMContentLoaded", () => {
    const p = new URL(location.href).searchParams;
    const id = p.get("id");
    const top = p.get("top");

    if (id) window.showAlarm(Number(id));
    if (top) window.showLatestToasts(Number(top));

    const btn = document.getElementById("demoBtn");
    if (btn) btn.addEventListener("click", () => window.showLatestToasts(7, 400));
  });

  // 뒤로가기 버튼 함수
  window.goBackToAllMail = function () {
    window.location.href = "all_mail.html";
  };
})();
