const API_BASE = "http://localhost:3000";

let allMails = [];  // 전체 데이터 저장
let currentPage = 1;
const mailsPerPage = 6;

document.addEventListener("DOMContentLoaded", async () => {
    const deptId = sessionStorage.getItem("department_id");
    const mailList = document.getElementById("important-list");
    const mailCount = document.querySelector(".mail-count");
    const searchBtn = document.querySelector(".search-btn");
    const searchInput = document.querySelector(".search-bar");

    if (!deptId || !mailList) {
        alert("로그인이 필요합니다.");
        return;
    }

    await fetchImportantMails(deptId);
    
    // 검색 이벤트
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const keyword = searchInput.value.trim();
            fetchImportantSearchResults(deptId, keyword);
        });

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const keyword = searchInput.value.trim();
                fetchImportantSearchResults(deptId, keyword);
            }
        });
    }

    // 중요 메일 리스트 클릭 시 읽음 처리 후 상세 페이지 이동
    const list = document.querySelector("#important-list");
    list?.addEventListener("click", async (e) => {
        const link = e.target.closest(".mail-title");
        if (!link) return;

        e.preventDefault();
        const id = link.dataset.goto;
        if (!id) return;

        await markAsRead(id).catch(() => { });

        window.location.href = link.href;
    });

    // 제목 클릭 시 id를 백업 저장 (상세에서 ?id 없을 때 대비)
    document.addEventListener("click", (e) => {
        const a = e.target.closest("a.mail-title");
        if (a && a.dataset.goto) {
            sessionStorage.setItem("last_notice_id", a.dataset.goto);
        }
    });
});

async function fetchImportantMails(deptId) {
    try {
        const res = await fetch(`${API_BASE}/api/notices?department_id=${deptId}`, {
            headers: { Accept: "application/json" }
        });

        if (!res.ok) throw new Error("API 오류");

        const data = await res.json();
        allMails = data.filter(mail => mail.is_starred);
        currentPage = 1;
        renderMailList();
        renderPagination();

    } catch (err) {
        console.error("중요 메일 불러오기 실패:", err);
        alert("중요 메일을 불러오는 데 실패했습니다.");
    }
}

// 검색 api
async function fetchImportantSearchResults(deptId, keyword) {
    if (!keyword) {
        await fetchImportantMails(deptId);
        return;
    }

    try {
        const scope = 'starred';
        const res = await fetch(`${API_BASE}/api/notices/search?department_id=${deptId}&keyword=${encodeURIComponent(keyword)}&scope=${scope}`, {
            headers: { Accept: "application/json" }
        });

        if (!res.ok) throw new Error("검색 실패");

        const result = await res.json();
        allMails = result;
        currentPage = 1;
        renderMailList();
        renderPagination();

    } catch (err) {
        console.error("검색 실패:", err);
        alert("검색 중 오류가 발생했습니다.");
    }
}

function renderMailList() {
    const mailList = document.getElementById("important-list");
    const mailCount = document.querySelector(".mail-count");

    if (!mailList || !mailCount) return;

    const start = (currentPage - 1) * mailsPerPage;
    const end = start + mailsPerPage;
    const pageMails = allMails.slice(start, end);

    if (!pageMails.length) {
        mailList.innerHTML = `<li class="no-mail">중요 메일이 없습니다.</li>`;
        mailCount.textContent = `전체 0건`;
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
            <button class="mail-star ${mail.is_starred ? 'active' : ''}" data-id="${mail.id}">
            ${mail.is_starred ? '★' : '☆'}
            </button>
        </li>
    `).join('');

    mailCount.textContent = `전체 ${allMails.length}건`;
}

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

// 읽음 처리 api
async function markAsRead(id) {
    const deptId = sessionStorage.getItem("department_id");
    if (!deptId) return;

    try {
        const res = await fetch(`${API_BASE}/api/notices/${id}/read`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ department_id: Number(deptId) }),
        });
        if (!res.ok) throw new Error(`read api 실패: ${res.status}`);

        // 1) 로컬 상태 업데이트
        const i = allMails.findIndex((m) => String(m.id) === String(id));
        if (i !== -1) allMails[i].is_read = 1;

        // 2) DOM 즉시 반영
        const li = document.querySelector(`.mail-item[data-mail-id="${id}"]`);
        if (li) {
            li.classList.remove("unread");
            li.dataset.isRead = "1";
            li.querySelector(".red-dot")?.remove();
        }

        renderMailList();
    } catch (e) {
        console.error("읽음 처리 실패:", e);
    }
}