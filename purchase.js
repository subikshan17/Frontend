const token = localStorage.getItem("jwtToken");
const role = localStorage.getItem("userRole");
const userId = localStorage.getItem("userId");

if (!token) {
    window.location.href = "login.html";
}

if (role !== "TICKET_HOLDER") {
    alert("Only ticket holders can purchase tickets.");
    window.location.href = "events.html";
}

const eventId = localStorage.getItem("selectedEventId");

if (!eventId) {
    alert("No event selected.");
    window.location.href = "events.html";
}

const eventTitle = document.getElementById("eventTitle");
const eventVenue = document.getElementById("eventVenue");
const eventStatus = document.getElementById("eventStatus");

const tiersContainer = document.getElementById("tiersContainer");
const selectedBox = document.getElementById("selectedBox");
const selectedTierName = document.getElementById("selectedTierName");
const selectedTierPrice = document.getElementById("selectedTierPrice");

const purchaseBtn = document.getElementById("purchaseBtn");
const selectionCard = document.getElementById("selectionCard");

const successBox = document.getElementById("successBox");
const ticketSerial = document.getElementById("ticketSerial");
const ticketEvent = document.getElementById("ticketEvent");
const ticketHolder = document.getElementById("ticketHolder");

let selectedTierId = null;

loadEventDetails();
loadTicketTiers();

purchaseBtn.addEventListener("click", purchaseTicket);

async function loadEventDetails() {
    try {
        const event = await apiRequest(`/api/events/${eventId}`);

        eventTitle.textContent = event.title || "Untitled Event";
        eventVenue.textContent = event.venue || "Venue not added";
        
        eventStatus.textContent = event.status || "Status unavailable";
        eventStatus.className = `status-badge ${event.status ? event.status.toLowerCase() : ''}`;

    } catch (error) {
        console.error(error);
        eventTitle.textContent = "Failed to load event";
    }
}

async function loadTicketTiers() {
    try {
        const tiers = await apiRequest(`/api/tickettiers/event/${eventId}`);

        tiersContainer.innerHTML = "";

        if (!tiers || tiers.length === 0) {
            tiersContainer.innerHTML = `<p class="empty">No ticket tiers available for this event.</p>`;
            return;
        }

        tiers.forEach(function (tier) {
            const remaining = tier.remainingQuantity || 0;
            const soldOut = remaining <= 0;

            const card = document.createElement("div");
            card.className = "tier-card"; // common.css has border and hover settings for .tier-card

            card.innerHTML = `
                <h3>${escapeHtml(tier.tierName)}</h3>
                <p><strong>Price:</strong> ₹${tier.price}</p>
                <p><strong>Remaining:</strong> ${remaining}</p>
                ${soldOut ? '<div style="margin-top: 10px;"><span class="status-badge cancelled">Sold Out</span></div>' : ''}
            `;

            if (!soldOut) {
                card.addEventListener("click", function () {
                    selectTier(tier, card);
                });
            } else {
                card.style.opacity = "0.5";
                card.style.cursor = "not-allowed";
            }

            tiersContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        tiersContainer.innerHTML = `<p class="empty">Failed to load ticket tiers.</p>`;
    }
}

function selectTier(tier, selectedCard) {
    const allCards = document.querySelectorAll(".tier-card");

    allCards.forEach(function (card) {
        card.classList.remove("active");
    });

    selectedCard.classList.add("active");

    selectedTierId = tier.id;

    selectedTierName.textContent = tier.tierName;
    selectedTierPrice.textContent = tier.price;

    selectedBox.classList.remove("hidden");
    purchaseBtn.disabled = false;
}

async function purchaseTicket() {
    if (!selectedTierId) {
        alert("Please select a ticket tier.");
        return;
    }

    if (!userId) {
        alert("User ID missing. Please login again.");
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    const purchaseData = {
        tierId: selectedTierId
    };

    try {
        purchaseBtn.disabled = true;
        purchaseBtn.textContent = "Processing...";

        // endpoint: POST /api/purchase?userId=xxx
        const ticket = await apiRequest(
            `/api/purchase?userId=${userId}`,
            "POST",
            purchaseData
        );

        ticketSerial.textContent = ticket.serialNumber || "TKT-" + ticket.id;
        ticketEvent.textContent = ticket.eventTitle || "Booked Event";
        ticketHolder.textContent = ticket.holderName || "Ticket Holder";

        successBox.classList.remove("hidden");
        if (selectionCard) selectionCard.style.display = "none";

        purchaseBtn.textContent = "Purchased Successfully";

    } catch (error) {
        console.error(error);
        alert("Failed to purchase ticket: " + error.message);
        purchaseBtn.disabled = false;
        purchaseBtn.textContent = "Confirm Booking";
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