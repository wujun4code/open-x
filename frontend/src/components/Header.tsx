'use client';

import { useEffect, useState, useRef } from 'react';
import { Link, usePathname, useRouter } from '@/navigation';
import { Home, User, LogIn, UserPlus, Settings, LogOut, ChevronDown, TrendingUp, Sun, Moon, Monitor, Shield, Edit, Bell } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';

import ProtectedComponent from './ProtectedComponent';
import { useTranslations } from 'next-intl';
import { useQuery, gql } from '@apollo/client';
import NotificationDropdown from './NotificationDropdown';
import { GET_UNREAD_COUNT } from '@/lib/queries';

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      name
      avatar
    }
  }
`;

export default function Header() {
    const t = useTranslations('Header');
    const pathname = usePathname();
    const router = useRouter();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const themeDropdownRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();

    // Fetch fresh user data from API
    const { data: userData } = useQuery(ME_QUERY, {
        skip: !isAuthenticated,
    });
    const user = userData?.me;

    // Fetch unread notifications count with polling
    const { data: unreadData } = useQuery(GET_UNREAD_COUNT, {
        skip: !isAuthenticated,
        pollInterval: 5000, // Poll every 5 seconds
    });
    const unreadCount = unreadData?.unreadNotificationsCount || 0;

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');

        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }

        setIsLoading(false);
    }, [pathname]); // Re-check on route change

    useEffect(() => {
        // Close dropdowns when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
                setIsNotificationDropdownOpen(false);
            }
            if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
                setIsThemeDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsDropdownOpen(false);
        router.push('/auth');
    };




    // Don't show header on auth and welcome pages
    if (pathname === '/auth' || pathname === '/welcome') {
        return null;
    }

    return (
        <header className="fixed top-4 left-4 right-4 z-50">
            <div className="bg-white/85 dark:bg-dark-900/85 backdrop-blur-xl border border-gray-200/50 dark:border-dark-700/50 rounded-2xl shadow-glass dark:shadow-glass-dark">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                                </svg>
                            </div>
                            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">Open X</span>
                        </Link>

                        {/* Navigation */}
                        <nav className="flex items-center space-x-1 sm:space-x-2">
                            <Link
                                href="/"
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${pathname === '/'
                                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-dark-800'
                                    }`}
                            >
                                <Home className="w-5 h-5" />
                                <span className="font-medium hidden sm:inline">{t('home')}</span>
                            </Link>

                            {!isLoading && (
                                <>
                                    {isAuthenticated ? (
                                        <>
                                            <Link
                                                href="/trending"
                                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/trending'
                                                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-dark-700'
                                                    }`}
                                            >
                                                <TrendingUp className="w-5 h-5" />
                                                <span className="font-medium hidden sm:inline">{t('trending')}</span>
                                            </Link>

                                            {/* Moderation Link (Moderator/Admin only) */}
                                            <ProtectedComponent requireModerator>
                                                <Link
                                                    href="/moderation"
                                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/moderation'
                                                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-dark-700'
                                                        }`}
                                                >
                                                    <Shield className="w-5 h-5" />
                                                    <span className="font-medium hidden sm:inline">{t('moderation')}</span>
                                                </Link>
                                            </ProtectedComponent>


                                            {/* Notification Bell */}
                                            <div className="relative" ref={notificationDropdownRef}>
                                                <button
                                                    onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors relative"
                                                    title="Notifications"
                                                >
                                                    <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                                    {unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                                            {unreadCount > 9 ? '9+' : unreadCount}
                                                        </span>
                                                    )}
                                                </button>

                                                {isNotificationDropdownOpen && (
                                                    <NotificationDropdown onClose={() => setIsNotificationDropdownOpen(false)} />
                                                )}
                                            </div>

                                            {/* Theme Switcher */}
                                            <div className="relative" ref={themeDropdownRef}>
                                                <button
                                                    onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                                                    title="Change theme"
                                                >
                                                    {theme === 'light' && <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
                                                    {theme === 'dark' && <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
                                                    {theme === 'system' && <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
                                                </button>

                                                {/* Theme Dropdown Menu */}
                                                {isThemeDropdownOpen && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 py-2 z-50">
                                                        <button
                                                            onClick={() => {
                                                                setTheme('light');
                                                                setIsThemeDropdownOpen(false);
                                                            }}
                                                            className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${theme === 'light' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                                        >
                                                            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('theme.light')}</span>
                                                            {theme === 'light' && <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>}
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setTheme('dark');
                                                                setIsThemeDropdownOpen(false);
                                                            }}
                                                            className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${theme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                                        >
                                                            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('theme.dark')}</span>
                                                            {theme === 'dark' && <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>}
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setTheme('system');
                                                                setIsThemeDropdownOpen(false);
                                                            }}
                                                            className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${theme === 'system' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                                        >
                                                            <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('theme.system')}</span>
                                                            {theme === 'system' && <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* User Dropdown */}
                                            <div className="relative pl-3 border-l border-gray-200 dark:border-dark-700" ref={dropdownRef}>
                                                <button
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                                                >
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                                                        {user?.avatar ? (
                                                            <img src={user.avatar} alt={user.name || user.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            user?.name?.[0] || user?.username?.[0] || 'U'
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">{user?.name || user?.username}</span>
                                                    <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {isDropdownOpen && (
                                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 py-2 z-50">
                                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || user?.username}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</p>
                                                        </div>

                                                        <Link
                                                            href="/profile"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                                                        >
                                                            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile')}</span>
                                                        </Link>

                                                        <Link
                                                            href="/profile/edit"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                                                        >
                                                            <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('editProfile')}</span>
                                                        </Link>

                                                        <Link
                                                            href="/settings"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                                                        >
                                                            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings')}</span>
                                                        </Link>

                                                        <div className="border-t border-gray-100 dark:border-dark-700 my-2"></div>

                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        >
                                                            <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                            <span className="text-sm font-medium text-red-600 dark:text-red-400">{t('logout')}</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/auth"
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors font-medium"
                                            >
                                                <LogIn className="w-5 h-5" />
                                                <span className="hidden sm:inline">{t('signIn')}</span>
                                            </Link>
                                            <Link
                                                href="/auth"
                                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg"
                                            >
                                                <UserPlus className="w-5 h-5" />
                                                <span className="hidden sm:inline">{t('signUp')}</span>
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}
