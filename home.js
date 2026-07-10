document.addEventListener("DOMContentLoaded", function () {
    loadHomeData();
});

async function loadHomeData() {
    try {
        const response = await apiRequest("/api/events");
        const events = response.content || response || [];

        updateStats(events);

        if (!events || events.length === 0) {
            showFallbackHome();
            return;
        }

        const publishedEvents = events.filter(function (event) {
            return event.status === "PUBLISHED";
        });

        const selectedEvent = publishedEvents.length > 0 ? publishedEvents[0] : events[0];

        const titleEl = document.getElementById("homeEventTitle");
        if (titleEl) titleEl.textContent = selectedEvent.title || "Upcoming Event";

        const statusEl = document.getElementById("homeEventStatus");
        if (statusEl) statusEl.textContent = selectedEvent.status || "LIVE";

        await loadHomeTier(selectedEvent.id);

    } catch (error) {
        console.error(error);
        showFallbackHome();
        const systemStatusEl = document.getElementById("systemStatus");
        if (systemStatusEl) systemStatusEl.textContent = "Offline";
    }
}

async function loadHomeTier(eventId) {
    try {
        const tiers = await apiRequest(`/api/tickettiers/event/${eventId}`);

        const tiersCountEl = document.getElementById("ticketTiers");
        if (tiersCountEl) tiersCountEl.textContent = tiers.length;

        if (!tiers || tiers.length === 0) {
            setTierData("Ticket Pass", "₹0", "No Tiers");
            return;
        }

        const tier = tiers[0];
        setTierData(
            tier.tierName || "Ticket Pass",
            "₹" + (tier.price || 0),
            "Remaining: " + (tier.remainingQuantity ?? "N/A")
        );

    } catch (error) {
        console.error(error);
        setTierData("Ticket Pass", "₹0", "Available");
    }
}

function setTierData(name, price, seatText) {
    const nameEl = document.getElementById("homeTierName");
    if (nameEl) nameEl.textContent = name;

    const priceEl = document.getElementById("homeTicketPrice");
    if (priceEl) priceEl.textContent = price;

    const seatEl = document.getElementById("homeSeatText");
    if (seatEl) seatEl.textContent = seatText;
}

function updateStats(events) {
    const published = events.filter(function (event) {
        return event.status === "PUBLISHED";
    });

    const totalEl = document.getElementById("totalEvents");
    if (totalEl) totalEl.textContent = events.length;

    const publishedEl = document.getElementById("publishedEvents");
    if (publishedEl) publishedEl.textContent = published.length;

    const systemStatusEl = document.getElementById("systemStatus");
    if (systemStatusEl) systemStatusEl.textContent = "Online";
}

function showFallbackHome() {
    const titleEl = document.getElementById("homeEventTitle");
    if (titleEl) titleEl.textContent = "No Events Yet";

    const statusEl = document.getElementById("homeEventStatus");
    if (statusEl) statusEl.textContent = "NEW";

    setTierData("Ticket Pass", "₹0", "Available");

    const totalEl = document.getElementById("totalEvents");
    if (totalEl) totalEl.textContent = "0";

    const publishedEl = document.getElementById("publishedEvents");
    if (publishedEl) publishedEl.textContent = "0";

    const tiersCountEl = document.getElementById("ticketTiers");
    if (tiersCountEl) tiersCountEl.textContent = "0";
}