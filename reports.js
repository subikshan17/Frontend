const token = localStorage.getItem("jwtToken");
const role = localStorage.getItem("userRole");

if (!token) {
    window.location.href = "login.html";
}

if (role !== "SYSTEM_ADMIN" && role !== "EVENT_ORGANIZER") {
    alert("Only System Admin or Event Organizer can access Reports.");
    window.location.href = "dashboard.html";
}

const reportsContainer = document.getElementById("reportsContainer");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const formBox = document.getElementById("formBox");
const reportForm = document.getElementById("reportForm");
const cancelBtn = document.getElementById("cancelBtn");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const formTitle = document.getElementById("formTitle");

let cachedReports = [];

toggleFormBtn.addEventListener("click", openCreateForm);
cancelBtn.addEventListener("click", closeForm);
reportForm.addEventListener("submit", saveReport);
searchBtn.addEventListener("click", searchReportsByEvent);
resetBtn.addEventListener("click", function () {
    document.getElementById("searchEventId").value = "";
    loadReports();
});

loadReports();
loadEventsDropdown();

async function loadEventsDropdown() {
    const eventSelect = document.getElementById("eventId");
    try {
        const response = await apiRequest("/api/events");
        const events = response.content || response || [];
        
        eventSelect.innerHTML = '<option value="">Select Event</option>';
        events.forEach(function (event) {
            const option = document.createElement("option");
            option.value = event.id;
            option.textContent = `${event.title} (ID: ${event.id})`;
            eventSelect.appendChild(option);
        });

        // Pre-fill from URL query param if present
        const urlParams = new URLSearchParams(window.location.search);
        const queryEventId = urlParams.get("eventId");
        if (queryEventId) {
            eventSelect.value = queryEventId;
            openCreateForm();
        }
    } catch (error) {
        console.error("Failed to load events dropdown:", error);
    }
}

async function loadReports() {
    try {
        reportsContainer.innerHTML = `<p class="empty">Loading reports list...</p>`;
        const reports = await apiRequest("/api/reports");
        cachedReports = reports || [];
        renderReports(cachedReports);
    } catch (error) {
        console.error(error);
        reportsContainer.innerHTML = `<p class="empty">Failed to load reports catalog.</p>`;
    }
}

async function searchReportsByEvent() {
    const eventId = document.getElementById("searchEventId").value;

    if (!eventId) {
        alert("Enter Event ID.");
        return;
    }

    try {
        reportsContainer.innerHTML = `<p class="empty">Searching reports...</p>`;
        const reports = await apiRequest(`/api/reports/event/${eventId}`);
        cachedReports = reports || [];
        renderReports(cachedReports);
    } catch (error) {
        console.error(error);
        reportsContainer.innerHTML = `<p class="empty">No reports found for this event ID.</p>`;
    }
}

async function saveReport(event) {
    event.preventDefault();

    const reportId = document.getElementById("reportId").value;

    // Set generatedAt to current ISO timestamp
    const generatedAtVal = getCurrentDateTimeLocal();

    const reportData = {
        generatedAt: generatedAtVal,
        reportType: document.getElementById("reportType").value,
        content: document.getElementById("content").value.trim(),
        name: document.getElementById("name").value.trim(),
        type: document.getElementById("type").value.trim(),
        event: {
            id: Number(document.getElementById("eventId").value)
        }
    };

    try {
        if (reportId) {
            await apiRequest(`/api/reports/${reportId}`, "PUT", reportData);
            alert("Report updated successfully.");
        } else {
            await apiRequest("/api/reports", "POST", reportData);
            alert("Report created successfully.");
        }

        closeForm();
        loadReports();
    } catch (error) {
        console.error(error);
        alert("Failed to save report: " + error.message);
    }
}

function renderReports(reports) {
    reportsContainer.innerHTML = "";

    if (!reports || reports.length === 0) {
        reportsContainer.innerHTML = `<p class="empty">No reports available in this view.</p>`;
        return;
    }

    reports.forEach(function (report) {
        const card = document.createElement("div");
        card.className = "glass-card report-card";

        const badgeClass = report.reportType === "SECURITY" ? "cancelled" : "published";

        card.innerHTML = `
            <div class="report-icon">📊</div>
            <span class="status-badge badge ${badgeClass}">${report.reportType || "REPORT"}</span>
            <h3>${escapeHtml(report.name) || "Untitled Report"}</h3>
            <p><strong>Report ID:</strong> #${report.id}</p>
            <p><strong>Sub-type:</strong> ${escapeHtml(report.type) || "N/A"}</p>
            <p><strong>Event ID:</strong> #${report.eventId || 'N/A'}</p>
            <p style="margin-top: 10px; max-height: 80px; overflow-y: auto; font-size: 13px; font-style: italic; background: rgba(0,0,0,0.1); padding: 8px; border-radius: 6px;">
                ${escapeHtml(report.content) || "No findings entered."}
            </p>

            <div class="card-actions">
                <button class="secondary-btn" onclick="triggerEditReport(${report.id})">Edit</button>
                <button class="danger-btn" onclick="triggerDeleteReport(${report.id})">Delete</button>
            </div>
        `;

        reportsContainer.appendChild(card);
    });
}

function openCreateForm() {
    formTitle.textContent = "Create Report";
    reportForm.reset();
    document.getElementById("reportId").value = "";
    formBox.classList.remove("hidden");
    formBox.scrollIntoView({ behavior: "smooth" });
}

// Expose trigger functions globally
window.triggerEditReport = function (reportId) {
    const report = cachedReports.find(r => r.id === reportId);
    if (!report) return;

    formTitle.textContent = "Edit Report Details";
    document.getElementById("reportId").value = report.id;
    document.getElementById("name").value = report.name || "";
    document.getElementById("type").value = report.type || "";
    document.getElementById("reportType").value = report.reportType || "ANALYTICS";
    document.getElementById("eventId").value = report.eventId || "";
    document.getElementById("content").value = report.content || "";

    formBox.classList.remove("hidden");
    formBox.scrollIntoView({ behavior: "smooth" });
};

window.triggerDeleteReport = async function (reportId) {
    const confirmDelete = confirm("Are you sure you want to permanently delete this report?");

    if (!confirmDelete) {
        return;
    }

    try {
        await apiRequest(`/api/reports/${reportId}`, "DELETE");
        alert("Report deleted successfully.");
        loadReports();
    } catch (error) {
        console.error(error);
        alert("Failed to delete report: " + error.message);
    }
};

function closeForm() {
    reportForm.reset();
    document.getElementById("reportId").value = "";
    formBox.classList.add("hidden");
}

function getCurrentDateTimeLocal() {
    const now = new Date();
    // Return standard ISO string which Spring boot understands
    return now.toISOString();
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}