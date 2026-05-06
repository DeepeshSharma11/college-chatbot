'use client';
import { memo, useEffect, useRef, useState } from 'react';

interface InputBarProps {
    loading: boolean;
    onSend: (message: string) => void;
}

function InputBar({ loading, onSend }: InputBarProps) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!loading && window.innerWidth > 768) {
            inputRef.current?.focus();
        }
    }, [loading]);

    const submitMessage = () => {
        const message = input.trim();
        if (!message || loading) return;

        onSend(message);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            submitMessage();
        }
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-md border-t border-white/10 p-3 md:p-4 shrink-0 pb-safe relative z-50">
            <div className="container mx-auto max-w-4xl flex gap-2 md:gap-4 items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 md:py-3.5 bg-slate-800 border border-white/10 text-white placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:bg-slate-800/50 disabled:opacity-70 transition-all text-sm md:text-base shadow-inner"
                />
                <button
                    onClick={submitMessage}
                    disabled={loading || !input.trim()}
                    className="min-h-[46px] min-w-[46px] p-3 md:min-w-[96px] md:px-6 md:py-3.5 bg-cyan-500 text-slate-950 font-semibold rounded-full hover:bg-cyan-400 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center shrink-0"
                    aria-label={loading ? 'Sending message' : 'Send message'}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span className="hidden md:inline font-medium">Sending</span>
                        </span>
                    ) : (
                        <>
                            <span className="hidden md:inline font-medium">Send</span>
                            <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default memo(InputBar);
