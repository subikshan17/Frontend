document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole");
    const adminName = localStorage.getItem("fullName") || localStorage.getItem("userName") || "Admin";

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (role !== "SYSTEM_ADMIN") {
        alert("Access Denied: User Management is restricted to System Administrators.");
        window.location.href = "dashboard.html";
        return;
    }

    // Set header
    document.getElementById("userInitial").textContent = adminName.charAt(0).toUpperCase();
    document.getElementById("userName").textContent = adminName;

    const usersTableBody = document.getElementById("usersTableBody");
    const openAddUserBtn = document.getElementById("openAddUserBtn");
    const closeFormBtn = document.getElementById("closeFormBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const userFormCard = document.getElementById("userFormCard");
    const userForm = document.getElementById("userForm");
    const formTitle = document.getElementById("formTitle");
    const saveUserBtn = document.getElementById("saveUserBtn");
    const passwordGroup = document.getElementById("passwordGroup");

    const editUserIdInput = document.getElementById("editUserId");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const roleSelect = document.getElementById("role");
    const passwordInput = document.getElementById("password");

    let cachedUsers = [];

    // Event listeners
    openAddUserBtn.addEventListener("click", openAddMode);
    closeFormBtn.addEventListener("click", closeForm);
    cancelBtn.addEventListener("click", closeForm);
    userForm.addEventListener("submit", saveUser);

    loadUsers();

    async function loadUsers() {
        try {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">
                        Loading users database...
                    </td>
                </tr>
            `;
            const users = await apiRequest("/api/users");
            cachedUsers = users || [];
            renderUsers(cachedUsers);
        } catch (error) {
            console.error(error);
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--danger); padding: 40px;">
                        Failed to load users from the server.
                    </td>
                </tr>
            `;
        }
    }

    function renderUsers(users) {
        if (users.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">
                        No users registered in the system.
                    </td>
                </tr>
            `;
            return;
        }

        usersTableBody.innerHTML = users.map(user => {
            const roleBadgeClass = getRoleClass(user.role);
            return `
                <tr>
                    <td><strong>#${user.id}</strong></td>
                    <td>${escapeHtml(user.fullName)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td><span class="status-badge ${roleBadgeClass}">${formatRole(user.role)}</span></td>
                    <td>
                        <div class="user-actions">
                            <button class="edit-btn" onclick="triggerEditUser(${user.id})">Edit</button>
                            <button class="delete-btn" onclick="triggerDeleteUser(${user.id})">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function openAddMode() {
        formTitle.textContent = "Add User";
        saveUserBtn.textContent = "Create User";
        userForm.reset();
        editUserIdInput.value = "";
        passwordGroup.style.display = "flex";
        passwordInput.required = false; // Default password123 is seeded in backend if left blank
        userFormCard.classList.remove("hidden");
        userFormCard.scrollIntoView({ behavior: "smooth" });
    }

    // Expose edit trigger to global scope
    window.triggerEditUser = function(userId) {
        const user = cachedUsers.find(u => u.id === userId);
        if (!user) return;

        formTitle.textContent = "Edit User Details";
        saveUserBtn.textContent = "Save Changes";
        userForm.reset();
        
        editUserIdInput.value = user.id;
        fullNameInput.value = user.fullName;
        emailInput.value = user.email;
        roleSelect.value = user.role;
        
        passwordGroup.style.display = "flex";
        passwordInput.required = false; 
        passwordInput.placeholder = "Leave blank to keep unchanged";

        userFormCard.classList.remove("hidden");
        userFormCard.scrollIntoView({ behavior: "smooth" });
    };

    // Expose delete trigger to global scope
    window.triggerDeleteUser = async function(userId) {
        if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
            return;
        }

        try {
            await apiRequest(`/api/users/${userId}`, "DELETE");
            alert("User deleted successfully.");
            loadUsers();
        } catch (error) {
            console.error(error);
            alert("Failed to delete user: " + error.message);
        }
    };

    async function saveUser(e) {
        e.preventDefault();

        const userId = editUserIdInput.value;
        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const userRole = roleSelect.value;
        const password = passwordInput.value;

        if (!fullName || !email || !userRole) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            if (userId) {
                // PUT updates SystemUser
                const putData = {
                    fullName: fullName,
                    email: email,
                    role: userRole
                };
                if (password) {
                    putData.password = password;
                }
                await apiRequest(`/api/users/${userId}`, "PUT", putData);
                alert("User details updated successfully.");
            } else {
                // POST creates UserDTO
                const postData = {
                    fullName: fullName,
                    email: email,
                    role: userRole
                };
                await apiRequest("/api/users", "POST", postData);
                alert("User account created successfully (Default password is 'password123').");
            }
            closeForm();
            loadUsers();
        } catch (error) {
            console.error(error);
            alert("Operation failed: " + error.message);
        }
    }

    function closeForm() {
        userForm.reset();
        editUserIdInput.value = "";
        userFormCard.classList.add("hidden");
    }
});

function formatRole(role) {
    if (!role) return "User";
    return role.replace("ROLE_", "").replace("_", " ");
}

function getRoleClass(role) {
    switch (role) {
        case "SYSTEM_ADMIN":
            return "online";
        case "EVENT_ORGANIZER":
            return "warning";
        case "GATE_CONTROLLER":
            return "draft";
        case "TICKET_HOLDER":
        default:
            return "published";
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
