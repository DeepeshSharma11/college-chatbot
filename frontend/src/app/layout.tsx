import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'Invertis University AI — Campus Assistant',
    description: 'AI-powered chatbot for Invertis University. Get instant answers about admissions, fees, courses, hostel, placements, and more.',
    keywords: 'Invertis University, chatbot, admissions, fees, courses, hostel, placements, Bareilly',
    openGraph: {
        title: 'Invertis University AI — Campus Assistant',
        description: 'Get instant answers about Invertis University admissions, fees, and more.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="font-sans antialiased">{children}</body>
        </html>
    );
}
