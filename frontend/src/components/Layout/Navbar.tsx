'use client';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('access_token');
        router.push('/');
    };

    return (
        <nav className="bg-blue-600 text-white shadow-lg shrink-0">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl mr-2">🎓</span>
                        <h1 className="text-xl font-bold truncate">College Chatbot</h1>
                    </div>
                    <div>
                        <button
                            onClick={handleLogout}
                            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
