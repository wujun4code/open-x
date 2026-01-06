import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import '../globals.css';
import { ApolloWrapper } from '@/lib/apollo-client';
import Header from '@/components/Header';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { RoleProvider } from '@/contexts/RoleContext';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

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

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = await getMessages();

    return (
        <html lang={locale} className={`${inter.variable} ${lexend.variable}`}>
            <body className={inter.className}>
                <ThemeProvider>
                    <ApolloWrapper>
                        <RoleProvider>
                            <NextIntlClientProvider messages={messages}>
                                <Header />
                                {children}
                            </NextIntlClientProvider>
                        </RoleProvider>
                    </ApolloWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}
