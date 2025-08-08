const API_BASE = "http://localhost:3000";

const MAX_ID = 100;

const mailsPerPage = 6;
let currentPage = 1;
let allMails = [];

async function fetchAllMails() {
  try {
    allMails = [];

    for (let id = 1; id <= MAX_ID; id++) {
      const res = await fetch(`${API_BASE}/api/notices/${id}`);
      if (!res.ok) {
        console.warn(`ID ${id} 없음 → 중단`);
        break;
      }

      const mail = await res.json();
      allMails.push(mail);
    }

    allMails.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderMailList();
    renderPagination();
  } catch (err) {
    console.error("📛 전체 메일 불러오기 실패:", err);
  }
}

function renderMailList() {
  const mailList = document.querySelector('.mail-items');
  const mailCount = document.querySelector('.mail-count');

  if (!allMails.length) {
    mailList.innerHTML = `<li class="no-mail">메일이 없습니다.</li>`;
    mailCount.textContent = "전체 0건";
    return;
  }


  const start = (currentPage - 1) * mailsPerPage;
  const end = start + mailsPerPage;
  const pageMails = allMails.slice(start, end);

  mailList.innerHTML = pageMails.map(mail => `
    <li class="mail-item ${mail.is_read ? '' : 'unread'}">
      <span class="badge ${mail.source.includes('금융위') ? 'orange' : 'yellow'}">${mail.source}</span>
      <a href="#" class="mail-title" onclick="event.preventDefault(); goToDetail(${mail.id})">
        ${mail.title}
      </a>
      <span class="mail-date">${mail.date}</span>
      <button class="mail-star ${mail.is_starred ? 'active' : ''}" data-id="${mail.id}">
        ${mail.is_starred ? '★' : '☆'}
      </button>
      </li>
  `).join('');


  mailList.addEventListener('click', (e) => {
    const btn = e.target.closest('.mail-link');
    if (!btn) return;
    goToDetail(btn.dataset.id);
  });

  mailCount.textContent = `전체 ${allMails.length}건`;
}

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

async function fetchSearchResults(keyword) {
  try {
    const departmentId = sessionStorage.getItem("department_id");
    if (!departmentId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const scope = 'all';

    if (!keyword) {
      fetchAllMails();
      return;
    }

    const res = await fetch(`${API_BASE}/api/notices/search?department_id=${departmentId}&keyword=${encodeURIComponent(keyword)}&scope=${scope}`, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!res.ok) throw new Error("검색 실패");

    allMails = await res.json();
    currentPage = 1;
    renderMailList();
    renderPagination();

  } catch (err) {
    console.error("검색 실패:", err);
    alert("검색 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAllMails();

  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-bar');

  searchBtn.addEventListener('click', () => {
    const keyword = searchInput.value.trim();
    fetchSearchResults(keyword);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const keyword = searchInput.value.trim();
      fetchSearchResults(keyword);
    }
  });
});