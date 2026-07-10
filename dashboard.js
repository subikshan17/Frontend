document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole") || "TICKET_HOLDER";
    const name = localStorage.getItem("fullName") || "User";
    const email = localStorage.getItem("userEmail") || "--";
    const userId = localStorage.getItem("userId");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Set header and detail panels
    document.getElementById("welcomeText").textContent = "Welcome back, " + name;
    document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
    document.getElementById("userName").textContent = name;
    document.getElementById("userRole").textContent = formatRole(role);

    document.getElementById("detailName").textContent = name;
    document.getElementById("detailEmail").textContent = email;
    document.getElementById("detailRole").textContent = formatRole(role);

    loadDashboardStats(role, userId);
    loadQuickActions(role);
});

async function loadDashboardStats(role, userId) {
    const totalTicketsEl = document.getElementById("totalTickets");
    const totalEventsEl = document.getElementById("totalEvents");
    const validatedTicketsEl = document.getElementById("validatedTickets");
    const totalUsersEl = document.getElementById("totalUsers");

    const scanStatCard = document.getElementById("scanStatCard");
    const userStatCard = document.getElementById("userStatCard");

    try {
        if (role === "SYSTEM_ADMIN") {
            // Hit Analytics API
            const stats = await apiRequest("/api/analytics/summary");

            totalEventsEl.innerText = stats.totalEvents ?? 0;
            totalTicketsEl.innerText = stats.totalTickets ?? 0;
            totalUsersEl.innerText = stats.totalUsers ?? 0;
            validatedTicketsEl.innerText = stats.totalGateScans ?? 0;
        } else if (role === "EVENT_ORGANIZER") {
            // Hide irrelevant stats cards
            if (userStatCard) userStatCard.style.display = "none";
            if (scanStatCard) scanStatCard.style.display = "none";
            
            // Rename Tickets to Reports Generated
            const ticketCardTitle = document.getElementById("ticketCardTitle");
            if (ticketCardTitle) {
                ticketCardTitle.innerText = "Reports";
                const ticketIconSpan = document.querySelector("#ticketStatCard span");
                if (ticketIconSpan) ticketIconSpan.innerText = "📊";
            }
            
            // Fetch events count
            const eventsRes = await apiRequest("/api/events");
            const events = eventsRes.content || eventsRes || [];
            totalEventsEl.innerText = events.length;

            // Fetch reports count
            try {
                const reports = await apiRequest("/api/reports");
                totalTicketsEl.innerText = reports.length;
            } catch (e) {
                totalTicketsEl.innerText = "0";
            }
        } else if (role === "TICKET_HOLDER") {
            // Hide admin stats cards
            if (userStatCard) userStatCard.style.display = "none";
            if (scanStatCard) scanStatCard.style.display = "none";

            // Fetch user's purchased tickets
            const tickets = await apiRequest(`/api/purchase/user/${userId}`);
            totalTicketsEl.innerText = tickets.length;

            // Fetch available events
            const eventsRes = await apiRequest("/api/events");
            const events = eventsRes.content || eventsRes || [];
            totalEventsEl.innerText = events.length;
        } else if (role === "GATE_CONTROLLER") {
            // Gate Controller only cares about scans
            if (userStatCard) userStatCard.style.display = "none";
            totalTicketsEl.parentElement.style.display = "none";
            totalEventsEl.parentElement.style.display = "none";
            
            // Show dynamic scan count
            validatedTicketsEl.innerText = "Active";
            document.querySelector("#scanStatCard h3").innerText = "Scanner Status";
        }
    } catch (error) {
        console.error("Dashboard stats error:", error);
        totalEventsEl.innerText = "0";
        totalTicketsEl.innerText = "0";
    }
}

function loadQuickActions(role) {
    const quickActions = document.getElementById("quickActions");

    if (role === "SYSTEM_ADMIN") {
        quickActions.innerHTML = `
            <a class="action-card" href="events.html"><h3>📅 Events</h3><p>Manage list</p></a>
            <a class="action-card" href="create-event.html"><h3>➕ New Event</h3><p>Create event</p></a>
            <a class="action-card" href="users.html"><h3>👥 Users</h3><p>Manage accounts</p></a>
            <a class="action-card" href="reports.html"><h3>📊 Reports</h3><p>System reports</p></a>
            <a class="action-card" href="scan.html"><h3>📲 Scan Ticket</h3><p>Validate passes</p></a>
        `;
    } else if (role === "EVENT_ORGANIZER") {
        quickActions.innerHTML = `
            <a class="action-card" href="events.html"><h3>📅 Events</h3><p>Manage list</p></a>
            <a class="action-card" href="create-event.html"><h3>➕ New Event</h3><p>Create event</p></a>
            <a class="action-card" href="reports.html"><h3>📊 Reports</h3><p>Event reports</p></a>
        `;
    } else if (role === "GATE_CONTROLLER") {
        quickActions.innerHTML = `
            <a class="action-card" href="scan.html"><h3>📲 Scan Ticket</h3><p>Validate passes</p></a>
        `;
    } else {
        // TICKET_HOLDER
        quickActions.innerHTML = `
            <a class="action-card" href="events.html"><h3>📅 Browse Events</h3><p>Find matches</p></a>
            <a class="action-card" href="my-tickets.html"><h3>🎟️ My Tickets</h3><p>View passes</p></a>
        `;
    }
}

function formatRole(role) {
    if (!role) return "User";
    return role.replace("ROLE_", "").replace("_", " ");
}