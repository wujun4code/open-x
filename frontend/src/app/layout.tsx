import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/lib/apollo-client';
import Header from '@/components/Header';
import { ThemeProvider } from '@/contexts/ThemeProvider';

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
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider>
                    <ApolloWrapper>
                        <Header />
                        {children}
                    </ApolloWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}
