import Link from 'next/link';

const features = [
    'Student login and registration',
    'College FAQ chatbot for admissions, fees, courses, hostel, and placements',
    'Groq-first architecture with GPT-2 fallback support',
];

export default function HomePage() {
    return (
        <main className="min-h-screen text-white relative overflow-hidden flex flex-col justify-center">
            {/* Background glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            <section className="mx-auto max-w-6xl w-full px-6 py-20 relative z-10">
                <div className="max-w-4xl mx-auto rounded-[2.5rem] border border-white/10 glass-card p-12 shadow-2xl backdrop-blur-xl transform transition-all duration-500 hover:-translate-y-2">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.3em] font-bold text-indigo-300">
                            Next-Generation AI Interface
                        </p>
                    </div>
                    <h1 className="text-5xl font-black leading-tight md:text-7xl bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 tracking-tight">
                        Experience the Future of College Support.
                    </h1>
                    <p className="mt-8 text-xl text-gray-300 leading-relaxed max-w-2xl">
                        A highly sophisticated, ultra-modern AI chatbot designed to revolutionize university admissions, campus guidance, and student support seamlessly.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-5">
                        <Link
                            href="/chat"
                            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 font-bold text-white transition-all hover:from-indigo-400 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 transform hover:-translate-y-1"
                        >
                            Launch Demo
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-8 py-4 font-bold text-white transition-all hover:bg-white/10 hover:border-white/40 transform hover:-translate-y-1"
                        >
                            Sign In
                        </Link>
                    </div>

                    <div className="mt-16 grid gap-6 text-sm text-gray-300 md:grid-cols-3">
                        {features.map((feature, i) => (
                            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl transform transition-all hover:scale-105 hover:bg-white/10 group">
                                <div className="w-10 h-10 mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:bg-indigo-500/40 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <p className="font-medium text-gray-200 leading-relaxed">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
