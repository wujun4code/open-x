'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings as SettingsIcon,
    User,
    Lock,
    Bell,
    Eye,
    Shield,
    Palette,
    Globe,
    Save,
    LogOut
} from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('account');
    const [isSaving, setIsSaving] = useState(false);

    // Mock user data
    const [settings, setSettings] = useState({
        // Account settings
        email: 'alice@example.com',
        username: 'alice2026',
        name: 'Alice Johnson',
        bio: '',

        // Privacy settings
        profileVisibility: 'public',
        showEmail: false,
        allowMessages: true,

        // Notification settings
        emailNotifications: true,
        pushNotifications: true,
        likeNotifications: true,
        commentNotifications: true,
        followNotifications: true,

        // Appearance settings
        theme: 'light',
        language: 'en',
    });

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        alert('Settings saved successfully!');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth');
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <SettingsIcon className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
                    </div>
                    <p className="text-gray-600 text-lg">Manage your account preferences and settings</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar - Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sticky top-24">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            {/* Account Settings */}
                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={settings.email}
                                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                        <input
                                            type="text"
                                            value={settings.username}
                                            onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={settings.name}
                                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                        <textarea
                                            value={settings.bio}
                                            onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Privacy Settings */}
                            {activeTab === 'privacy' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                                        <select
                                            value={settings.profileVisibility}
                                            onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="public">Public</option>
                                            <option value="followers">Followers Only</option>
                                            <option value="private">Private</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">Show Email on Profile</p>
                                            <p className="text-sm text-gray-500">Allow others to see your email address</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.showEmail}
                                                onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">Allow Direct Messages</p>
                                            <p className="text-sm text-gray-500">Let others send you private messages</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.allowMessages}
                                                onChange={(e) => setSettings({ ...settings, allowMessages: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Notification Settings */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">Email Notifications</p>
                                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">Push Notifications</p>
                                            <p className="text-sm text-gray-500">Receive push notifications</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.pushNotifications}
                                                onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">Likes</p>
                                            <p className="text-sm text-gray-500">When someone likes your post</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.likeNotifications}
                                                onChange={(e) => setSettings({ ...settings, likeNotifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">Comments</p>
                                            <p className="text-sm text-gray-500">When someone comments on your post</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.commentNotifications}
                                                onChange={(e) => setSettings({ ...settings, commentNotifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">New Followers</p>
                                            <p className="text-sm text-gray-500">When someone follows you</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.followNotifications}
                                                onChange={(e) => setSettings({ ...settings, followNotifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Settings */}
                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance</h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                                        <select
                                            value={settings.theme}
                                            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="auto">Auto (System)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                        <select
                                            value={settings.language}
                                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                            <option value="zh">中文</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Security Settings */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Security</h2>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter current password"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                                Update Password
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <h3 className="font-semibold text-gray-900 mb-4">Danger Zone</h3>
                                        <button
                                            onClick={handleLogout}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span>Logout from All Devices</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-500">Changes will be saved to your account</p>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
