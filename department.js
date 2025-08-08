// ==================== CONFIG ====================
const API_BASE = "http://localhost:3000";

let allMails = [];
let currentPage = 1;
const mailsPerPage = 6;

// ==================== HELPERS ====================
function getDeptId() {
  return sessionStorage.getItem("department_id"); // 필요시 localStorage fallback 추가
}

function byLatest(a, b) {
  return new Date(b.date) - new Date(a.date);
}

// ==================== FETCH: 전체 목록 ====================
async function fetchAll() {
  const deptId = getDeptId();
  if (!deptId) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/notices?department_id=${deptId}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`목록 API 오류: ${res.status}`);

    allMails = (await res.json()).sort(byLatest);
    currentPage = 1;
    renderMailList();
    renderPagination();
  } catch (err) {
    console.error("부서 메일 불러오기 실패:", err);
  }
}

// ==================== FETCH: 검색 ====================
async function fetchDepartmentSearchResults(keyword) {
  const deptId = getDeptId();
  if (!deptId) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    if (!keyword || keyword.trim() === "") {
      // 검색어 공백 → 전체 목록으로 복귀
      await fetchAll();
      return;
    }

    const scope = "inbox";
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

// ==================== READ: 읽음 처리 ====================
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

    // 1) 로컬 상태 갱신
    const i = allMails.findIndex((m) => String(m.id) === String(id));
    if (i !== -1) allMails[i].is_read = 1;

    // 2) DOM 즉시 갱신(리렌더 없이도 반영)
    const li = document.querySelector(`.mail-item[data-mail-id="${id}"]`);
    if (li) {
      li.classList.remove("unread");
      li.dataset.isRead = "1";
      li.querySelector(".red-dot")?.remove();
    }
    // 필요 시 전체 리렌더:
    renderMailList();
  } catch (e) {
    console.error("읽음 처리 실패:", e);
  }
}

async function goToDetail(id) {
  // 읽음 UI는 즉시 반영됨(이미 markAsRead 내부에서 처리)
  const done = markAsRead(id).catch(() => { /* 실패해도 이동은 함 */ });

  // 요청 완료 or 150ms 중 빠른 쪽으로 이동
  await Promise.race([done, new Promise(r => setTimeout(r, 150))]);

  window.location.href = `mail_detail.html?id=${id}`;
}
// ==================== RENDER: 목록 ====================
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
    ${mail.is_read ? '' : '<span class="red-dot"></span>'}
    <span class="badge ${mail.source.includes('금융위') ? 'orange' : 'yellow'}">${mail.source}</span>
  <a href="mail_detail.html?id=${mail.id}" class="mail-title" data-goto="${mail.id}">
      ${mail.title}
    </a>
    <span class="mail-date">${mail.date}</span>
    <button class="mail-star ${mail.is_starred ? 'active' : ''}" onclick="event.stopPropagation()">
      ${mail.is_starred ? '★' : '☆'}
    </button>
  </li>
`).join('');

  mailCount.textContent = `전체 ${allMails.length}건`;
}

// ==================== RENDER: 페이지네이션 ====================
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

// ==================== BOOTSTRAP ====================
document.addEventListener("DOMContentLoaded", () => {
  // 초기 로드: 전체 목록
  fetchAll();

  // 검색 이벤트
  const searchBtn = document.querySelector(".search-btn");
  const searchInput = document.querySelector(".search-bar");
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const keyword = searchInput.value.trim();
      fetchDepartmentSearchResults(keyword);
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const keyword = searchInput.value.trim();
        fetchDepartmentSearchResults(keyword);
      }
    });
  }

  // 리스트 클릭 위임 (항목/제목 클릭 → 읽음 처리)
  // 기존 "항목/제목 클릭 → 읽음 처리" 핸들러 전부 지우고 ↓만 사용
  const list = document.querySelector(".mail-items");
  list?.addEventListener("click", async (e) => {

    // 제목 링크만 허용
    const link = e.target.closest(".mail-title");
    if (!link) return;

    e.preventDefault(); // 기본 이동 잠깐 멈춤
    const id = link.dataset.goto;
    if (!id) return;

    // 읽음 표시 즉시 반영 + 서버 반영
    await markAsRead(id).catch(() => { });

    // 읽음 처리 후 제목 링크로 이동
    window.location.href = link.href;
  });

});

