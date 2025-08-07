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
