import HomeActions from '@/components/HomeActions';

const features = [
    {
        title: 'Instant Admissions Help',
        desc: 'Get real-time answers about fees, eligibility, and the enrollment process.',
    },
    {
        title: 'Campus Life & Hostels',
        desc: 'Discover hostel facilities, placement records, and vibrant campus life details.',
    },
    {
        title: 'Academic Assistant',
        desc: 'Ask general computer science, math, or programming questions for your studies.',
    },
];

export default function HomePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

            <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
                <div className="max-w-4xl rounded-[2rem] border border-cyan-400/20 bg-white/5 p-8 md:p-12 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-cyan-300 font-semibold">
                            Invertis University AI
                        </p>
                    </div>
                    
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        Your Intelligent <br className="hidden md:block" /> Campus Assistant
                    </h1>
                    
                    <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl">
                        Experience seamless access to university information. Whether you are a prospective student seeking admission details or a current student looking for academic guidance, our AI-powered chatbot is here to help 24/7.
                    </p>

                    <div className="mt-10">
                        <HomeActions />
                    </div>

                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition-all hover:bg-slate-800/60 hover:border-cyan-500/30">
                                <h3 className="font-semibold text-cyan-50 text-lg mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
