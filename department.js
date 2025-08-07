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
    console.log("부서 메일 목록:", mails);

    renderMails(mails);
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

function renderMails(mails) {
  const mailList = document.querySelector('.mail-items');
  const mailCount = document.querySelector('.mail-count');

  if (!mailList || !mailCount) {
    console.error("메일 리스트 영역이 없습니다.");
    return;
  }

  if (!mails.length) {
    mailList.innerHTML = `<li class="no-mail">메일이 없습니다.</li>`;
    mailCount.textContent = "전체 0건";
    return;
  }

  mailList.innerHTML = mails.map(mail => `
    <li class="mail-item ${mail.is_read ? '' : 'unread'}">
      <span class="badge ${mail.source.includes('금융위') ? 'orange' : 'yellow'}">${mail.source}</span>
      <a href="${mail.url}" target="_blank" class="mail-title">${mail.title}</a>
      <span class="mail-date">${mail.date}</span>
      <button class="mail-star ${mail.is_starred ? 'active' : ''}">
        ${mail.is_starred ? '★' : '☆'}
      </button>
    </li>
  `).join('');

  mailCount.textContent = `전체 ${mails.length}건`;
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
    renderMails(mails);

  } catch (err) {
    console.error("검색 실패:", err);
    alert("검색 중 오류가 발생했습니다.");
  }
}