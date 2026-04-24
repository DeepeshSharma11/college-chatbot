'use client';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('access_token'));
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('access_token');
        setIsLoggedIn(false);
        setIsMobileMenuOpen(false);
        router.push('/');
    };

    return (
        <nav className="bg-blue-600 text-white shadow-lg shrink-0 relative z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center z-50">
                        <span className="text-2xl mr-2">🎓</span>
                        <h1 className="text-xl font-bold truncate">College Chatbot</h1>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-blue-100 hover:text-white transition-colors font-medium">Home</Link>
                        <Link href="/chat" className="text-blue-100 hover:text-white transition-colors font-medium">Chat</Link>
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-500"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Hamburger Button (3 lines, no lag) */}
                    <div className="md:hidden flex items-center z-50">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white hover:bg-blue-700 p-2 rounded-md focus:outline-none transition-colors"
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
                className={`md:hidden absolute top-16 left-0 w-full bg-blue-700 border-t border-blue-500 shadow-xl transition-all duration-200 ease-out origin-top ${
                    isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
                }`}
            >
                <div className="px-4 py-5 flex flex-col space-y-4">
                    <Link 
                        href="/" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition-colors text-lg"
                    >
                        Home
                    </Link>
                    <Link 
                        href="/chat" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition-colors text-lg"
                    >
                        Chat Demo
                    </Link>
                    
                    <div className="border-t border-blue-500 pt-4 mt-2">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left text-white hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition-colors text-lg"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-center bg-white text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-base font-bold transition-colors shadow-sm"
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
