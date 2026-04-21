export interface User {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'admin';
    created_at: string;
}

export interface Message {
    id?: string;
    role: 'user' | 'bot';
    text: string;
    timestamp?: Date;
}

export interface ChatResponse {
    response: string;
    source: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}