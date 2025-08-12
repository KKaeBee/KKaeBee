// 최초 실행 시 기존 알림 아이콘 alarm_seen_ 데이터 삭제
Object.keys(localStorage).forEach(key => {
    if (key.startsWith('alarm_seen_')) {
        localStorage.removeItem(key);
    }
});

function getCurrentDeptId() {
  return sessionStorage.getItem("department_id") || localStorage.getItem("dept_id");
}
function alarmSeenKey() {
  const deptId = getCurrentDeptId();
  return deptId ? `alarm_seen_${deptId}` : "alarm_seen_unknown"; // 로그인 전 대비
}

document.addEventListener("DOMContentLoaded", function () {
  try { localStorage.removeItem("alarm_seen"); } catch {}

  // 알림 아이콘 클릭 시 드롭다운 생성 및 토글 표시
  const alarmIcon = document.querySelector(".alarm-icon");
  const alarmCount = document.querySelector(".alarm-count");

  const alarmDropdown = document.createElement("div");
  alarmDropdown.className = "alarm-dropdown";
  alarmDropdown.innerHTML = `
    <ul class="alarm-list">
      <li class="loading">불러오는 중...</li>
    </ul>
  `;
  alarmDropdown.style.display = "none";
  document.querySelector(".alarm-container")?.appendChild(alarmDropdown);

  // 아이콘 한 번이라도 눌렀으면 기본 아이콘으로 시작
  const seen = localStorage.getItem(alarmSeenKey()) === "1";
  if (seen && alarmIcon) {
    alarmIcon.src = "icon/ic_alarm_48.png";
    if (alarmCount) alarmCount.style.display = "none";
  }

  alarmIcon?.addEventListener("click", function (e) {
    e.stopPropagation();
    const isVisible = alarmDropdown.style.display === "block";
    alarmDropdown.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
      localStorage.setItem(alarmSeenKey(), "1"); // 아이콘 눌렀음을 영구 저장
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
    window.location.href = "./index.html"; // 로그인 페이지로 이동
  });

  // 바깥 영역 클릭 시 알림/부서 드롭다운 모두 닫기
  document.addEventListener("click", function () {
    if (alarmDropdown) alarmDropdown.style.display = "none";
    if (deptMenu) deptMenu.classList.remove("show");
  });

//   // 중요 메일 페이지일 경우: starredMails를 렌더링
//   const importantList = document.getElementById("important-list");
//   if (importantList) {
//     const starredMails = [
//       {
//         from: "금융위",
//         title: "금융지주회사감독규정시행세칙 개정안이 업데이트 되었습니다",
//         date: "2025.06.18"
//       },
//       {
//         from: "금융위",
//         title: "금융지주회사감독규정시행세칙 개정안이 업데이트 되었습니다",
//         date: "2025.07.02"
//       },
//       {
//         from: "금감원",
//         title: "금융지주회사감독규정시행세칙 개정안이 업데이트 되었습니다",
//         date: "2025.07.10"
//       },
//       {
//         from: "금감원",
//         title: "금융지주회사감독규정시행세칙 개정안 관련 안내",
//         date: "2025.08.04"
//       }
//     ];

//     starredMails.forEach(mail => {
//       const li = document.createElement("li");
//       li.className = "mail-item";
//       li.innerHTML = `
//         <span class="badge ${mail.from === "금융위" ? "orange" : "yellow"}">${mail.from}</span>
//         <span class="mail-title">${mail.title}</span>
//         <span class="mail-date">${mail.date}</span>
//         <button class="mail-star active">★</button>
//       `;
//       importantList.appendChild(li);
//     });
//   }

//   // 메일 항목 클릭 시 읽지 않음 표시 제거
//   const mailItems = document.querySelectorAll(".mail-item");
//   mailItems.forEach((item) => {
//     item.addEventListener("click", () => {
//       item.classList.remove("unread");
//     });
//   });

//   // 별표 아이콘 클릭 시 즐겨찾기 토글 (★/☆)
//   const stars = document.querySelectorAll(".mail-star");
//   stars.forEach(star => {
//     star.addEventListener("click", function (e) {
//   e.stopPropagation();
//   if (star.classList.contains("active")) {
//     star.classList.remove("active");
//     star.textContent = "☆";

//     // 중요 메일 페이지에서는 비활성화 시 메일 삭제
//     if (document.getElementById("important-list")) {
//       star.closest(".mail-item")?.remove();
//     }
//   } else {
//     star.classList.add("active");
//     star.textContent = "★";
//   }
// });
//   });

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

// mail_detail로 이동하는 함수 (공통)
function goToDetail(id) {
  window.location.href = `mail_detail.html?id=${id}`;
}

// 공통 즐겨찾기 토글 기능
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", async (e) => {
    const starBtn = e.target.closest(".mail-star");
    if (!starBtn) return;

    e.stopPropagation(); // 상세 페이지 이동 방지
    e.preventDefault();

    const noticeId = starBtn.dataset.id;
    const departmentId = sessionStorage.getItem("department_id");
    if (!noticeId || !departmentId) return;

    try {
      const res = await fetch(`${API_BASE}/api/notices/${noticeId}/star`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_id: departmentId })
      });

      const result = await res.json();

      if (result.is_starred) {
        starBtn.classList.add("active");
        starBtn.textContent = "★";
      } else {
        starBtn.classList.remove("active");
        starBtn.textContent = "☆";

        // 중요 메일 페이지라면 해당 항목 제거 + 카운트 갱신
        if (document.getElementById("important-list")) {
          starBtn.closest(".mail-item")?.remove();
          updateImportantCount();
        }
      }
    } catch (err) {
      console.error("즐겨찾기 토글 실패", err);
    }
  });
});

// 중요 메일 수 카운트 갱신
function updateImportantCount() {
  const list = document.getElementById("important-list");
  const count = document.querySelector(".mail-count");
  if (!list || !count) return;

  const total = list.querySelectorAll(".mail-item").length;
  if (total === 0) {
    list.innerHTML = "<li class='no-mail'> 중요 메일이 없습니다.</li>";
  }
  count.textContent = `전체 ${total}건`;
}
