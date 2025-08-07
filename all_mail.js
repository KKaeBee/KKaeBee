const API_BASE = "http://localhost:3000";
const MAX_ID = 54; 

async function fetchAllMails() {
  try {
    const allMails = [];

    for (let id = 1; id <= MAX_ID; id++) {
      const res = await fetch(`${API_BASE}/api/notices/${id}`);
      if (!res.ok) {
        console.warn(`ID ${id} 없음 → 중단`);
        break;
      }

      const mail = await res.json();
      allMails.push(mail);
    }

    // 🔹 최신 날짜 순 정렬
    allMails.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderMailList(allMails);

  } catch (err) {
    console.error("📛 전체 메일 불러오기 실패:", err);
  }
}

function renderMailList(mails) {
  const mailList = document.querySelector('.mail-items');
  const mailCount = document.querySelector('.mail-count');

  if (!mails.length) {
    mailList.innerHTML = `<li class="no-mail">메일이 없습니다.</li>`;
    mailCount.textContent = "전체 0건";
    return;
  }

  mailList.innerHTML = mails.map(mail => `
    <li class="mail-item ${mail.is_read ? '' : 'unread'}">
      <span class="badge ${mail.source.includes('금융위') ? 'orange' : 'yellow'}">${mail.source}</span>
      <span class="mail-title">${mail.title}</span>
      <span class="mail-date">${mail.date}</span>
      <button class="mail-star ${mail.is_starred ? 'active' : ''}">
        ${mail.is_starred ? '★' : '☆'}
      </button>
    </li>
  `).join('');

  mailCount.textContent = `전체 ${mails.length}건`;
}

document.addEventListener("DOMContentLoaded", fetchAllMails);
