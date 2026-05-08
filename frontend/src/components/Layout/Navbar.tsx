'use client';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
        
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(payload.role === 'admin');
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('access_token');
        setIsLoggedIn(false);
        setIsMobileMenuOpen(false);
        router.push('/');
    };

    return (
        <nav className="glass-panel border-b border-white/10 text-white shrink-0 relative z-50 rounded-b-3xl">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center z-50 group">
                        <span className="text-3xl mr-3 transform group-hover:scale-110 transition-transform">🎓</span>
                        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 truncate tracking-tight">
                            College AI
                        </h1>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-300 hover:text-white transition-colors font-semibold text-sm tracking-wide">HOME</Link>
                        <Link href="/chat" className="text-gray-300 hover:text-white transition-colors font-semibold text-sm tracking-wide">CHAT</Link>
                        {isLoggedIn && (
                            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors font-semibold text-sm tracking-wide">DASHBOARD</Link>
                        )}
                        {isAdmin && (
                            <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold text-sm tracking-wide neon-glow px-3 py-1 rounded-full border border-indigo-500/50 bg-indigo-500/10">
                                ADMIN PANEL
                            </Link>
                        )}
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full text-sm font-bold transition-all border border-white/20 hover:border-white/40 shadow-lg text-white"
                            >
                                LOGOUT
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 px-7 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg neon-glow text-white tracking-wide"
                            >
                                LOGIN
                            </Link>
                        )}
                    </div>

                    {/* Mobile Hamburger Button (3 lines, no lag) */}
                    <div className="md:hidden flex items-center z-50">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white hover:bg-white/10 p-2 rounded-full focus:outline-none transition-colors border border-transparent hover:border-white/20"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div 
                className={`md:hidden absolute top-20 left-0 w-full glass-card border-t border-white/10 shadow-2xl transition-all duration-300 ease-out origin-top rounded-b-3xl overflow-hidden ${
                    isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
                }`}
            >
                <div className="px-6 py-8 flex flex-col space-y-6">
                    <Link 
                        href="/" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-300 hover:text-white px-4 py-3 rounded-xl font-bold transition-colors text-lg bg-white/5 hover:bg-white/10"
                    >
                        Home
                    </Link>
                    <Link 
                        href="/chat" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-300 hover:text-white px-4 py-3 rounded-xl font-bold transition-colors text-lg bg-white/5 hover:bg-white/10"
                    >
                        Chat Demo
                    </Link>
                    {isLoggedIn && (
                        <Link 
                            href="/dashboard" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-300 hover:text-white px-4 py-3 rounded-xl font-bold transition-colors text-lg bg-white/5 hover:bg-white/10"
                        >
                            Dashboard
                        </Link>
                    )}
                    {isAdmin && (
                        <Link 
                            href="/admin" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-indigo-300 hover:text-indigo-200 px-4 py-3 rounded-xl font-bold transition-colors text-lg bg-indigo-500/20 border border-indigo-500/30"
                        >
                            Admin Panel
                        </Link>
                    )}
                    
                    <div className="border-t border-white/10 pt-6 mt-4">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-center text-white bg-white/10 hover:bg-white/20 px-4 py-4 rounded-xl font-bold transition-colors text-lg border border-white/10"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 px-4 py-4 rounded-xl text-lg font-bold transition-all shadow-lg neon-glow"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
