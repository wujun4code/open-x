'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';

const MY_ROLE_QUERY = gql`
  query MyRole {
    myRole
  }
`;

interface RoleContextType {
    role: string;
    isAdmin: boolean;
    isModerator: boolean;
    loading: boolean;
}

const RoleContext = createContext<RoleContextType>({
    role: 'user',
    isAdmin: false,
    isModerator: false,
    loading: true,
});

export function RoleProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is authenticated
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        setIsAuthenticated(!!token);
    }, []);

    const { data, loading, error } = useQuery(MY_ROLE_QUERY, {
        // Only fetch if user is logged in
        skip: typeof window === 'undefined' || !isAuthenticated,
        fetchPolicy: 'network-only', // Always fetch fresh data
    });

    const role = data?.myRole || 'user';
    const isAdmin = role === 'admin';
    const isModerator = role === 'moderator' || role === 'admin';

    // Debug logging
    if (typeof window !== 'undefined') {
        console.log('[RoleContext] Debug:', {
            isAuthenticated,
            loading,
            error: error?.message,
            role,
            isAdmin,
            isModerator,
            rawData: data
        });
    }

    // If there's an error or not authenticated, default to user role
    const effectiveLoading = isAuthenticated ? loading : false;

    return (
        <RoleContext.Provider value={{ role, isAdmin, isModerator, loading: effectiveLoading }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    return useContext(RoleContext);
}
