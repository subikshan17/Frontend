document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    const name = localStorage.getItem("fullName") || localStorage.getItem("userName") || "Gate Staff";

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (role !== "GATE_CONTROLLER" && role !== "SYSTEM_ADMIN") {
        alert("Access Denied: Only Gate Controllers or Admins can access the scanning portal.");
        window.location.href = "dashboard.html";
        return;
    }

    // Set header info
    document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
    document.getElementById("userName").textContent = name;
    document.getElementById("userRole").textContent = formatRole(role);

    const scanForm = document.getElementById("scanForm");
    const serialInput = document.getElementById("serialNumber");
    const resultBanner = document.getElementById("scanResultBanner");
    const bannerIcon = document.getElementById("bannerIcon");
    const bannerMessage = document.getElementById("bannerMessage");
    const historyBody = document.getElementById("historyBody");
    const scanBtn = document.getElementById("scanBtn");

    const sessionLogs = [];

    scanForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const serialNumber = serialInput.value.trim().toUpperCase();
        if (!serialNumber) return;

        // Reset banner
        resultBanner.style.display = "none";
        resultBanner.className = "scan-result-banner";
        
        scanBtn.disabled = true;
        scanBtn.textContent = "Validating...";

        try {
            // endpoint: /api/gate/scan?serialNumber=xxx&controllerId=xxx
            const result = await apiRequest(`/api/gate/scan?serialNumber=${encodeURIComponent(serialNumber)}&controllerId=${userId}`, "POST");

            displayScanResult(serialNumber, result);
        } catch (error) {
            console.error(error);
            displayScanResult(serialNumber, "INVALID", error.message || "Failed to connect to scanner service");
        } finally {
            scanBtn.disabled = false;
            scanBtn.textContent = "Validate Entry";
            serialInput.value = "";
            serialInput.focus();
        }
    });

    function displayScanResult(serialNumber, result, customErrorMessage = null) {
        resultBanner.style.display = "flex";
        
        let statusText = "";
        let icon = "";
        let className = "";

        if (result === "VALID") {
            statusText = "VALID TICKET - ACCESS GRANTED";
            icon = "✅";
            className = "valid";
        } else if (result === "ALREADY_USED") {
            statusText = "ALREADY SCANNED - ENTRY DENIED";
            icon = "⚠️";
            className = "already_used";
        } else {
            statusText = customErrorMessage || "INVALID TICKET - ACCESS DENIED";
            icon = "❌";
            className = "invalid";
        }

        resultBanner.className = `scan-result-banner ${className}`;
        bannerIcon.textContent = icon;
        bannerMessage.textContent = statusText;

        // Add to session logs
        const log = {
            timestamp: new Date().toLocaleTimeString(),
            serial: serialNumber,
            result: result
        };
        sessionLogs.unshift(log); // Add to beginning of array
        renderHistory();
    }

    function renderHistory() {
        if (sessionLogs.length === 0) {
            historyBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 30px;">
                        No scans logged in this session yet.
                    </td>
                </tr>
            `;
            return;
        }

        historyBody.innerHTML = sessionLogs.map(log => {
            let badgeClass = "cancelled";
            if (log.result === "VALID") badgeClass = "published";
            else if (log.result === "ALREADY_USED") badgeClass = "draft";

            return `
                <tr>
                    <td>${log.timestamp}</td>
                    <td style="font-weight: 700; letter-spacing: 1px;">${log.serial}</td>
                    <td><span class="status-badge ${badgeClass}">${log.result}</span></td>
                </tr>
            `;
        }).join("");
    }
});

function formatRole(role) {
    if (!role) return "User";
    return role.replace("ROLE_", "").replace("_", " ");
}
