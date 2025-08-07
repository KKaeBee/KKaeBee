document.addEventListener("DOMContentLoaded", function () {
  // 알림 아이콘 클릭 시 드롭다운 생성 및 토글 표시
  const alarmIcon = document.querySelector(".alarm-icon");
  const alarmCount = document.querySelector(".alarm-count");

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

  alarmIcon?.addEventListener("click", function (e) {
    e.stopPropagation();
    const isVisible = alarmDropdown.style.display === "block";
    alarmDropdown.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
      alarmIcon.src = "icon/ic_alarm_48.png";
      if (alarmCount) alarmCount.style.display = "none";
    }
  });

  // 부서명 표시
  const deptName = localStorage.getItem("deptName");
  const deptNameSpan = document.querySelector(".dept-name");
  if (deptName && deptNameSpan) {
    deptNameSpan.textContent = deptName;
  }

  // 부서명 클릭 시 로그아웃 버튼 드롭다운 토글
  const deptToggleBtn = document.querySelector(".dept-name-toggle");
  const deptMenu = document.querySelector(".dept-menu");

  deptToggleBtn?.addEventListener("click", function (e) {
    e.stopPropagation();
    deptMenu.classList.toggle("show");
  });

  // 로그아웃 버튼 클릭 시 localStorage 초기화 및 로그인 페이지 이동
  const logoutBtn = document.querySelector(".logout-btn");
  logoutBtn?.addEventListener("click", function () {
    localStorage.removeItem("deptName");
    window.location.href = "../login/login.html"; // 로그인 페이지로 이동
  });

  // 바깥 영역 클릭 시 알림/부서 드롭다운 모두 닫기
  document.addEventListener("click", function () {
    if (alarmDropdown) alarmDropdown.style.display = "none";
    if (deptMenu) deptMenu.classList.remove("show");
  });

  // 중요 메일 페이지일 경우: starredMails를 렌더링
  const importantList = document.getElementById("important-list");
  if (importantList) {
    const starredMails = [
      {
        from: "금융위",
        title: "금융지주회사감독규정시행세칙 개정안이 업데이트 되었습니다",
        date: "2025.06.18"
      },
      {
        from: "금융위",
        title: "금융지주회사감독규정시행세칙 개정안이 업데이트 되었습니다",
        date: "2025.07.02"
      },
      {
        from: "금감원",
        title: "금융지주회사감독규정시행세칙 개정안이 업데이트 되었습니다",
        date: "2025.07.10"
      },
      {
        from: "금감원",
        title: "금융지주회사감독규정시행세칙 개정안 관련 안내",
        date: "2025.08.04"
      }
    ];

    starredMails.forEach(mail => {
      const li = document.createElement("li");
      li.className = "mail-item";
      li.innerHTML = `
        <span class="badge ${mail.from === "금융위" ? "orange" : "yellow"}">${mail.from}</span>
        <span class="mail-title">${mail.title}</span>
        <span class="mail-date">${mail.date}</span>
        <button class="mail-star active">★</button>
      `;
      importantList.appendChild(li);
    });
  }

  // 메일 항목 클릭 시 읽지 않음 표시 제거
  const mailItems = document.querySelectorAll(".mail-item");
  mailItems.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.remove("unread");
    });
  });

  // 별표 아이콘 클릭 시 즐겨찾기 토글 (★/☆)
  const stars = document.querySelectorAll(".mail-star");
  stars.forEach(star => {
    star.addEventListener("click", function (e) {
  e.stopPropagation();
  if (star.classList.contains("active")) {
    star.classList.remove("active");
    star.textContent = "☆";

    // 중요 메일 페이지에서는 비활성화 시 메일 삭제
    if (document.getElementById("important-list")) {
      star.closest(".mail-item")?.remove();
    }
  } else {
    star.classList.add("active");
    star.textContent = "★";
  }
});
  });

  // 페이지네이션 버튼 클릭 시 active 클래스 변경
  const paginationButtons = document.querySelectorAll(".pagination button");
  paginationButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isNaN(btn.textContent)) {
        paginationButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });
});
