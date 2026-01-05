'use client';

import { useRole } from '@/contexts/RoleContext';
import { ReactNode } from 'react';

interface ProtectedComponentProps {
    children: ReactNode;
    requireAdmin?: boolean;
    requireModerator?: boolean;
    fallback?: ReactNode;
}

export default function ProtectedComponent({
    children,
    requireAdmin = false,
    requireModerator = false,
    fallback = null,
}: ProtectedComponentProps) {
    const { isAdmin, isModerator, loading } = useRole();

    if (loading) {
        return <>{fallback}</>;
    }

    if (requireAdmin && !isAdmin) {
        return <>{fallback}</>;
    }

    if (requireModerator && !isModerator) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
