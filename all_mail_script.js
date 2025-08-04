document.addEventListener("DOMContentLoaded", function () {
  // 알림 아이콘 클릭 시 드롭다운 토글
  const alarmIcon = document.querySelector(".alarm-icon");
  const alarmCount = document.querySelector(".alarm-count");

  // 알림 드롭다운 만들기 (간단한 예시)
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
  document.querySelector(".alarm-container").appendChild(alarmDropdown);

  alarmIcon.addEventListener("click", function (e) {
    e.stopPropagation(); // 다른 클릭 막기
    const isVisible = alarmDropdown.style.display === "block";
    alarmDropdown.style.display = isVisible ? "none" : "block";

    // 읽음 처리: 알림 아이콘 이미지 변경
    if (!isVisible) {
      alarmIcon.src = "icon/ic_alarm_48.png";
      if (alarmCount) alarmCount.style.display = "none";
    }
  });

  // 화면 다른 곳 클릭 시 드롭다운 숨김
  document.addEventListener("click", function () {
    alarmDropdown.style.display = "none";
  });

  // 메일 클릭 시 읽음 표시 제거
  const mailItems = document.querySelectorAll(".mail-item");
  mailItems.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.remove("unread");
    });
  });
});

  const deptToggleBtn = document.querySelector(".dept-name-toggle");
  const deptMenu = document.querySelector(".dept-menu");

  deptToggleBtn.addEventListener("click", function (e) {
    e.stopPropagation(); // 바깥 클릭 이벤트 방지
    deptMenu.classList.toggle("show");
  });

  // 화면 다른 곳 클릭 시 드롭다운 숨김
  document.addEventListener("click", function () {
    deptMenu.classList.remove("show");
  });

  const paginationButtons = document.querySelectorAll(".pagination button");

  paginationButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 숫자 버튼만 적용: 1~5
      if (!isNaN(btn.textContent)) {
        paginationButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });

document.addEventListener("DOMContentLoaded", function () {
  const stars = document.querySelectorAll(".mail-star");

  stars.forEach(star => {
    star.addEventListener("click", function () {
      if (star.classList.contains("active")) {
        star.classList.remove("active");
        star.textContent = "☆"; // 비워진 별
      } else {
        star.classList.add("active");
        star.textContent = "★"; // 꽉 찬 별
      }
    });
  });
});
