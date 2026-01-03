'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Sparkles, Users, MessageSquare, Heart, ArrowRight, Check } from 'lucide-react';

const GET_SUGGESTED_USERS = gql`
  query GetSuggestedUsers($limit: Int) {
    users(limit: $limit) {
      id
      name
      username
      bio
    }
  }
`;

const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId)
  }
`;

const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding {
    completeOnboarding
  }
`;

export default function WelcomePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [user, setUser] = useState<any>(null);
    const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

    const { data: usersData, loading: usersLoading } = useQuery(GET_SUGGESTED_USERS, {
        variables: { limit: 3 },
        skip: !user, // Skip if user not loaded yet
    });

    const [followUser] = useMutation(FOLLOW_USER);

    const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING, {
        onCompleted: () => {
            router.push('/');
        },
        onError: (error) => {
            console.error('Error completing onboarding:', error);
            // Still redirect even if mutation fails
            router.push('/');
        },
    });

    const handleFollow = async (userId: string) => {
        try {
            await followUser({ variables: { userId } });
            setFollowedUsers(prev => {
                const newSet = new Set(prev);
                newSet.add(userId);
                return newSet;
            });
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    useEffect(() => {
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            // No user found, redirect to auth
            router.push('/auth');
        }
    }, [router]);

    const steps = [
        {
            title: 'Welcome to Open X! 🎉',
            description: 'We\'re excited to have you here',
            icon: Sparkles,
            content: (
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4 shadow-2xl">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Welcome, {user?.name || user?.username}!
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        You've just joined a vibrant community of creators, thinkers, and innovators.
                        Let's get you started!
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Ideas</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Connect</p>
                        </div>
                        <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                            <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Engage</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Express Yourself',
            description: 'Share your thoughts with the world',
            icon: MessageSquare,
            content: (
                <div className="space-y-6">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mb-4 shadow-xl">
                            <MessageSquare className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Share Your Voice
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Post updates, share ideas, and start conversations
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user?.name?.[0] || user?.username?.[0] || 'U'}
                            </div>
                            <div className="flex-1">
                                <div className="bg-white dark:bg-dark-700 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-dark-600">
                                    <p className="text-gray-700 dark:text-gray-300 italic">
                                        "Just joined Open X! Excited to connect with everyone here. 🚀"
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center">
                                        <Heart className="w-4 h-4 mr-1" /> Like
                                    </span>
                                    <span className="flex items-center">
                                        <MessageSquare className="w-4 h-4 mr-1" /> Comment
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            <strong>💡 Pro tip:</strong> Posts can be up to 280 characters. Make every word count!
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Build Your Network',
            description: 'Follow interesting people',
            icon: Users,
            content: (
                <div className="space-y-6">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4 shadow-xl">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Connect with Others
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Follow users to see their posts in your feed
                        </p>
                    </div>

                    <div className="space-y-3">
                        {usersLoading ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            usersData?.users
                                .filter((u: any) => u.id !== user?.id) // Don't show self
                                .map((suggestedUser: any) => (
                                    <div key={suggestedUser.id} className="bg-white dark:bg-dark-700 rounded-xl p-4 border border-gray-200 dark:border-dark-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {suggestedUser.name?.[0] || suggestedUser.username?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{suggestedUser.name || suggestedUser.username}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">@{suggestedUser.username}</p>
                                                    {suggestedUser.bio && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">{suggestedUser.bio}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleFollow(suggestedUser.id)}
                                                disabled={followedUsers.has(suggestedUser.id)}
                                                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${followedUsers.has(suggestedUser.id)
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {followedUsers.has(suggestedUser.id) ? 'Following' : 'Follow'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                        )}
                        {!usersLoading && (!usersData?.users || usersData?.users.filter((u: any) => u.id !== user?.id).length === 0) && (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                No suggestions available right now.
                            </div>
                        )}
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                        <p className="text-sm text-purple-800 dark:text-purple-400">
                            <strong>✨ Coming soon:</strong> Discover users based on your interests and activity!
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: 'You\'re All Set!',
            description: 'Start exploring Open X',
            icon: Check,
            content: (
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-4 shadow-2xl">
                        <Check className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                        You're Ready to Go! 🎊
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Your account is all set up. Time to dive in and explore what Open X has to offer!
                    </p>

                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 max-w-lg mx-auto border border-blue-100 dark:border-blue-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's next?</h3>
                        <ul className="space-y-3 text-left">
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">Create your first post and share your thoughts</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">Follow interesting users to build your feed</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">Engage with posts through likes and comments</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">Customize your profile to express yourself</span>
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = async () => {
        try {
            await completeOnboarding();
        } catch (error) {
            // Error already handled in mutation
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const currentStepData = steps[currentStep];
    const Icon = currentStepData.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            {/* Header */}
            <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">Open X</span>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center space-x-2 py-6">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${idx === currentStep
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : idx < currentStep
                                            ? 'border-green-600 bg-green-600 text-white'
                                            : 'border-gray-300 bg-white text-gray-400'
                                        }`}
                                >
                                    {idx < currentStep ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-semibold">{idx + 1}</span>
                                    )}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`w-16 h-1 mx-2 rounded-full transition-all ${idx < currentStep ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-dark-700">
                        {currentStepData.content}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Step {currentStep + 1} of {steps.length}
                        </div>
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
