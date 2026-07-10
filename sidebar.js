function loadSidebar() {
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const sidebarMenu = document.getElementById("sidebarMenu");

    if (!sidebarMenu) {
        return;
    }

    let menu = "";

    if (role === "SYSTEM_ADMIN") {
        menu = `
            <a href="dashboard.html" data-page="dashboard.html">🏠 Dashboard</a>
            <a href="events.html" data-page="events.html">📅 Events</a>
            <a href="create-event.html" data-page="create-event.html">➕ Create Event</a>
            <a href="users.html" data-page="users.html">👥 Manage Users</a>
            <a href="reports.html" data-page="reports.html">📊 Reports</a>
            <a href="scan.html" data-page="scan.html">📲 Scan Ticket</a>
            <a href="profile.html" data-page="profile.html">👤 Profile</a>
        `;
    } else if (role === "EVENT_ORGANIZER") {
        menu = `
            <a href="dashboard.html" data-page="dashboard.html">🏠 Dashboard</a>
            <a href="events.html" data-page="events.html">📅 Events</a>
            <a href="create-event.html" data-page="create-event.html">➕ Create Event</a>
            <a href="reports.html" data-page="reports.html">📊 Reports</a>
            <a href="profile.html" data-page="profile.html">👤 Profile</a>
        `;
    } else if (role === "TICKET_HOLDER") {
        menu = `
            <a href="dashboard.html" data-page="dashboard.html">🏠 Dashboard</a>
            <a href="events.html" data-page="events.html">📅 Browse Events</a>
            <a href="my-tickets.html" data-page="my-tickets.html">🎟️ My Tickets</a>
            <a href="profile.html" data-page="profile.html">👤 Profile</a>
        `;
    } else if (role === "GATE_CONTROLLER") {
        menu = `
            <a href="dashboard.html" data-page="dashboard.html">🏠 Dashboard</a>
            <a href="scan.html" data-page="scan.html">📲 Scan Ticket</a>
            <a href="profile.html" data-page="profile.html">👤 Profile</a>
        `;
    } else {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    sidebarMenu.innerHTML = menu;

    // Highlight the active page in the sidebar
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const links = sidebarMenu.querySelectorAll("a");
    links.forEach(link => {
        const pageAttr = link.getAttribute("data-page");
        if (currentPage === pageAttr || (currentPage === "dashboard.html" && pageAttr === "dashboard.html")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.clear();
            window.location.href = "login.html";
        });
    }
}

// Automatically load when DOM is ready
document.addEventListener("DOMContentLoaded", loadSidebar);