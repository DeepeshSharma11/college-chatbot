const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = {
    // Register user
    register: async (email: string, password: string, name: string) => {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Registration failed");
        }
        return data;
    },

    // Login user
    login: async (email: string, password: string) => {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Login failed");
        }
        return data;
    },

    // Send message
    sendMessage: async (message: string, token: string) => {
        const response = await fetch(`${BASE_URL}/chat/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Failed to send message");
        }
        return data;
    },
};