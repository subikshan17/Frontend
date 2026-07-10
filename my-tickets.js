const token = localStorage.getItem("jwtToken");
const role = localStorage.getItem("userRole");
const userId = localStorage.getItem("userId");

if (!token) {
    window.location.href = "login.html";
}

if (role !== "TICKET_HOLDER") {
    alert("Only ticket holders can view My Tickets.");
    window.location.href = "dashboard.html";
}

if (!userId) {
    alert("User ID missing. Please login again.");
    localStorage.clear();
    window.location.href = "login.html";
}

const ticketsContainer = document.getElementById("ticketsContainer");

loadMyTickets();

async function loadMyTickets() {
    try {
        ticketsContainer.innerHTML = `
            <p class="empty">Loading your tickets...</p>
        `;
        const tickets = await apiRequest(`/api/purchase/user/${userId}`);

        ticketsContainer.innerHTML = "";

        if (!tickets || tickets.length === 0) {
            ticketsContainer.innerHTML = `
                <p class="empty">You have not purchased any tickets yet. Browse events to buy passes!</p>
            `;
            return;
        }

        tickets.forEach(function (ticket) {
            const card = document.createElement("div");
            card.className = "glass-card ticket-card";

            card.innerHTML = `
                <div class="ticket-icon">🎟️</div>

                <h2>${escapeHtml(ticket.eventTitle) || "Untitled Event"}</h2>

                <p class="ticket-info">
                    <strong>Holder:</strong> ${escapeHtml(ticket.holderName) || "Unknown"}
                </p>

                <p class="ticket-info">
                    <strong>Ticket ID:</strong> #${ticket.id}
                </p>

                <div class="serial">
                    Serial No: ${ticket.serialNumber || "Not generated"}
                </div>
            `;

            ticketsContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        ticketsContainer.innerHTML = `
            <p class="error">Failed to load your tickets.</p>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}