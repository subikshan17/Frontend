const token = localStorage.getItem("jwtToken");

if (!token) {
    window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
const eventId = params.get("eventId");

const eventTitle = document.getElementById("eventTitle");
const eventStatus = document.getElementById("eventStatus");
const tiersContainer = document.getElementById("tiersContainer");
const tierCount = document.getElementById("tierCount");

const tierFormSection = document.getElementById("tierFormSection");
const tierForm = document.getElementById("tierForm");
const formTitle = document.getElementById("formTitle");

const tierIdInput = document.getElementById("tierId");
const tierNameInput = document.getElementById("tierName");
const priceInput = document.getElementById("price");
const capacityInput = document.getElementById("capacity");
const remainingQuantityInput = document.getElementById("remainingQuantity");

const openAddFormBtn = document.getElementById("openAddFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const cancelBtn = document.getElementById("cancelBtn");

if (!eventId) {
    alert("Event ID missing.");
    window.location.href = "events.html";
}

loadEventDetails();
loadTicketTiers();

openAddFormBtn.addEventListener("click", openAddForm);
closeFormBtn.addEventListener("click", closeForm);
cancelBtn.addEventListener("click", closeForm);

tierForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const tierData = {
        tierName: tierNameInput.value.trim(),
        price: Number(priceInput.value),
        capacity: Number(capacityInput.value),
        remainingQuantity: Number(remainingQuantityInput.value),
        event: {
            id: Number(eventId)
        }
    };  

    const tierId = tierIdInput.value;

    try {
        if (tierId) {
            await apiRequest(`/api/tickettiers/${tierId}`, "PUT", tierData);
            alert("Ticket tier updated successfully.");
        } else {
            await apiRequest("/api/tickettiers", "POST", tierData);
            alert("Ticket tier added successfully.");
        }

        closeForm();
        loadTicketTiers();

    } catch (error) {
        console.error(error);
        alert("Failed to save ticket tier: " + error.message);
    }
});

async function loadEventDetails() {
    try {
        const event = await apiRequest(`/api/events/${eventId}`);

        eventTitle.textContent = event.title || "Untitled Event";
        
        eventStatus.textContent = event.status || "UNKNOWN";
        eventStatus.className = `status-badge ${event.status ? event.status.toLowerCase() : ''}`;

    } catch (error) {
        console.error(error);
        eventTitle.textContent = "Unable to load event";
        eventStatus.textContent = "ERROR";
        eventStatus.className = "status-badge offline";
    }
}

async function loadTicketTiers() {
    try {
        const tiers = await apiRequest(`/api/tickettiers/event/${eventId}`);

        tiersContainer.innerHTML = "";
        tierCount.textContent = `${tiers.length} tiers available`;

        if (!tiers || tiers.length === 0) {
            tiersContainer.innerHTML = `<p class="empty">No ticket tiers added yet. Click "+ Add Tier" to create one.</p>`;
            return;
        }

        tiers.forEach(function (tier) {
            const card = document.createElement("div");
            card.className = "glass-card tier-card";

            card.innerHTML = `
                <h3>${escapeHtml(tier.tierName)}</h3>

                <div class="tier-detail">
                    <span>Price</span>
                    <strong>₹${tier.price}</strong>
                </div>

                <div class="tier-detail">
                    <span>Capacity</span>
                    <strong>${tier.capacity}</strong>
                </div>

                <div class="tier-detail">
                    <span>Remaining</span>
                    <strong>${tier.remainingQuantity}</strong>
                </div>

                <div class="tier-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            card.querySelector(".edit-btn").addEventListener("click", function () {
                openEditForm(tier);
            });

            card.querySelector(".delete-btn").addEventListener("click", function () {
                deleteTier(tier.id);
            });

            tiersContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        tiersContainer.innerHTML = `<p class="empty">Failed to load ticket tiers.</p>`;
    }
}

function openAddForm() {
    formTitle.textContent = "Add Ticket Tier";
    tierForm.reset();
    tierIdInput.value = "";
    tierFormSection.classList.remove("hidden");
    tierFormSection.scrollIntoView({ behavior: "smooth" });
}

function openEditForm(tier) {
    formTitle.textContent = "Edit Ticket Tier";

    tierIdInput.value = tier.id;
    tierNameInput.value = tier.tierName;
    priceInput.value = tier.price;
    capacityInput.value = tier.capacity;
    remainingQuantityInput.value = tier.remainingQuantity;

    tierFormSection.classList.remove("hidden");
    tierFormSection.scrollIntoView({ behavior: "smooth" });
}

function closeForm() {
    tierForm.reset();
    tierIdInput.value = "";
    tierFormSection.classList.add("hidden");
}

async function deleteTier(tierId) {
    const confirmDelete = confirm("Are you sure you want to delete this ticket tier?");

    if (!confirmDelete) {
        return;
    }

    try {
        await apiRequest(`/api/tickettiers/${tierId}`, "DELETE");

        alert("Ticket tier deleted successfully.");
        loadTicketTiers();

    } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete ticket tier: " + error.message);
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