'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/apiClient';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotMessage, setForgotMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.login(email, password);
            localStorage.setItem('access_token', data.access_token);
            router.push('/chat');
        } catch (err: any) {
            const errMsg = err.message || '';
            if (errMsg.includes('not reachable') || errMsg.includes('Failed to fetch')) {
                setError('Server se connect nahi ho pa raha. Kripaya apna internet check karein ya thodi der baad try karein.');
            } else if (errMsg.includes('credential') || errMsg.includes('password') || errMsg.includes('email')) {
                setError('Email ya password galat hai. Kripaya dubara check karein.');
            } else {
                setError('Kuch galat ho gaya! Kripaya dubara koshish karein.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setForgotMessage('');
        setLoading(true);

        try {
            const data = await api.forgotPassword(email);
            setForgotMessage(data.message || 'If the email is registered, a password reset link has been sent.');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full space-y-8 bg-slate-900/60 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md relative z-10">
                <div>
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30">
                                <span className="text-2xl">🎓</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Sign in to continue to Invertis AI
                        </p>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <span className="text-red-400 mt-0.5">⚠️</span>
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}
                    {forgotMessage && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <span className="text-emerald-400 mt-0.5">✅</span>
                            <p className="text-sm text-emerald-200">{forgotMessage}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-white/10 placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 sm:text-sm transition-all"
                                placeholder="Enter your email"
                            />
                        </div>

                        {!isForgotPassword && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 sm:text-sm transition-all"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition-all hover:text-cyan-400 active:scale-90 focus:outline-none"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-.586M9.88 4.24A10.72 10.72 0 0112 4c5.25 0 9.27 4.9 10.5 8a13.184 13.184 0 01-2.246 3.592M6.228 6.228C3.892 7.79 2.32 10.243 1.5 12c1.23 3.1 5.25 8 10.5 8a10.9 10.9 0 005.772-1.728" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12S5.5 4 12 4s10.5 8 10.5 8-4 8-10.5 8S1.5 12 1.5 12z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(true);
                                        setError('');
                                        setForgotMessage('');
                                    }}
                                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isForgotPassword ? 'Sending link...' : 'Signing in...'}
                                </span>
                            ) : (
                                isForgotPassword ? 'Send Reset Link' : 'Sign in'
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        {isForgotPassword ? (
                            <p className="text-sm text-slate-400">
                                Remember your password?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(false);
                                        setError('');
                                        setForgotMessage('');
                                    }}
                                    className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    Back to login
                                </button>
                            </p>
                        ) : (
                            <p className="text-sm text-slate-400">
                                Don't have an account?{' '}
                                <a href="/register" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Register here
                                </a>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
