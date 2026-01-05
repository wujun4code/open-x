'use client';

import { useEffect } from 'react';
import { useRouter } from '@/navigation';
import EditProfileForm from '@/components/profile/EditProfileForm';

export default function EditProfilePage() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
            <EditProfileForm />
        </div>
    );
}
