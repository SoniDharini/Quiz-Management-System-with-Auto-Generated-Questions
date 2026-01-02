import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    User,
    Shield,
    Bell,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    Moon,
    Sun,
    Globe,
    Lock,
    Trash2,
    ThumbsUp,
    AtSign,
    FileText,
    Eye,
    Sliders,
    Zap,
    Target
} from 'lucide-react';
import { userAPI, authAPI } from '../services/api';

interface SettingsPageProps {
    onBack: () => void;
}

type TabType = 'profile' | 'preferences' | 'notifications' | 'privacy' | 'security';

export function SettingsPage({ onBack }: SettingsPageProps) {
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        full_name: '',
        bio: ''
    });

    // Preferences State
    const [preferences, setPreferences] = useState({
        theme_preference: 'light'
    });

    // Notifications State
    const [notifications, setNotifications] = useState({
        email_notifications: true,
        push_notifications: true,
        streak_reminders: true
    });

    // Privacy State
    const [privacy, setPrivacy] = useState({
        is_public_profile: true,
        show_activity: true
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const data = await userAPI.getProfile();
            setProfileData({
                username: data.username,
                email: data.email,
                full_name: data.full_name || '',
                bio: data.bio || ''
            });
            setPreferences({
                theme_preference: data.theme_preference || 'light'
            });
            setNotifications({
                email_notifications: data.email_notifications ?? true,
                push_notifications: data.push_notifications ?? true,
                streak_reminders: data.streak_reminders ?? true
            });
            setPrivacy({
                is_public_profile: data.is_public_profile ?? true,
                show_activity: data.show_activity ?? true
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
            setErrorMessage('Failed to load settings. Please try again.');
        }
    };

    const clearMessages = () => {
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleSaveAll = async () => {
        clearMessages();
        setIsLoading(true);
        try {
            await userAPI.updateProfile({
                full_name: profileData.full_name,
                bio: profileData.bio,
                ...preferences,
                ...notifications,
                ...privacy
            });
            setSuccessMessage('Settings saved successfully!');
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMessage('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setErrorMessage('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.changePassword({
                old_password: passwordData.oldPassword,
                new_password: passwordData.newPassword,
                confirm_password: passwordData.confirmPassword
            });
            setSuccessMessage('Password changed successfully!');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        try {
            await userAPI.deleteAccount();
            window.location.href = '/login'; // Force logout and redirect
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to delete account');
            setShowDeleteConfirm(false);
            setIsLoading(false);
        }
    };

    const TabButton = ({ id, icon: Icon, label }: { id: TabType; icon: any; label: string }) => (
        <motion.button
            onClick={() => { setActiveTab(id); clearMessages(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id
                ? 'bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white shadow-lg'
                : 'bg-white/50 text-[#003B73] hover:bg-white/80'
                }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
            {activeTab === id && (
                <motion.div
                    layoutId="activeTabIndicator"
                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                />
            )}
        </motion.button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#DFF4FF] to-[#B9E7FF]">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-[#003B73]/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-md border border-[#003B73]/10 hover:shadow-lg transition-all text-[#003B73]"
                            whileHover={{ scale: 1.05, x: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </motion.button>
                        <div className="text-[#003B73] text-xl font-semibold">Settings</div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="md:col-span-3 space-y-4">
                        <TabButton id="profile" icon={User} label="Profile" />
                        <TabButton id="preferences" icon={Sliders} label="Preferences" />
                        <TabButton id="notifications" icon={Bell} label="Notifications" />
                        <TabButton id="privacy" icon={Shield} label="Privacy" />
                        <TabButton id="security" icon={Lock} label="Security" />
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-9">
                        <motion.div
                            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#003B73]/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <div className="mb-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#003B73]">
                                        {activeTab === 'profile' && 'Profile Settings'}
                                        {activeTab === 'preferences' && 'App Preferences'}
                                        {activeTab === 'notifications' && 'Notification Settings'}
                                        {activeTab === 'privacy' && 'Privacy Controls'}
                                        {activeTab === 'security' && 'Login & Security'}
                                    </h2>
                                    <p className="text-[#003B73]/60">
                                        {activeTab === 'profile' && 'Manage your personal information'}
                                        {activeTab === 'preferences' && 'Customize your quiz experience'}
                                        {activeTab === 'notifications' && 'Decide how we communicate with you'}
                                        {activeTab === 'privacy' && 'Control what others can see'}
                                        {activeTab === 'security' && 'Update your password and secure your account'}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <AnimatePresence>
                                {successMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {successMessage}
                                    </motion.div>
                                )}
                                {errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5" />
                                        {errorMessage}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <motion.div
                                    className="space-y-6 max-w-2xl"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: {
                                            opacity: 1,
                                            transition: { staggerChildren: 0.1 }
                                        }
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                            <label className="block text-sm font-medium text-[#003B73]/70 mb-2 ml-1">Username</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40 group-hover:text-[#003B73]/60 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={profileData.username}
                                                    disabled
                                                    className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-gray-50/50 border border-gray-200 text-gray-500 font-medium cursor-not-allowed transition-all truncate"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-500">Read-only</div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                            <label className="block text-sm font-medium text-[#003B73]/70 mb-2 ml-1">Email</label>
                                            <div className="relative group">
                                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40 group-hover:text-[#003B73]/60 transition-colors" />
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-gray-50/50 border border-gray-200 text-gray-500 font-medium cursor-not-allowed transition-all truncate"
                                                />
                                            </div>
                                        </motion.div>
                                    </div>

                                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                        <label className="block text-sm font-medium text-[#003B73] mb-2 ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40 group-focus-within:text-[#003B73] transition-colors">
                                                <Target className="w-full h-full" />
                                            </div>
                                            <input
                                                type="text"
                                                value={profileData.full_name}
                                                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 border border-[#003B73]/10 focus:border-[#003B73]/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#003B73]/5 text-[#003B73] font-medium placeholder-[#003B73]/30 transition-all shadow-sm hover:shadow"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                        <label className="block text-sm font-medium text-[#003B73] mb-2 ml-1">Bio</label>
                                        <div className="relative group">
                                            <FileText className="absolute left-4 top-6 w-5 h-5 text-[#003B73]/40 group-focus-within:text-[#003B73] transition-colors" />
                                            <textarea
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 border border-[#003B73]/10 focus:border-[#003B73]/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#003B73]/5 text-[#003B73] font-medium placeholder-[#003B73]/30 transition-all shadow-sm hover:shadow min-h-[120px] resize-y"
                                                placeholder="Tell us a bit about yourself..."
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="border-t border-[#003B73]/10 pt-8 mt-8"
                                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                    >
                                        <h3 className="text-red-600 font-bold mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            Danger Zone
                                        </h3>
                                        <div className="flex items-center justify-between p-6 bg-red-50/50 rounded-2xl border border-red-100/50 hover:border-red-200 transition-colors group">
                                            <div>
                                                <p className="text-red-900 font-semibold mb-1">Delete Account</p>
                                                <p className="text-sm text-red-600/70">Permanently remove your account and all data</p>
                                            </div>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="px-6 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm font-medium"
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <motion.div
                                    className="space-y-6 max-w-2xl"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: {
                                            opacity: 1,
                                            transition: { staggerChildren: 0.1 }
                                        }
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                        <label className="block text-sm font-medium text-[#003B73] mb-3 ml-1">Color Theme</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setPreferences({ ...preferences, theme_preference: 'light' })}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${preferences.theme_preference === 'light' ? 'border-[#003B73] bg-[#DFF4FF] shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-[#003B73]/50 hover:bg-white/50'}`}
                                            >
                                                <Sun className="w-6 h-6 text-[#003B73]" />
                                                <span className="font-medium text-[#003B73]">Light Mode</span>
                                            </button>
                                            <button
                                                onClick={() => setPreferences({ ...preferences, theme_preference: 'dark' })}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${preferences.theme_preference === 'dark' ? 'border-[#003B73] bg-[#003B73] text-white shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-[#003B73]/50 hover:bg-white/50 text-gray-500'}`}
                                            >
                                                <Moon className="w-6 h-6" />
                                                <span className="font-medium">Dark Mode</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <motion.div
                                    className="space-y-4 max-w-2xl"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: {
                                            opacity: 1,
                                            transition: { staggerChildren: 0.1 }
                                        }
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {[['email_notifications', 'Email Notifications', 'Receive updates about your quiz performance', <AtSign key="email" className="w-5 h-5" />],
                                    ['push_notifications', 'Push Notifications', 'Get notified when new quizzes are available', <Bell key="push" className="w-5 h-5" />],
                                    ['streak_reminders', 'Streak Reminders', 'Get a daily reminder to keep your streak alive', <Zap key="streak" className="w-5 h-5" />]
                                    ].map(([key, label, desc, icon]) => (
                                        <motion.div
                                            key={key as string}
                                            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                            className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-[#003B73]/10 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#DFF4FF] rounded-lg text-[#003B73]">
                                                    {icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-[#003B73] font-medium">{label}</h3>
                                                    <p className="text-sm text-[#003B73]/60">{desc}</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notifications[key as keyof typeof notifications]}
                                                    onChange={(e) => setNotifications({ ...notifications, [key as string]: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#003B73]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003B73]"></div>
                                            </label>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <motion.div
                                    className="space-y-4 max-w-2xl"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: {
                                            opacity: 1,
                                            transition: { staggerChildren: 0.1 }
                                        }
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.div
                                        className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-[#003B73]/10 hover:shadow-md transition-all"
                                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#DFF4FF] rounded-lg text-[#003B73]">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-[#003B73] font-medium">Public Profile</h3>
                                                <p className="text-sm text-[#003B73]/60">Allow others to see your profile on the leaderboard</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={privacy.is_public_profile}
                                                onChange={(e) => setPrivacy({ ...privacy, is_public_profile: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#003B73]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003B73]"></div>
                                        </label>
                                    </motion.div>

                                    <motion.div
                                        className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-[#003B73]/10 hover:shadow-md transition-all"
                                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#DFF4FF] rounded-lg text-[#003B73]">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-[#003B73] font-medium">Show Activity</h3>
                                                <p className="text-sm text-[#003B73]/60">Display your recent quiz activity to other users</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={privacy.show_activity}
                                                onChange={(e) => setPrivacy({ ...privacy, show_activity: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#003B73]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003B73]"></div>
                                        </label>
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <motion.div
                                    className="space-y-6 max-w-xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#003B73] mb-2 ml-1">Current Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40 group-focus-within:text-[#003B73] transition-colors" />
                                                <input
                                                    type="password"
                                                    value={passwordData.oldPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 border border-[#003B73]/10 focus:border-[#003B73]/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#003B73]/5 text-[#003B73] font-medium placeholder-[#003B73]/30 transition-all shadow-sm hover:shadow"
                                                    required
                                                    placeholder="Enter current password"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#003B73] mb-2 ml-1">New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40 group-focus-within:text-[#003B73] transition-colors" />
                                                <input
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 border border-[#003B73]/10 focus:border-[#003B73]/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#003B73]/5 text-[#003B73] font-medium placeholder-[#003B73]/30 transition-all shadow-sm hover:shadow"
                                                    required
                                                    minLength={8}
                                                    placeholder="Enter new password (min. 8 chars)"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#003B73] mb-2 ml-1">Confirm New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40 group-focus-within:text-[#003B73] transition-colors" />
                                                <input
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 border border-[#003B73]/10 focus:border-[#003B73]/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#003B73]/5 text-[#003B73] font-medium placeholder-[#003B73]/30 transition-all shadow-sm hover:shadow"
                                                    required
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <motion.button
                                                type="submit"
                                                disabled={isLoading}
                                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                <span>Update Password</span>
                                            </motion.button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* Save Button for non-Security/Profile tabs (or just consistent footer) */}
                            {activeTab !== 'security' && (
                                <div className="mt-8 pt-6 border-t border-[#003B73]/10 flex justify-end">
                                    <motion.button
                                        onClick={handleSaveAll}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        <span>Save Changes</span>
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-red-100"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-[#003B73] mb-2">Delete Account?</h2>
                            <p className="text-[#003B73]/70">
                                This action cannot be undone. All your quizzes, progress, and badges will be permanently lost.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 bg-gray-100 text-[#003B73] rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete Forever
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}


