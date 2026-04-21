import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'College Chatbot - Your College Assistant',
    description: 'AI-powered chatbot for college inquiries, admissions, courses, and more',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
