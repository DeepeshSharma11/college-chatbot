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
    const [isListening, setIsListening] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onstart = () => setIsListening(true);
                
                recognition.onresult = (event: any) => {
                    const transcript = Array.from(event.results)
                        .map((result: any) => result[0])
                        .map((result: any) => result.transcript)
                        .join('');
                    setInput(transcript);
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setInput(''); // Clear input before listening
            recognitionRef.current?.start();
        }
    };

    const speakResponse = (text: string) => {
        if (!voiceMode || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        
        // Strip markdown before speaking
        const cleanText = text.replace(/[#*`_~[\]()]/g, '').replace(/!\[.*?\]\([^)]+\)/g, '');
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
    };

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
            
            if (voiceMode) {
                speakResponse(botMessage.text);
            }
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
        <div className="flex flex-col h-[100dvh] bg-transparent">
            {/* Header via Navbar */}
            <Navbar />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth">
                <div className="container mx-auto max-w-4xl flex flex-col gap-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                        >
                            <div
                                className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-5 py-4 ${
                                    message.role === 'user'
                                        ? 'bubble-user rounded-br-sm'
                                        : 'bubble-bot rounded-bl-sm'
                                }`}
                            >
                                <div className="prose prose-sm md:prose-base prose-invert max-w-none">
                                    {message.role === 'bot' ? (
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed text-gray-200" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-200" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-gray-200" {...props} />,
                                                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                                                img: ({node, ...props}) => (
                                                    <span className="block my-4 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group">
                                                        <img {...props} className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105" alt={props.alt || 'University Image'} />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                                            <span className="text-white text-sm font-medium">{props.alt}</span>
                                                        </div>
                                                    </span>
                                                )
                                            }}
                                        >
                                            {message.text}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="whitespace-pre-wrap text-white">{message.text}</p>
                                    )}
                                </div>
                                <p className={`text-[10px] md:text-xs mt-2 flex ${message.role === 'user' ? 'justify-end text-indigo-200' : 'justify-start text-gray-500'}`}>
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start animate-fade-in-up">
                            <div className="bubble-bot rounded-2xl rounded-bl-sm px-5 py-4">
                                <div className="flex space-x-2">
                                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm glass-panel backdrop-blur-md">
                            {error}
                        </div>
                    )}

                    {messages.length === 1 && !loading && (
                        <div className="mt-6 flex flex-wrap gap-3 justify-start">
                            {quickPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => setInput(prompt)}
                                    className="rounded-full border border-indigo-500/30 bg-white/5 backdrop-blur-md px-4 py-2 text-sm text-indigo-200 hover:bg-white/10 hover:border-indigo-400 hover:text-white transition-all shadow-lg transform hover:-translate-y-0.5"
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
            <div className="glass-panel border-t-0 border-white/5 p-3 md:p-5 shrink-0 pb-safe rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                {/* Voice Mode Toggle */}
                <div className="container mx-auto max-w-4xl flex justify-end mb-2 px-2">
                    <button
                        onClick={() => {
                            if (voiceMode) {
                                // If turning off, instantly stop speaking
                                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                                    window.speechSynthesis.cancel();
                                }
                            }
                            setVoiceMode(!voiceMode);
                        }}
                        className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all border ${
                            voiceMode 
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 neon-glow' 
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/10'
                        }`}
                        title="Toggle Auto-Read Responses"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={voiceMode ? "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" : "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z m5.828-9.9L15.536 8.464 m2.828 2.828l-2.828 2.828"} />
                        </svg>
                        <span>{voiceMode ? 'Disable Voice Assistant' : 'Enable Voice Assistant'}</span>
                    </button>
                </div>

                <div className="container mx-auto max-w-4xl flex gap-2 md:gap-3 items-center">
                    <button
                        onClick={toggleListening}
                        disabled={loading}
                        className={`p-3 md:p-4 rounded-full transition-all flex items-center justify-center shrink-0 shadow-inner ${
                            isListening
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                                : 'bg-black/40 text-gray-400 border border-white/10 hover:text-white hover:bg-black/60'
                        }`}
                        title={isListening ? "Stop listening" : "Start speaking"}
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={loading}
                        className="flex-1 px-5 py-3.5 md:py-4 bg-black/40 border border-white/10 text-white placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition-all text-sm md:text-base shadow-inner"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="p-3 md:px-8 md:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all neon-glow flex items-center justify-center shrink-0 font-bold tracking-wide"
                        aria-label="Send message"
                    >
                        <span className="hidden md:inline">Send</span>
                        <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
