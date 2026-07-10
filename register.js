const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");
const registerBtn = document.getElementById("registerBtn");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    message.textContent = "";
    message.className = "message";

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;

    if (!fullName || !email || !password || !confirmPassword || !role) {
        showMessage("All fields are required.", "error");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
    }

    const registerData = {
        fullName: fullName,
        email: email,
        password: password,
        role: role
    };

    try {
        registerBtn.disabled = true;
        registerBtn.textContent = "Creating account...";

        await apiRequest("/api/tickettally/register", "POST", registerData);

        showMessage("Registration successful. Redirecting to login...", "success");

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {
        console.error(error);
        showMessage("Registration failed. Email may already exist.", "error");
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = "Create Account";
    }
});

function showMessage(text, type) {
    message.textContent = text;
    message.classList.add(type);
}