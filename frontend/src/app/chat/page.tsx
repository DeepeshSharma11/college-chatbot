'use client';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import ChatWindow from '@/components/Chat/ChatWindow';

export default function ChatPage() {
    return (
        <ProtectedRoute>
            <ChatWindow />
        </ProtectedRoute>
    );
}