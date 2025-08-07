document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("data/json/fss_info.json");
    if (!res.ok) throw new Error("JSON 파일 로딩 실패");

    const mail = await res.json();
    renderMailDetail(mail);
  } catch (err) {
    console.error("메일 상세 정보 불러오기 실패:", err);
    document.getElementById("mail-detail").innerHTML = "<p>메일 상세 정보를 불러오는 데 실패했습니다.</p>";
  }
});

function renderMailDetail(mail) {
  const detailEl = document.getElementById("mail-detail");

  const badgeColor = mail.source.includes("금융위") ? "orange" : "yellow";

  // summary 구조화
  const summaryHTML = Object.entries(mail.summary).map(([title, items]) => `
    <li><strong>${title}</strong>
      <ul>${items.map(item => `<li>${item}</li>`).join("")}</ul>
    </li>
  `).join("");

  // checklist 구조화
  const checklistHTML = mail.checklist.map((item, idx) => `<li>[${idx + 1}] ${item}</li>`).join("");

  detailEl.innerHTML = `
    <span class="badge ${badgeColor}">${mail.source}</span>
    <h1 class="mail-title">${mail.title}</h1>
    <p class="mail-date">${mail.date}</p>

    <h2>요약</h2>
    <div class="mail-summary">
      <ol>${summaryHTML}</ol>
    </div>

    <h2>체크리스트</h2>
    <ul class="checklist">${checklistHTML}</ul>

    <h2>원문 링크</h2>
    <a href="${mail.url}" class="origin-link" target="_blank">금융감독원 공식 페이지로 이동</a>

    <div class="back-btn-wrap">
      <button onclick="history.back()" class="back-btn">목록</button>
    </div>
  `;
}
