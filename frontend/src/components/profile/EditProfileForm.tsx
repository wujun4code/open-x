'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useRouter } from '@/navigation';
import { UPDATE_PROFILE } from '@/lib/queries';
import ImageUploadButton from './ImageUploadButton';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      name
      bio
      avatar
      coverImage
      username
    }
  }
`;

export default function EditProfileForm() {
    const t = useTranslations('EditProfile');
    const router = useRouter();
    const { data, loading: loadingUser } = useQuery(GET_CURRENT_USER);
    const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE);

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        avatar: '',
        coverImage: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

    // Load current user data
    useEffect(() => {
        if (data?.me) {
            setFormData({
                name: data.me.name || '',
                bio: data.me.bio || '',
                avatar: data.me.avatar || '',
                coverImage: data.me.coverImage || '',
            });
        }
    }, [data]);

    // Track form changes
    useEffect(() => {
        if (data?.me) {
            const hasChanges =
                formData.name !== (data.me.name || '') ||
                formData.bio !== (data.me.bio || '') ||
                formData.avatar !== (data.me.avatar || '') ||
                formData.coverImage !== (data.me.coverImage || '');
            setIsDirty(hasChanges);
        }
    }, [formData, data]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('nameRequired');
        } else if (formData.name.length > 50) {
            newErrors.name = t('nameTooLong');
        }

        if (formData.bio.length > 160) {
            newErrors.bio = t('bioTooLong');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!isDirty) {
            alert(t('noChanges'));
            return;
        }

        try {
            await updateProfile({
                variables: {
                    name: formData.name.trim(),
                    bio: formData.bio.trim() || null,
                    avatar: formData.avatar || null,
                    coverImage: formData.coverImage || null,
                },
            });

            // Navigate back to profile
            router.push(`/profile/${data.me.username}`);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(error.message || 'Failed to update profile. Please try again.');
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            setShowUnsavedWarning(true);
        } else {
            router.back();
        }
    };

    const confirmCancel = () => {
        router.back();
    };

    if (loadingUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const bioCharCount = formData.bio.length;
    const bioCharLimit = 160;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
                    type="button"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Cover Image */}
                <ImageUploadButton
                    currentImage={formData.coverImage}
                    onImageChange={(url) => setFormData({ ...formData, coverImage: url || '' })}
                    label={t('coverImage')}
                    aspectRatio="16:9"
                />

                {/* Avatar */}
                <ImageUploadButton
                    currentImage={formData.avatar}
                    onImageChange={(url) => setFormData({ ...formData, avatar: url || '' })}
                    label={t('avatar')}
                    aspectRatio="1:1"
                />

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('name')} <span className="text-red-600">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.name
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-dark-700 focus:ring-blue-500'
                            } bg-white dark:bg-dark-900 focus:ring-2 focus:outline-none transition-colors`}
                        placeholder={t('bioPlaceholder')}
                        maxLength={50}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    <p className="mt-1 text-xs text-gray-500">{formData.name.length}/50 {t('name').toLowerCase()}</p>
                </div>

                {/* Bio */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('bio')}
                    </label>
                    <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => {
                            setFormData({ ...formData, bio: e.target.value });
                            if (errors.bio) setErrors({ ...errors, bio: '' });
                        }}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.bio
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-dark-700 focus:ring-blue-500'
                            } bg-white dark:bg-dark-900 focus:ring-2 focus:outline-none transition-colors resize-none`}
                        placeholder={t('bioPlaceholder')}
                        rows={4}
                        maxLength={160}
                    />
                    {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
                    <p className={`mt-1 text-xs ${bioCharCount > bioCharLimit ? 'text-red-600' : 'text-gray-500'}`}>
                        {bioCharCount}/{bioCharLimit} characters
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-dark-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                        disabled={updating}
                    >
                        {t('cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={updating || !isDirty}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {updating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('saving')}
                            </>
                        ) : (
                            t('saveChanges')
                        )}
                    </button>
                </div>
            </form>

            {/* Unsaved Changes Warning */}
            {showUnsavedWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{t('unsavedChanges.title')}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {t('unsavedChanges.message')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUnsavedWarning(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-dark-800 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-dark-700 transition-colors"
                            >
                                {t('unsavedChanges.keepEditing')}
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                {t('unsavedChanges.discard')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
