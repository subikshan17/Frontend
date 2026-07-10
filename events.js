document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const createEventBtn = document.getElementById("createEventBtn");

    if (role !== "SYSTEM_ADMIN" && role !== "EVENT_ORGANIZER") {
        createEventBtn.style.display = "none";
    }

    createEventBtn.addEventListener("click", function () {
        window.location.href = "create-event.html";
    });

    loadEvents(role);
});

async function loadEvents(role) {
    const eventsContainer = document.getElementById("eventsContainer");

    try {
        const response = await apiRequest("/api/events");
        const events = response.content || response || [];

        eventsContainer.innerHTML = "";

        if (events.length === 0) {
            eventsContainer.innerHTML = `<p class="empty">No events available in the system.</p>`;
            return;
        }

        events.forEach(function (event) {
            const card = document.createElement("div");
            card.className = "glass-card event-card";

            const statusClass = event.status ? event.status.toLowerCase() : 'draft';
            const statusLabel = event.status || 'DRAFT';

            card.innerHTML = `
                <div class="event-banner">🎤</div>

                <div class="event-body">
                    <h2>${escapeHtml(event.title) || "Untitled Event"}</h2>

                    <div class="event-meta">
                        <span>📍 ${escapeHtml(event.venue) || "Venue not added"}</span>
                        <span>🗓️ ${formatDate(event.startTime)}</span>
                        <div><span class="status-badge ${statusClass}">${statusLabel}</span></div>
                    </div>

                    <div class="event-actions">
                        <button class="view-btn" onclick="viewEvent(${event.id})">
                            Details
                        </button>

                        ${
                            role === "SYSTEM_ADMIN" || role === "EVENT_ORGANIZER"
                                ? `<button class="tier-btn" onclick="manageTiers(${event.id})">
                                        Tiers
                                   </button>`
                                : ""
                        }

                        ${
                            role === "TICKET_HOLDER"
                                ? `<button class="buy-btn" onclick="buyTicket(${event.id})">
                                        Buy Pass
                                   </button>`
                                : ""
                        }
                    </div>
                </div>
            `;

            eventsContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Events error:", error);
        eventsContainer.innerHTML = `<p class="error">Failed to load events catalog.</p>`;
    }
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "Date not added";
    }

    const date = new Date(dateValue);

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function viewEvent(eventId) {
    localStorage.setItem("selectedEventId", eventId);
    window.location.href = "event-details.html";
}

function buyTicket(eventId) {
    localStorage.setItem("selectedEventId", eventId);
    window.location.href = "purchase.html";
}

function manageTiers(eventId) {
    localStorage.setItem("selectedEventId", eventId);
    window.location.href = "manage-tiers.html?eventId=" + eventId;
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}