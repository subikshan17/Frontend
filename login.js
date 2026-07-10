const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    loginMessage.textContent = "Logging in...";
    loginMessage.className = "message";

    try {
        const response = await fetch(`${API_BASE_URL}/api/tickettally/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            loginMessage.textContent = data.message || "Invalid email or password";
            loginMessage.className = "message error";
            return;
        }

        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("userRole", data.role);
        loginMessage.textContent = "Login successful";
        loginMessage.className = "message success";

        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 800);

    } catch (error) {
        loginMessage.textContent = "Cannot connect to backend";
        loginMessage.className = "message error";
        console.error(error);
    }
});