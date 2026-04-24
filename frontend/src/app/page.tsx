import Link from 'next/link';

const features = [
    'Student login and registration',
    'College FAQ chatbot for admissions, fees, courses, hostel, and placements',
    'Groq-first architecture with GPT-2 fallback support',
];

export default function HomePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
                <div className="max-w-3xl rounded-[2rem] border border-cyan-400/20 bg-white/5 p-10 shadow-2xl backdrop-blur">
                    <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-300">
                        College Chatbot Project
                    </p>
                    <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                        College inquiries ke liye ek ready-to-demo AI chatbot
                    </h1>
                    <p className="mt-6 text-lg text-slate-200">
                        Yeh project backend aur frontend ke saath bana hai.
                        Aap isse apne college ke admission helpdesk, course guidance,
                        aur student support demo ke liye use kar sakte ho.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                            href="/chat"
                            className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                            Start Demo
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                        >
                            Login
                        </Link>
                    </div>

                    <div className="mt-10 grid gap-3 text-sm text-slate-200 md:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
