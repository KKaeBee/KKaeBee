const API_BASE = "http://localhost:3000";

let allMails = [];
let currentPage = 1;
const mailsPerPage = 6;

// ===== Helpers =====
function getDeptId() {
  return sessionStorage.getItem("department_id");
}
function byLatest(a, b) {
  return new Date(b.date) - new Date(a.date);
}

// ===== Fetch: 전체 목록 =====
async function fetchAllMails() {
  const deptId = getDeptId();
  if (!deptId) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/notices/all?department_id=${deptId}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`전체 목록 API 오류: ${res.status}`);

    allMails = (await res.json()).sort(byLatest);
    currentPage = 1;
    renderMailList();
    renderPagination();
  } catch (err) {
    console.error("전체 메일 불러오기 실패:", err);
    alert("메일을 불러오지 못했습니다.");
  }
}

// ===== Fetch: 검색 =====
async function fetchSearchResults(keyword) {
  const deptId = getDeptId();
  if (!deptId) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    if (!keyword || keyword.trim() === "") {
      await fetchAllMails();
      return;
    }

    const scope = "all";
    const url = `${API_BASE}/api/notices/search?department_id=${deptId}&keyword=${encodeURIComponent(
      keyword
    )}&scope=${scope}`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`검색 실패: ${res.status}`);

    allMails = (await res.json()).sort(byLatest);
    currentPage = 1;
    renderMailList();
    renderPagination();
  } catch (err) {
    console.error("검색 실패:", err);
    alert("검색 중 오류가 발생했습니다.");
  }
}

// ===== Read: 읽음 처리 =====
async function markAsRead(id) {
  const deptId = getDeptId();
  if (!deptId) return;

  try {
    const res = await fetch(`${API_BASE}/api/notices/${id}/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ department_id: Number(deptId) }),
    });
    if (!res.ok) throw new Error(`read api 실패: ${res.status}`);

    // 로컬 상태 갱신
    const i = allMails.findIndex((m) => String(m.id) === String(id));
    if (i !== -1) allMails[i].is_read = 1;

    // DOM 즉시 반영
    const li = document.querySelector(`.mail-item[data-mail-id="${id}"]`);
    if (li) {
      li.classList.remove("unread");
      li.dataset.isRead = "1";
      li.querySelector(".red-dot")?.remove();
    }
  } catch (e) {
    console.error("읽음 처리 실패:", e);
  }
}

// ===== Render: 목록 =====
function renderMailList() {
  const mailList = document.querySelector(".mail-items");
  const mailCount = document.querySelector(".mail-count");
  if (!mailList || !mailCount) return;

  const start = (currentPage - 1) * mailsPerPage;
  const pageMails = allMails.slice(start, start + mailsPerPage);

  if (!pageMails.length) {
    mailList.innerHTML = `<li class="no-mail">메일이 없습니다.</li>`;
    mailCount.textContent = "전체 0건";
    return;
  }

  mailList.innerHTML = pageMails.map(mail => `
  <li class="mail-item ${mail.is_read ? '' : 'unread'}"
      data-mail-id="${mail.id}"
      data-is-read="${mail.is_read}">
    <span class="badge ${mail.source.includes('금융위') ? 'orange' : 'yellow'}">${mail.source}</span>
  <a href="mail_detail.html?id=${mail.id}" class="mail-title" data-goto="${mail.id}">
      ${mail.title}
    </a>
    <span class="mail-date">${mail.date}</span>
    <button class="mail-star ${mail.is_starred ? 'active' : ''}" data-id="${mail.id}">
      ${mail.is_starred ? '★' : '☆'}
    </button>
  </li>
`).join('');

  mailCount.textContent = `전체 ${allMails.length}건`;
}

// ===== Render: 페이지네이션 =====
function renderPagination() {
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  const totalPages = Math.ceil(allMails.length / mailsPerPage);
  if (totalPages <= 0) return;

  const pagesPerGroup = 5;
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  const startPage = currentGroup * pagesPerGroup + 1;
  let endPage = startPage + pagesPerGroup - 1;
  if (endPage > totalPages) endPage = totalPages;

  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "〈";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderMailList();
      renderPagination();
    }
  });
  pagination.appendChild(prevBtn);

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderMailList();
      renderPagination();
    });
    pagination.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "〉";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderMailList();
      renderPagination();
    }
  });
  pagination.appendChild(nextBtn);
}

// ===== Bootstrap =====
document.addEventListener("DOMContentLoaded", () => {
  // 초기 로드
  fetchAllMails();

  // 검색
  const searchBtn = document.querySelector(".search-btn");
  const searchInput = document.querySelector(".search-bar");
  searchBtn?.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    fetchSearchResults(keyword);
  });
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const keyword = searchInput.value.trim();
      fetchSearchResults(keyword);
    }
  });

  // 제목 클릭 → 읽음 처리 후 이동
  const list = document.querySelector(".mail-items");
  list?.addEventListener("click", async (e) => {
    const link = e.target.closest(".mail-title");
    if (!link) return;

    e.preventDefault();
    const id = link.dataset.goto;
    if (!id) return;

    // 출발지 기록: all_mail
    try { sessionStorage.setItem("last_list", "all_mail"); } catch (_) {}

    await markAsRead(id).catch(() => {});
    window.location.href = link.href;
  });

  // 상세에서 ?id없을 때 대비용 백업
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.mail-title");
    if (a && a.dataset.goto) {
      sessionStorage.setItem("last_notice_id", a.dataset.goto);
    }
  });
});
