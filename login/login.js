const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password");

passwordInput.addEventListener("input", function () {
    //this.value = this.value.replace(/[^A-Za-z0-9]/g, "");
});

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("username").value.trim();
    const password = passwordInput.value.trim();

    try {
        const res = await fetch("http://localhost:3000/api/departments/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "로그인 실패");
        }

        const data = await res.json();
        console.log("로그인 성공:", data);

        sessionStorage.setItem("department_id", data.department_id);
        sessionStorage.setItem("department_name", data.name);
         // 부서명 localStorage에 저장
        localStorage.setItem("deptName", name);

        
        window.location.href = "../department.html";
    } catch (err) {
        console.error("로그인 오류:", err.message);
        alert("로그인에 실패했습니다. " + err.message);
    }
});
