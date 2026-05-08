'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import { api } from '@/lib/apiClient';

export default function StudentDashboard() {
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(payload.email || 'Student');

                const fetchedMessages = await api.getChatHistory(token);
                setMessages(fetchedMessages || []);
            } catch (err: any) {
                console.error("Dashboard fetch error:", err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [router]);

    const downloadTranscript = () => {
        if (messages.length === 0) return;

        let transcript = `College AI Chat Transcript\n`;
        transcript += `User: ${userEmail}\n`;
        transcript += `Date: ${new Date().toLocaleString()}\n`;
        transcript += `===================================\n\n`;

        // Messages are reverse-chronological from the backend (newest first). 
        // We should reverse them for the transcript so it reads normally.
        const sortedMessages = [...messages].reverse();

        sortedMessages.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleString();
            transcript += `[${date}] You:\n${msg.user_message}\n\n`;
            transcript += `[${date}] AI Assistant:\n${msg.bot_response}\n\n`;
            transcript += `-----------------------------------\n\n`;
        });

        const blob = new Blob([transcript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Chat_Transcript.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="flex space-x-2">
                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="glass-card p-8 rounded-2xl text-center max-w-md w-full">
                        <h2 className="text-2xl text-red-400 mb-4 font-bold">Error</h2>
                        <p className="text-gray-300">{error}</p>
                        <button onClick={() => router.push('/chat')} className="mt-6 text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                            Return to Chat
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-white relative">
            {/* Background elements to match theme */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

            <Navbar />

            <main className="flex-1 container mx-auto px-6 py-10 max-w-5xl">
                {/* Profile Header */}
                <div className="glass-panel rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-black shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                                Student Profile
                            </h1>
                            <p className="text-gray-400 mt-1 font-medium">{userEmail}</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={downloadTranscript}
                        disabled={messages.length === 0}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Transcript
                    </button>
                </div>

                {/* Chat History Section */}
                <h2 className="text-2xl font-bold mb-6 pl-2">Your Conversation History</h2>
                
                <div className="glass-card rounded-3xl overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-0 overflow-x-auto flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {messages.length > 0 ? (
                            <div className="divide-y divide-white/10">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="p-6 hover:bg-white/5 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-bold text-gray-500">
                                                {new Date(msg.created_at).toLocaleString()}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/10">
                                                {msg.source}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* User Message */}
                                            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 relative">
                                                <div className="absolute -top-3 left-4 bg-[#1a1b26] px-2 text-xs font-bold text-indigo-400">You</div>
                                                <p className="text-gray-300 text-sm mt-1">{msg.user_message}</p>
                                            </div>
                                            
                                            {/* Bot Response */}
                                            <div className="bg-indigo-900/20 rounded-2xl p-4 border border-indigo-500/20 relative">
                                                <div className="absolute -top-3 left-4 bg-[#1a1b26] px-2 text-xs font-bold text-purple-400">AI Assistant</div>
                                                <p className="text-gray-200 text-sm mt-1 whitespace-pre-wrap">{msg.bot_response}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-lg">No chat history found.</p>
                                <button 
                                    onClick={() => router.push('/chat')}
                                    className="mt-4 text-indigo-400 hover:text-white transition-colors"
                                >
                                    Start a conversation
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
}
