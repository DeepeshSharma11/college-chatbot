import HomeActions from '@/components/HomeActions';

const features = [
    {
        icon: '🎓',
        title: 'Admissions & Fees',
        desc: 'Get real-time answers about admission process, eligibility criteria, fee structure, and document requirements.',
    },
    {
        icon: '🏠',
        title: 'Campus & Hostel',
        desc: 'Explore hostel options, mess facilities, AC/Non-AC room prices, and vibrant campus life at Invertis.',
    },
    {
        icon: '💼',
        title: 'Placements & Courses',
        desc: 'Discover placement records, CRC contacts, available programmes from B.Tech to MBA and Ph.D.',
    },
];

export default function HomePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/15 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-700/15 blur-[140px] pointer-events-none" />
            <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

            <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
                <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        <p className="text-xs uppercase tracking-[0.4em] text-cyan-400 font-semibold">
                            Invertis University · AI Assistant
                        </p>
                    </div>

                    <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            Your Intelligent
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400">
                            Campus Assistant
                        </span>
                    </h1>

                    <p className="mt-7 text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl">
                        Instant answers about admissions, fees, hostel, placements, and more — powered by AI, available 24/7.
                    </p>

                    <HomeActions />

                    <div className="mt-20 grid gap-4 md:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group rounded-2xl border border-white/8 bg-slate-900/50 p-6 transition-all duration-300 hover:bg-slate-800/60 hover:border-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-0.5"
                            >
                                <span className="text-2xl mb-3 block">{feature.icon}</span>
                                <h3 className="font-semibold text-white text-base mb-2 group-hover:text-cyan-300 transition-colors">{feature.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    <p className="mt-10 text-xs text-slate-600 text-center md:text-left">
                        Invertis University · Bareilly, Uttar Pradesh · invertisuniversity.ac.in
                    </p>
                </div>
            </section>
        </main>
    );
}
