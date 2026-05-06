'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('access_token'));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setIsLoggedIn(false);
        setIsMobileMenuOpen(false);
        router.push('/');
    };

    return (
        <nav className="bg-slate-900/80 backdrop-blur-md text-white border-b border-white/10 shrink-0 relative z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center z-50 gap-2 group">
                        <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30 group-hover:bg-cyan-500/30 transition-all">
                            <span className="text-sm">🎓</span>
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">Invertis AI</h1>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm font-medium">Home</Link>
                        <Link href="/chat" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm font-medium">Chat</Link>
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10 text-slate-300 hover:text-white"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden flex items-center z-50">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-slate-300 hover:text-cyan-400 p-2 rounded-md focus:outline-none transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`md:hidden absolute top-16 left-0 w-full bg-slate-900 border-b border-white/10 shadow-2xl transition-all duration-200 ease-out origin-top ${
                    isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
                }`}
            >
                <div className="px-4 py-5 flex flex-col space-y-4">
                    <Link 
                        href="/" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md font-medium transition-colors"
                    >
                        Home
                    </Link>
                    <Link 
                        href="/chat" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md font-medium transition-colors"
                    >
                        Chat Demo
                    </Link>
                    
                    <div className="border-t border-white/10 pt-4 mt-2">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md font-medium transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-center bg-cyan-500 text-slate-950 hover:bg-cyan-400 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
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
