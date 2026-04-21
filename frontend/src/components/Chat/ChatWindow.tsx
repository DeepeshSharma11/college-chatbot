'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/apiClient';

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

export default function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
        inputRef.current?.focus();
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError('');

        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('Please login again');
            setLoading(false);
            return;
        }

        try {
            const response = await api.sendMessage(input, token);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: response.response || 'Sorry, I could not process that.',
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
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            sendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const quickPrompts = [
        'Admission process kya hai?',
        'B.Tech ki fees kitni hai?',
        'Hostel facilities batao',
    ];

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 shadow-lg">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold">🎓 College Chatbot</h1>
                    <p className="text-sm text-blue-100">Ask me anything about college!</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="container mx-auto max-w-4xl">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-800 shadow-md'
                                    }`}
                            >
                                <p className="text-sm">{message.text}</p>
                                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                                    }`}>
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white rounded-lg p-3 shadow-md">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {messages.length === 1 && !loading && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            {quickPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => setInput(prompt)}
                                    className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 transition hover:bg-blue-100"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex space-x-4">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message here..."
                            disabled={loading}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Powered by AI - Ask about courses, admissions, fees, and more!
                    </p>
                </div>
            </div>
        </div>
    );
}
