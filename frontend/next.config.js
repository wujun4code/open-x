/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost', 'api.dicebear.com', 'aiechohub.com'],
    },
    async rewrites() {
        return [
            {
                source: '/api/graphql',
                destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
            },
        ];
    },
};

const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

module.exports = withNextIntl(nextConfig);
