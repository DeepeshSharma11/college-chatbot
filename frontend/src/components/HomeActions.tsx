'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

type LoadingTarget = 'chat' | 'login' | null;

function Spinner() {
    return (
        <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
    );
}

export default function HomeActions() {
    const [loadingTarget, setLoadingTarget] = useState<LoadingTarget>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (localStorage.getItem('access_token')) {
            setIsLoggedIn(true);
        }
    }, []);

    if (!mounted) {
        return <div className="mt-8 h-[48px]" />; // Spacer to prevent layout shift during hydration
    }

    if (isLoggedIn) {
        return (
            <div className="mt-8 flex flex-wrap gap-4">
                <Link
                    href="/chat"
                    onClick={() => setLoadingTarget('chat')}
                    className="inline-flex min-w-[132px] items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition-all hover:bg-cyan-300 active:scale-95 aria-disabled:pointer-events-none aria-disabled:opacity-80"
                    aria-disabled={loadingTarget !== null}
                >
                    {loadingTarget === 'chat' && <Spinner />}
                    {loadingTarget === 'chat' ? 'Opening...' : 'Go to Chat'}
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-8 flex flex-wrap gap-4">
            <Link
                href="/chat"
                onClick={() => setLoadingTarget('chat')}
                className="inline-flex min-w-[132px] items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition-all hover:bg-cyan-300 active:scale-95 aria-disabled:pointer-events-none aria-disabled:opacity-80"
                aria-disabled={loadingTarget !== null}
            >
                {loadingTarget === 'chat' && <Spinner />}
                {loadingTarget === 'chat' ? 'Opening...' : 'Start Demo'}
            </Link>
            <Link
                href="/login"
                onClick={() => setLoadingTarget('login')}
                className="inline-flex min-w-[104px] items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 active:scale-95 aria-disabled:pointer-events-none aria-disabled:opacity-80"
                aria-disabled={loadingTarget !== null}
            >
                {loadingTarget === 'login' && <Spinner />}
                {loadingTarget === 'login' ? 'Opening...' : 'Login'}
            </Link>
        </div>
    );
}
