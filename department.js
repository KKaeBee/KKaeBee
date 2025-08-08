let allMails = [];
let currentPage = 1;
const mailsPerPage = 6;

document.addEventListener("DOMContentLoaded", async () => {
  const deptId = sessionStorage.getItem("department_id");

  if (!deptId) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/notices?department_id=${deptId}`, {
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) throw new Error("API 오류: " + res.status);

    const mails = await res.json();
    allMails = mails.sort((a, b) => new Date(b.date) - new Date(a.date));
    currentPage = 1;

    renderMailList();  
    renderPagination(); 

    allMails = mails.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순 정렬
    currentPage = 1;

    renderMailList();  
    renderPagination(); 
  } catch (err) {
    console.error("부서 메일 불러오기 실패:", err);
  }

    // department mail 검색창 이벤트 리스너
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-bar');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const keyword = searchInput.value.trim();
      fetchDepartmentSearchResults(keyword);
    });

    // Enter 키로도 검색 가능하게
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const keyword = searchInput.value.trim();
        fetchDepartmentSearchResults(keyword);
      }
    });
  }
});


function renderMailList() {
  const mailList = document.querySelector('.mail-items');
  const mailCount = document.querySelector('.mail-count');

  if (!mailList || !mailCount) return;

  const start = (currentPage - 1) * mailsPerPage;
  const end = start + mailsPerPage;
  const pageMails = allMails.slice(start, end);

  if (!pageMails.length) {
    mailList.innerHTML = `<li class="no-mail">메일이 없습니다.</li>`;
    mailCount.textContent = "전체 0건";
    return;
  }

  mailList.innerHTML = pageMails.map(mail => `

    <li class="mail-item ${mail.is_read ? '' : 'unread'}" onclick="goToDetail(${mail.id})">
      <span class="badge ${mail.source.includes('금융위') ? 'orange' : 'yellow'}">${mail.source}</span>
      <a href="#" class="mail-title" onclick="event.preventDefault(); goToDetail(${mail.id})">
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

// 페이지네이션
function renderPagination() {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(allMails.length / mailsPerPage);

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

// department mail 검색 api 호출
const API_BASE = "http://localhost:3000";
async function fetchDepartmentSearchResults(keyword) {
  try {
    const departmentId = sessionStorage.getItem("department_id");
    if (!departmentId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const scope = 'inbox';

    if (!keyword || keyword.trim() === "") { // 검색어가 비어 있으면 다시 전체 메일
      location.reload();
      return;
    }

    const res = await fetch(`${API_BASE}/api/notices/search?department_id=${departmentId}&keyword=${encodeURIComponent(keyword)}&scope=${scope}`, {
      headers: { Accept: "application/json" }
    });

    if (!res.ok) throw new Error("검색 실패");

    const mails = await res.json();
    allMails = mails.sort((a, b) => new Date(b.date) - new Date(a.date));
    currentPage = 1;
    renderMailList();
    renderPagination();

  } catch (err) {
    console.error("검색 실패:", err);
    alert("검색 중 오류가 발생했습니다.");
  }
}