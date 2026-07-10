document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("fullName") || localStorage.getItem("userName") || "Organizer";

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (role !== "SYSTEM_ADMIN" && role !== "EVENT_ORGANIZER") {
        alert("Access denied. Only Admins or Event Organizers can create events.");
        window.location.href = "events.html";
        return;
    }

    // Set header info
    document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
    document.getElementById("userName").textContent = name;
    document.getElementById("userRole").textContent = role.replace("ROLE_", "").replace("_", " ");

    const createEventForm = document.getElementById("createEventForm");
    const errorMessage = document.getElementById("errorMessage");
    const successMessage = document.getElementById("successMessage");
    const submitBtn = document.getElementById("createEventBtnSubmit");

    createEventForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        errorMessage.textContent = "";
        successMessage.textContent = "";

        const title = document.getElementById("title").value.trim();
        const venue = document.getElementById("venue").value.trim();
        const startTimeVal = document.getElementById("startTime").value;
        const status = document.getElementById("status").value;

        if (!title || !venue || !startTimeVal || !status) {
            errorMessage.textContent = "Please fill in all required fields.";
            return;
        }

        const eventData = {
            title: title,
            venue: venue,
            startTime: startTimeVal,
            status: status
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating...";

            await apiRequest("/api/events", "POST", eventData);

            successMessage.textContent = "Event created successfully!";

            setTimeout(function () {
                window.location.href = "events.html";
            }, 1200);

        } catch (error) {
            console.error(error);
            errorMessage.textContent = error.message || "Failed to create event.";
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Event";
        }
    });
});