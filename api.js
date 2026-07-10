async function apiRequest(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("jwtToken");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method: method,
        headers: headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : null;
    } catch (error) {
        data = text;
    }

    if (!response.ok) {
        throw new Error(data?.message || data || "Request failed");
    }

    return data;
}