'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/apiClient';
import Navbar from '../Layout/Navbar';
import InputBar from './InputBar';
import MessageBubble, { Message } from './MessageBubble';

export default function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load welcome message
    useEffect(() => {
        setMessages([
            {
                id: '1',
                role: 'bot',
                text: 'Hello! I am your college chatbot. How can I help you today?',
                timestamp: new Date(),
            },
        ]);
    }, []);

    const sendMessage = useCallback(async (message: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: message,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError('');

        const token = localStorage.getItem('access_token');
        const history = messages
            .filter((item) => item.id !== '1')
            .slice(-8)
            .map((item) => ({
                role: item.role,
                text: item.text,
            }));

        try {
            const response = await api.sendMessage(message, token, history);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: response.response || 'Sorry, I could not process that.',
                suggestions: response.suggestions || [],
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message || 'Failed to get response');

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: 'Sorry, I am having trouble connecting. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    }, [messages]);

    const quickPrompts = [
        'Admission process kya hai?',
        'B.Tech ki fees kitni hai?',
        'Hostel facilities batao',
    ];

    return (
        <div className="flex flex-col h-[100dvh] bg-gray-50">
            {/* Header via Navbar */}
            <Navbar />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth">
                <div className="container mx-auto max-w-4xl flex flex-col gap-4">
                    {messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            onSuggestionClick={sendMessage}
                        />
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-4 shadow-sm">
                                <div className="flex space-x-1.5">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {messages.length === 1 && !loading && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-start">
                            {quickPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => sendMessage(prompt)}
                                    className="rounded-full border border-blue-200 bg-white px-3 md:px-4 py-2 text-xs md:text-sm text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-1" />
                </div>
            </div>

            {/* Input Area */}
            <InputBar loading={loading} onSend={sendMessage} />
        </div>
    );
}
