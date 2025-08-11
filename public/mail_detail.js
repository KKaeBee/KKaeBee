const API_BASE = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", async () => {

  // 1차: 쿼리스트링
  let id = new URL(location.href).searchParams.get("id");

  // 2차: 리스트에서 저장해 둔 백업값
  if (!id) {
    id = sessionStorage.getItem("last_notice_id") || null;
  }

  // 3차: 리퍼러에 남아있다면 거기서라도
  if (!id && document.referrer) {
    try {
      const ref = new URL(document.referrer);
      id = ref.searchParams.get("id");
    } catch (_) { }
  }

  // 디버그 (원인이 계속되면 콘솔 스샷만 보내줘)
  console.log("[mail_detail] href:", location.href, "id:", id);

  if (!id) {
    document.getElementById("mail-detail").innerHTML =
      "<p>잘못된 접근입니다. 목록에서 다시 선택해 주세요.</p>";
    return;
  }

  const params = new URLSearchParams(location.search);
  // const id = params.get("id"); // URL 파라미터에서만 읽기

  if (!id) {
    document.getElementById("mail-detail").innerHTML =
      "<p>잘못된 접근입니다. 목록에서 다시 선택해 주세요.</p>";
    return;
  }

  try {
    // (1) 메일 기본정보
    const baseRes = await fetch(`${API_BASE}/api/notices/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" }
    });
    if (!baseRes.ok) throw new Error("기본 정보 API 실패");
    const base = await baseRes.json(); // { id,title,date,source,url,... }

    // 즐겨찾기 정보
    try {
      const starred = await fetchStarFromAll(id);
      if (starred !== null) base.is_starred = starred;
    } catch (e) {
      console.warn("즐겨찾기 상태 API 실패", e);
    }

    // (2) 메일 상세정보
    const detailRes = await fetch(`${API_BASE}/api/notices/${encodeURIComponent(id)}/json`, {
      headers: { Accept: "application/json" }
    });
    if (!detailRes.ok) throw new Error("상세 정보 API 실패");
    const detail = await detailRes.json(); // { department, summary, checklist }

    render({ base, detail });
  } catch (e) {
    console.error(e);
    document.getElementById("mail-detail").innerHTML =
      "<p>메일 상세 정보를 불러오는 데 실패했습니다.</p>";
  }
});

function render({ base, detail }) {
  const container = document.getElementById("mail-detail");

  const departmentHtml = (detail.department || [])
    .map(dep => `<span class="badge chip">${dep}</span>`)
    .join(" ");

  const summaryHtml = Object.entries(detail.summary || {})
    .map(([title, items]) => `
      <ol>
        <strong>${title}</strong>
        <ul>${(items || []).map(v => `<li>${v}</li>`).join("")}</ul>
      </ol>
    `).join("");

  const checklistHtml = (detail.checklist || [])
    .map(v => `<li>${v}</li>`)
    .join("");

  container.innerHTML = `
    <div class="detail-header">
      <span class="badge ${String(base.source).includes('금융위') ? 'orange' : 'yellow'}">
        ${base.source ?? ""}
      </span>
      <h1 class="detail-title">${base.title ?? ""}</h1>
      <div class="detail-meta">
        <span class="mail-date">${base.date ?? ""}</span>
        <button class="mail-star ${base.is_starred ? "active" : ""}" data-id="${base.id}">
          ${base.is_starred ? "★" : "☆"}
        </button>
      </div>
    </div>

    <section class="detail-card">
      <h3>관련부서</h3>
      <div class="chips">${departmentHtml || "-"}</div>
    </section>

    <section class="detail-card">
      <h3>요약</h3>
      <span class="mail-summary">${summaryHtml || "<li>요약이 없습니다.</li>"}</span>
    </section>

    <section class="detail-card">
      <h3>체크리스트</h3>
      <ul class="checklist">${checklistHtml || "<li>체크리스트가 없습니다.</li>"}</ul>
    </section>

    <section class="detail-card">
      <h3>URL</h3>
      <a class="origin-link" href="${base.url || '#'}" target="_blank" rel="noopener">
        ${base.url || "-"}
      </a>
    </section>

    <div class="back-btn-wrap">
      <button class="back-btn" onclick="history.back()">← 목록</button>
    </div>
  `;
}

// 별표 조회 기능
function getDeptId() {
  return sessionStorage.getItem("department_id");
}

async function fetchStarFromAll(noticeId) {
  const deptId = getDeptId();
  if (!deptId) return null;

  const res = await fetch(`${API_BASE}/api/notices/all?department_id=${deptId}`, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) throw new Error("all API 실패");

  const rows = await res.json();
  const found = rows.find(r => String(r.id) === String(noticeId));
  return found ? !!found.is_starred : null;
}