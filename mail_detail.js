document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  // const id = params.get("id");
  const id = localStorage.getItem("selectedMailId");

  // id가 없으면 바로 종료
  if (!id) {
    document.getElementById("mail-detail").innerHTML =
      "<p>잘못된 접근입니다. 목록에서 다시 선택해 주세요.</p>";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/notices/${encodeURIComponent(id)}/json`, {
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) throw new Error("API 응답 실패");

    const data = await res.json();
    renderMailDetail(data);

  } catch (err) {
    console.error("오류 발생:", err);
    document.getElementById("mail-detail").innerHTML =
      "<p>메일 상세 정보를 불러오는 데 실패했습니다.</p>";
  }
});

function renderMailDetail(data) {
  const container = document.getElementById("mail-detail");

  const summaryHtml = Object.entries(data.summary || {}).map(
    ([section, items]) => `
    <li>
      <strong>${section}</strong>
      <ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>
    </li>`
  ).join("");

  const checklistHtml = (data.checklist || []).map(item => `<li>${item}</li>`).join("");
  const departmentHtml = (data.department || []).map(dep => `<span class="tag">${dep}</span>`).join(" ");

  container.innerHTML = `
  <section class="mail-list">
    <div class="section">
      <h3>관련 부서</h3>
      <div>${departmentHtml}</div>
    </div>
    <div class="section">
      <h3>요약</h3>
      <ul>${summaryHtml}</ul>
    </div>
    <div class="section">
      <h3>체크리스트</h3>
      <ul>${checklistHtml}</ul>
    </div>
    <div class="back-btn-container" style="margin-top: 20px;">
      <button 
        onclick="history.back()" 
        style="
          background-color: #f5f5f5;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #555555;`
        ">
        ← 목록
      </button>
    </div>
  </section>
  `;
}
