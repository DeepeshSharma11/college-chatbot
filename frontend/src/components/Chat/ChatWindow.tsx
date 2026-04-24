'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/apiClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '../Layout/Navbar';

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
            // On mobile devices, we probably don't want to auto-focus and open the keyboard again
            if (window.innerWidth > 768) {
                inputRef.current?.focus();
            }
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
        <div className="flex flex-col h-[100dvh] bg-gray-50">
            {/* Header via Navbar */}
            <Navbar />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth">
                <div className="container mx-auto max-w-4xl flex flex-col gap-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[90%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                                    message.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                                }`}
                            >
                                <div className="prose prose-sm md:prose-base max-w-none">
                                    {message.role === 'bot' ? (
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />
                                            }}
                                        >
                                            {message.text}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{message.text}</p>
                                    )}
                                </div>
                                <p className={`text-[10px] md:text-xs mt-1.5 flex ${message.role === 'user' ? 'justify-end text-blue-200' : 'justify-start text-gray-400'}`}>
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>
                        </div>
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
                                    onClick={() => setInput(prompt)}
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
            <div className="bg-white border-t border-gray-200 p-3 md:p-4 shrink-0 pb-safe">
                <div className="container mx-auto max-w-4xl flex gap-2 md:gap-4 items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={loading}
                        className="flex-1 px-4 py-3 md:py-3.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-70 transition-all text-sm md:text-base"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="p-3 md:px-6 md:py-3.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center shrink-0"
                        aria-label="Send message"
                    >
                        <span className="hidden md:inline font-medium">Send</span>
                        <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
