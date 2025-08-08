const API_BASE = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", async () => {
    const deptId = sessionStorage.getItem("department_id");
    const mailList = document.getElementById("important-list");
    const mailCount = document.querySelector(".mail-count");

    if (!deptId || !mailList) {
        alert("로그인이 필요합니다.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/notices?department_id=${deptId}`, {
            headers: { Accept: "application/json" }
        });

        if (!res.ok) throw new Error("API 오류");

        const allMails = await res.json();
        const starredMails = allMails.filter(mail => mail.is_starred);

        if (!starredMails.length) {
            mailList.innerHTML = `<li class="no-mail">중요 메일이 없습니다.</li>`;
            mailCount.textContent = `전체 0건`;
            return;
        }

        // 렌더링
        mailList.innerHTML = starredMails.map(mail => `
    <li class="mail-item ${mail.is_read ? '' : 'unread'}">
        <span class="badge ${mail.source.includes('금융위') ? "orange" : "yellow"}">${mail.source}</span>
        <a href="#" class="mail-title" onclick="event.preventDefault(); goToDetail(${mail.id})">
            ${mail.title}
        </a>
        <span class="mail-date">${mail.date}</span>
        <button class="mail-star ${mail.is_starred ? 'active' : ''}" data-id="${mail.id}">
        ${mail.is_starred ? '★' : '☆'}
        </button>
    </li>
    `).join('');

        mailCount.textContent = `전체 ${starredMails.length}건`;

    } catch (err) {
        console.error("중요 메일 불러오기 실패:", err);
        alert("중요 메일을 불러오는 데 실패했습니다.");
    }
});
