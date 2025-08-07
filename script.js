// gnb.html, sidebar.html 외부 HTML 불러오기 함수
function includeHTML(selector, url, callback) {
  fetch(url)
    .then((res) => res.text())
    .then((data) => {
      document.querySelector(selector).innerHTML = data;
      if (typeof callback === "function") callback();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  // GNB 불러오기 + 알림/부서 드롭다운 이벤트 연결
  includeHTML(".gnb", "gnb.html", () => {
    const alarmIcon = document.querySelector(".alarm-icon");
    const alarmCount = document.querySelector(".alarm-count");

    // 알림 드롭다운 생성
    const alarmDropdown = document.createElement("div");
    alarmDropdown.className = "alarm-dropdown";
    alarmDropdown.innerHTML = `
      <ul>
        <li><strong>금융감독원 최근 제개정 정보</strong><br><span>금융지주회사감독규정시행세칙 개정안...</span></li>
        <li><strong>금융위원회</strong><br><span>금융지주회사감독규정시행세칙 개정안...</span></li>
        <li><strong>금융감독원 세칙 제개정 예고</strong><br><span>금융지주회사감독규정시행세칙 개정안...</span></li>
      </ul>
    `;
    alarmDropdown.style.display = "none";
    document.querySelector(".alarm-container")?.appendChild(alarmDropdown);

    alarmIcon?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = alarmDropdown.style.display === "block";
      alarmDropdown.style.display = isVisible ? "none" : "block";

      if (!isVisible) {
        alarmIcon.src = "icon/ic_alarm_48.png";
        if (alarmCount) alarmCount.style.display = "none";
      }
    });

    // 부서 이름 클릭 시 로그아웃 버튼 드롭다운
    const deptToggleBtn = document.querySelector(".dept-name-toggle");
    const deptMenu = document.querySelector(".dept-menu");

    deptToggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      deptMenu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      if (alarmDropdown) alarmDropdown.style.display = "none";
      if (deptMenu) deptMenu.classList.remove("show");
    });
  });

  // 사이드바 불러오기 + 탭 색상 토글
  includeHTML(".sidebar", "sidebar.html", () => {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("orange"));
        tab.classList.add("orange");
      });
    });
  });

  // 페이지네이션 버튼 클릭 처리
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer?.addEventListener("click", (e) => {
    const target = e.target;
    if (target.tagName !== "BUTTON") return;

    const active = paginationContainer.querySelector("button.active");

    // ← 버튼
    if (target.classList.contains("prev")) {
      const prevBtn = active?.previousElementSibling;
      if (prevBtn && !prevBtn.classList.contains("prev")) {
        active.classList.remove("active");
        prevBtn.classList.add("active");
      }
    }

    // → 버튼
    else if (target.classList.contains("next")) {
      const nextBtn = active?.nextElementSibling;
      if (nextBtn && !nextBtn.classList.contains("next")) {
        active.classList.remove("active");
        nextBtn.classList.add("active");
      }
    }

    // 숫자 클릭
    else if (!isNaN(target.textContent)) {
      paginationContainer.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      target.classList.add("active");
    }
  });

  // 별표 클릭 시 토글 (전체 적용)
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("mail-star")) {
      e.target.classList.toggle("active");
      e.target.textContent = e.target.classList.contains("active") ? "★" : "☆";

      const isImportantPage = location.pathname.includes("important.html");
      if (isImportantPage && !e.target.classList.contains("active")) {
        const li = e.target.closest("li");
        if (li) li.remove();
      }
    }
  });
});
