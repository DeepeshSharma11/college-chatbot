'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import { api } from '@/lib/apiClient';

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role !== 'admin') {
                    router.push('/');
                    return;
                }

                // Fetch data
                const fetchedUsers = await api.getAdminUsers(token);
                const fetchedMessages = await api.getAdminMessages(token);
                
                setUsers(fetchedUsers || []);
                setMessages(fetchedMessages || []);
            } catch (err: any) {
                console.error("Admin fetch error:", err);
                setError(err.message || 'Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [router]);

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
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
                <div className="glass-card p-8 rounded-2xl text-center">
                    <h2 className="text-2xl text-red-400 mb-4 font-bold">Error</h2>
                    <p>{error}</p>
                    <button onClick={() => router.push('/')} className="mt-6 text-indigo-400 hover:underline">
                        Return Home
                    </button>
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

            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight drop-shadow-sm mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400 text-lg">Monitor college chatbot usage and statistics</p>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="glass-card p-8 rounded-3xl transform transition-transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-wider text-indigo-300 font-bold mb-1">Total Users</p>
                                <h3 className="text-5xl font-black text-white">{users.length}</h3>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="glass-card p-8 rounded-3xl transform transition-transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-wider text-purple-300 font-bold mb-1">Total Messages</p>
                                <h3 className="text-5xl font-black text-white">{messages.length}</h3>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Users Table */}
                    <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold text-white">Registered Students</h2>
                        </div>
                        <div className="p-0 overflow-x-auto flex-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="text-xs uppercase bg-black/40 text-gray-400 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Name</th>
                                        <th className="px-6 py-4 font-medium">Email</th>
                                        <th className="px-6 py-4 font-medium">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{user.name || 'N/A'}</td>
                                                <td className="px-6 py-4">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Messages Logs Table */}
                    <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold text-white">Live Chat Logs</h2>
                        </div>
                        <div className="p-0 overflow-x-auto flex-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="text-xs uppercase bg-black/40 text-gray-400 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">User Message</th>
                                        <th className="px-6 py-4 font-medium">Bot Response</th>
                                        <th className="px-6 py-4 font-medium">Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.length > 0 ? (
                                        messages.map((msg) => (
                                            <tr key={msg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 max-w-[150px] truncate" title={msg.user_message}>
                                                    {msg.user_message}
                                                </td>
                                                <td className="px-6 py-4 max-w-[200px] truncate" title={msg.bot_response}>
                                                    {msg.bot_response}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-300">
                                                        {msg.source}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No messages logged yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
