const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.querySelector(".login-btn");

passwordInput.addEventListener("input", function () {
    //this.value = this.value.replace(/[^A-Za-z0-9]/g, "");
});

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        const res = await fetch("http://localhost:3000/api/departments/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password })
        });

        if (!res.ok) {
        let msg = "로그인 실패";
        try {
            const err = await res.json();
            if (err?.message) msg = err.message;
        } catch {}
        throw new Error(msg);
        }

        const data = await res.json();
        console.log("로그인 성공:", data);

        sessionStorage.setItem("department_id", data.department_id);
        sessionStorage.setItem("department_name", data.name);
         // 부서명 localStorage에 저장
        localStorage.setItem("deptName", name);
        localStorage.setItem("dept_id", data.department_id);

        
        window.location.href = "./department.html";
    } catch (err) {
        console.error("로그인 오류:", err);
        passwordInput.value = "";
        alert("로그인에 실패했습니다.");
        setTimeout(() => {
        usernameInput.focus();
        usernameInput.select?.();
        }, 0);
    } finally {
        // 다시 입력 가능하게
        loginBtn.disabled = false;
    }
    });
