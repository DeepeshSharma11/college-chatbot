const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

const parseErrorMessage = async (response: Response, fallback: string) => {
    try {
        const data = await response.json();
        return data.detail || data.message || fallback;
    } catch {
        return fallback;
    }
};

const request = async <T>(path: string, options: RequestInit, fallbackError: string): Promise<T> => {
    let response: Response;

    try {
        response = await fetch(`${BASE_URL}${path}`, options);
    } catch {
        throw new Error("Backend server is not reachable. Please start the backend on http://localhost:8000.");
    }

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, fallbackError));
    }

    return response.json();
};

export const api = {
    health: async () => {
        return request<{ status: string }>("/health", {
            method: "GET",
        }, "Backend health check failed");
    },

    // Register user
    register: async (email: string, password: string, name: string) => {
        return request<{ access_token: string; token_type: string }>("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, name }),
        }, "Registration failed");
    },

    // Login user
    login: async (email: string, password: string) => {
        return request<{ access_token: string; token_type: string }>("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        }, "Login failed");
    },

    // Send message
    sendMessage: async (
        message: string,
        token: string | null,
        history: Array<{ role: "user" | "bot"; text: string }> = [],
    ) => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return request<{ response: string; source: string; suggestions: string[] }>("/chat/message", {
            method: "POST",
            headers,
            body: JSON.stringify({ message, history }),
        }, "Failed to send message");
    },

    getAdminUsers: async (token: string | null) => {
        return request<{ users: unknown[] }>("/admin/users", {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        }, "Failed to load users");
    },

    getAdminMessages: async (token: string | null) => {
        return request<{ messages: unknown[] }>("/admin/messages", {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        }, "Failed to load messages");
    },
};
