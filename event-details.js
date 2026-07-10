const token = localStorage.getItem("jwtToken");
const role = localStorage.getItem("userRole");
const selectedEventId = localStorage.getItem("selectedEventId");

if (!token) {
    window.location.href = "login.html";
}

if (!selectedEventId) {
    window.location.href = "events.html";
}

loadEventDetails();
loadTicketTiers();

async function loadEventDetails() {
    try {
        const event = await apiRequest(`/api/events/${selectedEventId}`);

        document.getElementById("eventTitle").textContent =
            event.title || "Untitled Event";

        // Backend Event object doesn't actually have a description field, but if it is added later it will render, otherwise fallback to nice text.
        document.getElementById("eventDescription").textContent =
            event.description || "Join us for this exciting event! Secure your passes from the ticket tiers below.";

        document.getElementById("eventVenue").textContent =
            event.venue || "Venue not added";

        document.getElementById("eventDate").textContent =
            formatDate(event.startTime);

        const statusEl = document.getElementById("eventStatus");
        statusEl.textContent = event.status || "UNKNOWN";
        statusEl.className = `status-badge ${event.status ? event.status.toLowerCase() : ''}`;
        
        // Remove white styles for dark mode compatibility
        statusEl.style.background = ""; 
        statusEl.style.color = "";

        document.getElementById("eventIdText").textContent =
            "#" + (event.id || selectedEventId);

        if (role === "SYSTEM_ADMIN" || role === "EVENT_ORGANIZER") {
            const heroActions = document.getElementById("eventHeroActions");
            if (heroActions) {
                heroActions.innerHTML = `
                    <a href="reports.html?eventId=${event.id || selectedEventId}" class="primary-btn" style="background: white; color: var(--primary); font-size: 14px; padding: 10px 18px; text-decoration: none; border-radius: var(--radius-sm); font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(255,255,255,0.15);">
                        📊 Create Report
                    </a>
                `;
            }
        }

    } catch (error) {
        document.getElementById("eventTitle").textContent =
            "Failed to load event";
        console.error(error);
    }
}

async function loadTicketTiers() {
    const tiersContainer = document.getElementById("tiersContainer");

    try {
        const tiers = await apiRequest(`/api/tickettiers/event/${selectedEventId}`);

        tiersContainer.innerHTML = "";

        if (!tiers || tiers.length === 0) {
            tiersContainer.innerHTML =
                `<p class="empty">No ticket tiers available for this event yet.</p>`;
            return;
        }

        tiers.forEach(function (tier) {
            const remaining = tier.remainingQuantity || 0;
            const soldOut = remaining <= 0;

            const card = document.createElement("div");
            card.className = "glass-card tier-card";

            card.innerHTML = `
                <h3>${escapeHtml(tier.tierName) || "Ticket Tier"}</h3>

                <p class="price">₹${tier.price || 0}</p>

                <div class="tier-meta">
                    <span>Capacity: ${tier.capacity || 0}</span>
                    <span>Remaining: ${remaining}</span>
                </div>

                ${
                    role === "TICKET_HOLDER"
                    ? `<button 
                            class="primary-btn purchase-btn" 
                            onclick="selectTier(${tier.id})"
                            ${soldOut ? "disabled" : ""}>
                            ${soldOut ? "Sold Out" : "Purchase Ticket"}
                       </button>`
                    : ""
                }
            `;

            tiersContainer.appendChild(card);
        });

    } catch (error) {
        tiersContainer.innerHTML =
            `<p class="error">Failed to load ticket tiers.</p>`;
        console.error(error);
    }
}

function selectTier(tierId) {
    localStorage.setItem("selectedTierId", tierId);
    window.location.href = "purchase.html";
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

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}