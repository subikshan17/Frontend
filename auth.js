function saveToken(token) {
    localStorage.setItem("jwtToken", token);
}

function getToken() {
    return localStorage.getItem("jwtToken");
}

function removeToken() {
    localStorage.removeItem("jwtToken");
}

function isLoggedIn() {
    return getToken() !== null;
}

function logout() {
    removeToken();
    window.location.href = "login.html";
}

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
    };
}