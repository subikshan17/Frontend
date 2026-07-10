document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("jwtToken");
    const name = localStorage.getItem("fullName") || localStorage.getItem("userName") || "User";
    const email = localStorage.getItem("userEmail") || "--";
    const role = localStorage.getItem("userRole") || "TICKET_HOLDER";

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Header updates
    document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
    document.getElementById("userName").textContent = name;
    document.getElementById("userRole").textContent = formatRole(role);

    // Profile Card updates
    document.getElementById("profileInitial").textContent = name.charAt(0).toUpperCase();
    document.getElementById("profileName").textContent = name;
    
    const roleBadge = document.getElementById("profileRoleBadge");
    roleBadge.innerHTML = `<span class="status-badge ${getRoleClass(role)}">${formatRole(role)}</span>`;

    // Profile Info updates
    document.getElementById("profileFullName").textContent = name;
    document.getElementById("profileEmail").textContent = email;
    document.getElementById("profileUsername").textContent = email; // Backend sets username as email
    document.getElementById("profileRole").textContent = formatRole(role);
});

function formatRole(role) {
    if (!role) return "User";
    return role.replace("ROLE_", "").replace("_", " ");
}

function getRoleClass(role) {
    switch (role) {
        case "SYSTEM_ADMIN":
            return "online"; // Green
        case "EVENT_ORGANIZER":
            return "warning"; // Amber
        case "GATE_CONTROLLER":
            return "draft"; // Yellow
        case "TICKET_HOLDER":
        default:
            return "published"; // Emerald
    }
}
