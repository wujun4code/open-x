'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, LogIn, UserPlus, Settings, LogOut, ChevronDown, TrendingUp } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userStr));
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [pathname]); // Re-check on route change

    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Open X</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center space-x-6">
                        <Link
                            href="/"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-medium">Home</span>
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/trending"
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/trending'
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <TrendingUp className="w-5 h-5" />
                                    <span className="font-medium">Trending</span>
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative pl-3 border-l border-gray-200" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {user?.name?.[0] || user?.username?.[0] || 'U'}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{user?.name || user?.username}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-900">{user?.name || user?.username}</p>
                                                <p className="text-xs text-gray-500">@{user?.username}</p>
                                            </div>

                                            <Link
                                                href="/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <User className="w-5 h-5 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">View Profile</span>
                                            </Link>

                                            <Link
                                                href="/settings"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <Settings className="w-5 h-5 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">Settings</span>
                                            </Link>

                                            <div className="border-t border-gray-100 my-2"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-5 h-5 text-red-600" />
                                                <span className="text-sm font-medium text-red-600">Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth"
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span>Sign In</span>
                                </Link>
                                <Link
                                    href="/auth"
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    <span>Sign Up</span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
