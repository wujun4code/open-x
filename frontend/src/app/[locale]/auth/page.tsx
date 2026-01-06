'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $username: String!, $password: String!, $name: String) {
    register(email: $email, username: $username, password: $password, name: $name) {
      token
      user {
        id
        username
        email
        name
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        name
      }
    }
  }
`;

export default function AuthPage() {
    const router = useRouter();
    const t = useTranslations('Auth');
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        name: '',
    });
    const [error, setError] = useState('');

    const [register, { loading: registerLoading }] = useMutation(REGISTER_MUTATION, {
        onCompleted: (data) => {
            localStorage.setItem('token', data.register.token);
            localStorage.setItem('user', JSON.stringify(data.register.user));
            router.push('/welcome');
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            localStorage.setItem('token', data.login.token);
            localStorage.setItem('user', JSON.stringify(data.login.user));
            router.push('/');
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                await login({
                    variables: {
                        email: formData.email,
                        password: formData.password,
                    },
                });
            } else {
                await register({
                    variables: {
                        email: formData.email,
                        username: formData.username,
                        password: formData.password,
                        name: formData.name || undefined,
                    },
                });
            }
        } catch (err) {
            // Error handled by onError callback
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const loading = registerLoading || loginLoading;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 px-4">
            <div className="max-w-md w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {isLogin ? t('welcomeBack') : t('join')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {isLogin ? t('signInTitle') : t('signUpTitle')}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-dark-700">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-dark-700 p-1 rounded-lg">
                        <button
                            onClick={() => {
                                setIsLogin(true);
                                setError('');
                            }}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${isLogin
                                ? 'bg-white dark:bg-dark-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {t('signIn')}
                        </button>
                        <button
                            onClick={() => {
                                setIsLogin(false);
                                setError('');
                            }}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${!isLogin
                                ? 'bg-white dark:bg-dark-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {t('signUp')}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('labels.name')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder={t('placeholders.name')}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('labels.username')}
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required={!isLogin}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder={t('placeholders.username')}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('labels.email')}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder={t('placeholders.email')}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('labels.password')}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder={t('placeholders.password')}
                            />
                            {!isLogin && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {t('passwordHint')}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('processing')}
                                </span>
                            ) : (
                                <span>{isLogin ? t('signIn') : t('createAccount')}</span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {isLogin ? t('footer.noAccount') : t('footer.hasAccount')}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                                {isLogin ? t('signUp') : t('signIn')}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Test Credentials */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-400 font-medium mb-2">💡 {t('testTips.title')}</p>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• {t('testTips.p1')}</li>
                        <li>• {t('testTips.p2')}</li>
                        <li>• {t('testTips.p3')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
