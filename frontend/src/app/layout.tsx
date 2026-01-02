import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/lib/apollo-client';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Open X - A Modern Social Platform',
    description: 'Connect, share, and engage with the world on Open X',
    keywords: ['social media', 'twitter', 'open x', 'social network'],
    authors: [{ name: 'Open X Team' }],
    openGraph: {
        title: 'Open X - A Modern Social Platform',
        description: 'Connect, share, and engage with the world on Open X',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
                <ApolloWrapper>
                    <Header />
                    {children}
                </ApolloWrapper>
            </body>
        </html>
    );
}
