'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ReactNode } from 'react';

const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
    credentials: 'include',
});

// Add authentication token to headers
const authLink = setContext((_, { headers }) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const client = new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    messages: {
                        keyArgs: ['conversationId'],
                        merge(existing = [], incoming, { args }) {
                            if (!args) return incoming;
                            const offset = args.offset || 0;

                            // For reverse infinite scroll, we prepend older messages
                            // When offset > 0, incoming messages are older than existing ones
                            if (offset === 0) {
                                // Polling or refetching newest messages
                                // We should merge them carefully if existing has more than one page
                                // But for simplicity, if it's offset 0, we treat it as the "head"
                                // Better: find where existing starts and replace/update
                                return incoming;
                            }

                            // Prepend older messages to the beginning of the list
                            return [...incoming, ...existing];
                        },
                    },
                },
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
        },
    },
});

export function ApolloWrapper({ children }: { children: ReactNode }) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default client;
