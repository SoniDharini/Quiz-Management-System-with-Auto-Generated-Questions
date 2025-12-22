import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Camera,
  User,
  Trophy,
  Zap,
  Target,
  Settings,
  BarChart3,
  TrendingUp,
  Award,
  Brain,
  Calendar,
  Mail,
  MapPin,
  Edit2,
  X,
  LogOut,
  Crown,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { userAPI, quizAPI, getStoredUsername } from '../services/api';

interface ProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function ProfilePage({ onBack, onLogout }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'achievements'>('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditPicture, setShowEditPicture] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        setShowEditPicture(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const [profile, history, activity] = await Promise.all([
          userAPI.getProfile(),
          quizAPI.getQuizHistory().catch(() => []),
          userAPI.getRecentActivity().catch(() => [])
        ]);
        
        setUserData({
          name: profile.user?.username || getStoredUsername() || 'User',
          email: profile.user?.email || 'user@example.com',
          joinDate: new Date(profile.user?.date_joined || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          avatar: profile.user?.username?.substring(0, 2).toUpperCase() || 'U',
          level: profile.level || 1,
          xp: profile.xp || 0,
          xpToNextLevel: profile.xp_to_next_level || 100,
          streak: profile.current_streak || 0,
          longestStreak: profile.longest_streak || 0,
          totalQuizzes: profile.total_quizzes_taken || 0,
          quizzesCreated: profile.total_quizzes_created || 0,
          quizzesTaken: profile.total_quizzes_taken || 0,
          averageScore: profile.average_score || 0,
          totalBadges: profile.total_achievements || 0,
          rank: 'Top ' + (profile.percentile || 50) + '%',
        });
        
        setQuizHistory(history.slice(0, 5));
        setRecentActivity(activity);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
        // Set default data if fetch fails
        setUserData({
          name: getStoredUsername() || 'User',
          email: 'user@example.com',
          joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          avatar: getStoredUsername()?.substring(0, 2).toUpperCase() || 'U',
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          streak: 0,
          longestStreak: 0,
          totalQuizzes: 0,
          quizzesCreated: 0,
          quizzesTaken: 0,
          averageScore: 0,
          totalBadges: 0,
          rank: 'New User',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Complete your first quiz', icon: Award, color: 'from-blue-400 to-blue-600', unlocked: true },
    { id: 2, title: 'Week Warrior', description: '7-day streak', icon: Target, color: 'from-orange-400 to-orange-600', unlocked: true },
    { id: 3, title: 'Knowledge Seeker', description: 'Take 25 quizzes', icon: Brain, color: 'from-purple-400 to-purple-600', unlocked: true },
    { id: 4, title: 'Perfect Score', description: 'Score 100% on a quiz', icon: Trophy, color: 'from-green-400 to-green-600', unlocked: true },
    { id: 5, title: 'Quiz Master', description: 'Create 10 quizzes', icon: Trophy, color: 'from-yellow-400 to-yellow-600', unlocked: true },
    { id: 6, title: 'Speed Demon', description: 'Complete quiz in record time', icon: Zap, color: 'from-cyan-400 to-cyan-600', unlocked: true },
    { id: 7, title: 'Consistent Learner', description: '30-day streak', icon: Trophy, color: 'from-indigo-400 to-indigo-600', unlocked: false },
    { id: 8, title: 'Champion', description: 'Reach level 10', icon: Trophy, color: 'from-pink-400 to-pink-600', unlocked: false },
  ];

  const performanceData = [
    { category: 'JavaScript', quizzes: 12, avgScore: 89, bestScore: 98 },
    { category: 'React', quizzes: 8, avgScore: 92, bestScore: 100 },
    { category: 'CSS', quizzes: 10, avgScore: 85, bestScore: 94 },
    { category: 'Python', quizzes: 5, avgScore: 88, bestScore: 95 },
    { category: 'General', quizzes: 12, avgScore: 84, bestScore: 91 },
  ];

  // Pie chart data for quiz distribution
  const pieChartData = [
    { name: 'JavaScript', value: 12, color: '#3B82F6' },
    { name: 'React', value: 8, color: '#8B5CF6' },
    { name: 'CSS', value: 10, color: '#06B6D4' },
    { name: 'Python', value: 5, color: '#10B981' },
    { name: 'General', value: 12, color: '#F59E0B' },
  ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

  // Show loading state
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#DFF4FF] to-[#B9E7FF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#003B73] animate-spin mx-auto mb-4" />
          <p className="text-[#003B73]/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DFF4FF] to-[#B9E7FF]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#003B73]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-md border border-[#003B73]/10 hover:shadow-lg transition-all text-[#003B73]"
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </motion.button>
              <div className="text-[#003B73] text-xl font-semibold">My Profile</div>
            </div>
            
            <motion.button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={cancelLogout}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-[#003B73]/10"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-[#003B73] mb-2">Confirm Logout</h2>
                <p className="text-[#003B73]/70">
                  Are you sure you want to logout? Your progress is saved, but we&apos;ll miss you!
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={cancelLogout}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#DFF4FF] to-white border-2 border-[#003B73]/20 text-[#003B73] rounded-2xl hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmLogout}
                  className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Yes, Logout
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Edit Profile Picture Modal */}
      {showEditPicture && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowEditPicture(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-[#003B73]/10"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#B9E7FF] to-[#DFF4FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-[#003B73]" />
                </div>
                <h2 className="text-[#003B73] mb-2">Edit Profile Picture</h2>
                <p className="text-[#003B73]/70">
                  Upload a new profile picture to personalize your account
                </p>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#DFF4FF]/50 to-white border-2 border-[#003B73]/10 rounded-3xl flex items-center justify-center overflow-hidden">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-[#003B73]/40" />
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <div className="mb-6">
                <input
                  type="file"
                  id="edit-profile-picture"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <label
                  htmlFor="edit-profile-picture"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Choose New Picture</span>
                </label>
                <p className="text-[#003B73]/60 text-center mt-2">JPG or PNG, max 5MB</p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowEditPicture(false)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#DFF4FF] to-white border-2 border-[#003B73]/20 text-[#003B73] rounded-2xl hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => setShowEditPicture(false)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Profile Header Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl">{userData.avatar}</span>
                )}
              </div>
              <motion.button
                onClick={() => setShowEditPicture(true)}
                className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-xl flex items-center justify-center shadow-lg border-2 border-white hover:from-[#0056A8] hover:to-[#003B73] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="w-5 h-5 text-white" />
              </motion.button>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white">{userData.level}</span>
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="text-[#003B73] text-3xl font-semibold mb-2">{userData.name}</div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[#003B73]/70 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {userData.joinDate}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-xl shadow-lg">
                  <Target className="w-4 h-4" />
                  <span>{userData.streak} Day Streak</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-xl shadow-lg">
                  <Trophy className="w-4 h-4" />
                  <span>Level {userData.level}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-xl shadow-lg">
                  <Award className="w-4 h-4" />
                  <span>{userData.totalBadges} Badges</span>
                </div>
              </div>
            </div>

            {/* Rank Badge */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl mb-2">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <p className="text-[#003B73] text-lg font-semibold">{userData.rank}</p>
              <p className="text-[#003B73]/60">Global Rank</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#003B73]" />
                <span className="text-[#003B73]">Level {userData.level} Progress</span>
              </div>
              <span className="text-[#003B73]/70">{userData.xp} / {userData.xpToNextLevel} XP</span>
            </div>
            <div className="w-full bg-[#DFF4FF]/50 rounded-full h-4 overflow-hidden border border-[#003B73]/10">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#003B73] to-[#0056A8]"
                initial={{ width: 0 }}
                animate={{ width: `${(userData.xp / userData.xpToNextLevel) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <p className="text-[#003B73]/60 mt-1">{userData.xpToNextLevel - userData.xp} XP to Level {userData.level + 1}</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <motion.button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 rounded-2xl transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white shadow-lg'
                : 'bg-white/80 text-[#003B73] border border-[#003B73]/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Overview
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('performance')}
            className={`flex-1 py-4 rounded-2xl transition-all ${
              activeTab === 'performance'
                ? 'bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white shadow-lg'
                : 'bg-white/80 text-[#003B73] border border-[#003B73]/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Performance
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-4 rounded-2xl transition-all ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white shadow-lg'
                : 'bg-white/80 text-[#003B73] border border-[#003B73]/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Achievements
          </motion.button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <motion.div
                className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-[#003B73]">{userData.totalQuizzes}</h3>
                </div>
                <p className="text-[#003B73]/70">Total Quizzes</p>
              </motion.div>

              <motion.div
                className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-[#003B73]">{userData.averageScore}%</h3>
                </div>
                <p className="text-[#003B73]/70">Average Score</p>
              </motion.div>

              <motion.div
                className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-[#003B73]">{userData.longestStreak}</h3>
                </div>
                <p className="text-[#003B73]/70">Longest Streak</p>
              </motion.div>

              <motion.div
                className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-[#003B73]">{userData.xp}</h3>
                </div>
                <p className="text-[#003B73]/70">Total XP Earned</p>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-[#003B73] mb-6 text-2xl">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#DFF4FF]/30 to-white rounded-2xl border border-[#003B73]/10 hover:shadow-lg transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        activity.type === 'quiz_taken' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                        activity.type === 'quiz_created' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                        'bg-gradient-to-br from-yellow-400 to-yellow-600'
                      }`}>
                        {activity.type === 'quiz_taken' && <Target className="w-6 h-6 text-white" />}
                        {activity.type === 'quiz_created' && <Brain className="w-6 h-6 text-white" />}
                        {activity.type === 'achievement' && <Trophy className="w-6 h-6 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#003B73]">{activity.title}</h3>
                        <div className="flex items-center gap-3 text-[#003B73]/60">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{activity.date}</span>
                          </div>
                          {activity.score && (
                            <span>Score: {activity.score}%</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-xl">
                        <Zap className="w-4 h-4" />
                        <span>+{activity.xp} XP</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div>
                    <p>No recent activity to show.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'performance' && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Summary Stats - Avg and Highest Score */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#003B73]/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[#003B73] text-2xl">Average Score</h3>
                    <p className="text-[#003B73]/60">Across all quizzes</p>
                  </div>
                </div>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-6xl text-[#003B73] mb-2"
                  >
                    {userData.averageScore}%
                  </motion.div>
                  <div className="w-full bg-[#DFF4FF]/50 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${userData.averageScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#003B73]/10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[#003B73] text-2xl">Highest Score</h3>
                    <p className="text-[#003B73]/60">Your best performance</p>
                  </div>
                </div>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="text-6xl text-[#003B73] mb-2"
                  >
                    98%
                  </motion.div>
                  <div className="w-full bg-[#DFF4FF]/50 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: '98%' }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Performance by Category */}
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="w-8 h-8 text-[#003B73]" />
                <h2 className="text-[#003B73]">Performance by Category</h2>
              </div>

              <div className="space-y-6">
                {performanceData.map((item, index) => (
                  <motion.div
                    key={item.category}
                    className="p-6 bg-gradient-to-r from-[#DFF4FF]/30 to-white rounded-2xl border border-[#003B73]/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[#003B73]">{item.category}</h3>
                      <span className="text-[#003B73]/60">{item.quizzes} quizzes</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[#003B73]/60 mb-2">Average Score</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white rounded-full h-3 overflow-hidden border border-[#003B73]/10">
                            <motion.div
                              className="h-full bg-gradient-to-r from-[#003B73] to-[#0056A8]"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.avgScore}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            />
                          </div>
                          <span className="text-[#003B73] min-w-[3rem]">{item.avgScore}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[#003B73]/60 mb-2">Best Score</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white rounded-full h-3 overflow-hidden border border-[#003B73]/10">
                            <motion.div
                              className="h-full bg-gradient-to-r from-green-400 to-green-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.bestScore}%` }}
                              transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                            />
                          </div>
                          <span className="text-[#003B73] min-w-[3rem]">{item.bestScore}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}</div>
            </motion.div>

            {/* Pie Chart - Quiz Distribution */}
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <Target className="w-8 h-8 text-[#003B73]" />
                <h2 className="text-[#003B73]">Quiz Distribution by Category</h2>
              </div>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with detailed info */}
              <div className="grid md:grid-cols-5 gap-4 mt-6">
                {pieChartData.map((item, index) => (
                  <motion.div
                    key={item.name}
                    className="p-4 bg-gradient-to-r from-[#DFF4FF]/30 to-white rounded-2xl border border-[#003B73]/10 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg mx-auto mb-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <h4 className="text-[#003B73]">{item.name}</h4>
                    <p className="text-[#003B73]/60">{item.value} quizzes</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[#003B73]/10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-[#003B73]">{userData.quizzesTaken}</h3>
                <p className="text-[#003B73]/70">Quizzes Taken</p>
              </motion.div>
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[#003B73]/10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-[#003B73]">{userData.quizzesCreated}</h3>
                <p className="text-[#003B73]/70">Quizzes Created</p>
              </motion.div>
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[#003B73]/10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-[#003B73]">{userData.averageScore}%</h3>
                <p className="text-[#003B73]/70">Overall Average</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="w-8 h-8 text-[#003B73]" />
              <div>
                <h2 className="text-[#003B73] text-2xl">Achievements & Badges</h2>
                <p className="text-[#003B73]/60">{achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-white to-[#DFF4FF]/30 border-[#003B73]/20 shadow-lg'
                      : 'bg-white/40 border-[#003B73]/10 opacity-60'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: achievement.unlocked ? 1.05 : 1, y: achievement.unlocked ? -5 : 0 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${achievement.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                    !achievement.unlocked && 'grayscale'
                  }`}>
                    <achievement.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-[#003B73] text-center mb-2">{achievement.title}</h3>
                  <p className="text-[#003B73]/60 text-center">{achievement.description}</p>
                  {achievement.unlocked && (
                    <div className="mt-3 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
