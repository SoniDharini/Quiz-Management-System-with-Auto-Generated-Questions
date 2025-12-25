import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Brain, 
  PenSquare, 
  Target, 
  Flame, 
  Trophy, 
  Zap, 
  Settings, 
  LogOut, 
  User,
  Sparkles,
  ChevronDown,
  Award,
  TrendingUp,
  Smile,
  BookOpen,
  BarChart3,
  Clock,
  Users,
  Lightbulb,
  Rocket,
  History,
  X,
} from 'lucide-react';
import { loadQuizState, QuizState, clearQuizState } from '../lib/quizPersistence';

interface HomePageProps {
  onLogout: () => void;
  onNavigateToProfile: () => void;
  onNavigateToCreateQuiz: () => void;
  onNavigateToFeatures: () => void;
  onNavigateToTakeQuiz: (quizId?: number) => void;
}

export function HomePage({ onLogout, onNavigateToProfile, onNavigateToCreateQuiz, onNavigateToFeatures, onNavigateToTakeQuiz }: HomePageProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [streak, setStreak] = useState(7);
  const [xp, setXp] = useState(2450);
  const [level, setLevel] = useState(8);
  const [ongoingQuiz, setOngoingQuiz] = useState<QuizState | null>(null);

  const [showDismissConfirm, setShowDismissConfirm] = useState(false);

  useEffect(() => {
    // Check for an ongoing quiz when the homepage loads
    const savedQuiz = loadQuizState();
    if (savedQuiz) {
      setOngoingQuiz(savedQuiz);
    }
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setShowProfileMenu(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleDismissQuiz = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDismissConfirm(true);
  };

  const confirmDismiss = () => {
    clearQuizState();
    setOngoingQuiz(null);
    setShowDismissConfirm(false);
  };

  const cancelDismiss = () => {
    setShowDismissConfirm(false);
  };

  const handleTakeQuizClick = () => {
    if (ongoingQuiz) {
      alert('You have an ongoing quiz. Please complete it before starting a new one.');
    } else {
      onNavigateToTakeQuiz();
    }
  };

  const handleCreateQuizClick = () => {
    if (ongoingQuiz) {
      alert('You have an ongoing quiz. Please complete it before starting a new one.');
    } else {
      onNavigateToCreateQuiz();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DFF4FF] to-[#B9E7FF]">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-[#003B73]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-[#B9E7FF] to-[#003B73] rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <div className="text-[#003B73] text-xl font-semibold">QuizAI</div>
                <p className="text-[#003B73]/60 text-sm">Learning Platform</p>
              </div>
            </div>

            {/* Center Actions */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                onClick={handleCreateQuizClick}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <PenSquare className="w-5 h-5" />
                <span>Create Quiz</span>
              </motion.button>
              
              <motion.button
                onClick={handleTakeQuizClick}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#003B73] text-[#003B73] rounded-2xl shadow-md hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="w-5 h-5" />
                <span>Take Quiz</span>
              </motion.button>

              {/* Streak Indicator */}
              <motion.div 
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  boxShadow: [
                    "0 10px 25px -5px rgba(251, 146, 60, 0.4)",
                    "0 10px 25px -5px rgba(251, 146, 60, 0.6)",
                    "0 10px 25px -5px rgba(251, 146, 60, 0.4)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-5 h-5" />
                <span>{streak} Day Streak</span>
              </motion.div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-md border border-[#003B73]/10 hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <ChevronDown className={`w-4 h-4 text-[#003B73] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </motion.button>

              {showProfileMenu && (
                <motion.div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#003B73]/10 overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <button 
                    onClick={onNavigateToProfile}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#DFF4FF]/50 transition-colors text-[#003B73]"
                  >
                    <User className="w-5 h-5" />
                    <span>View Profile</span>
                  </button>
                  <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#DFF4FF]/50 transition-colors text-[#003B73]">
                    <Flame className="w-5 h-5" />
                    <span>Streak Details</span>
                  </button>
                  <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#DFF4FF]/50 transition-colors text-[#003B73]">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-[#003B73]/10" />
                  <button 
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated Icons around hero */}
            <div className="relative inline-block mb-8">
              {/* Center Robot with Brain */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    y: [0, -8, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                  {/* Robot eyes */}
                  <div className="absolute top-6 left-6 flex gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-16 h-16 text-[#003B73]" />
                </motion.div>

                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: [0, -10, 10, 0],
                    y: [0, -8, 0]
                  }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-[#B9E7FF] to-[#DFF4FF] rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white">
                    <Brain className="w-12 h-12 text-[#003B73]" />
                  </div>
                  {/* Brain pulse effect */}
                  <motion.div
                    className="absolute inset-0 bg-[#003B73]/20 rounded-3xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>

              {/* Floating smiley emojis */}
              <motion.div
                className="absolute -left-20 top-0"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <Smile className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-20 top-10"
                animate={{ 
                  y: [0, -12, 0],
                  rotate: [0, -15, 15, 0]
                }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <motion.div
                className="absolute left-1/2 -translate-x-1/2 -top-8"
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              {/* Tech theme floating elements */}
              <motion.div
                className="absolute -left-32 top-20"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-10 h-10 border-2 border-[#003B73]/30 rounded-lg" />
              </motion.div>

              <motion.div
                className="absolute -right-28 bottom-0"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -360]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-8 h-8 border-2 border-[#B9E7FF] rounded-full" />
              </motion.div>
            </div>
            
            <h1 className="text-[#003B73] mb-4 text-[40px] font-bold">
              Learn Smart. Test Faster. Improve Every Day.
            </h1>
            
            {/* Importance Statement */}
            <div className="max-w-3xl mx-auto mb-6">
              <motion.div 
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#DFF4FF] via-white to-[#B9E7FF] rounded-full shadow-lg border-2 border-[#003B73]/10"
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    "0 10px 30px -10px rgba(0, 59, 115, 0.2)",
                    "0 10px 30px -10px rgba(0, 59, 115, 0.4)",
                    "0 10px 30px -10px rgba(0, 59, 115, 0.2)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Lightbulb className="w-6 h-6 text-[#003B73]" />
                <p className="text-[#003B73]">
                  <span className="font-semibold">Transform Learning into Achievement:</span> AI-powered quizzes that adapt to your pace
                </p>
              </motion.div>
            </div>

            <p className="text-[#003B73]/70 max-w-2xl mx-auto mb-8">
              Experience the future of learning with intelligent quizzes designed by AI. 
              Track your progress, build streaks, and unlock achievements as you master new skills.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <motion.button
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-full shadow-lg hover:shadow-2xl transition-all"
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-5 h-5" />
                <span>Get Started Now</span>
              </motion.button>
              
              <motion.button
                onClick={onNavigateToFeatures}
                className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-[#003B73] text-[#003B73] rounded-full shadow-md hover:shadow-lg transition-all"
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="w-5 h-5" />
                <span>Explore Features</span>
              </motion.button>
            </div>

            {/* Tech Grid Pattern */}
            <div className="relative max-w-4xl mx-auto mb-8">
              <div className="grid grid-cols-5 gap-2 opacity-20">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-1 bg-[#003B73] rounded-full"
                    animate={{ 
                      scaleX: [0.5, 1, 0.5],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.1 
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activities Section */}
        {ongoingQuiz && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-12">
              <motion.div
                className="inline-flex items-center gap-2 mb-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <History className="w-8 h-8 text-[#003B73]" />
                <h2 className="text-[#003B73]">Recent Activities</h2>
              </motion.div>
              <p className="text-[#003B73]/70 max-w-2xl mx-auto">
                You have a quiz in progress. Resume where you left off!
              </p>
            </div>

            <motion.div
              className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-400 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden max-w-2xl mx-auto"
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-[#003B73] mb-2">Quiz Paused</h3>
                  <p className="text-[#003B73]/70">
                    You have an ongoing quiz. Click here to resume.
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => onNavigateToTakeQuiz(ongoingQuiz.quizId)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Zap className="w-5 h-5" />
                    <span>Resume Quiz</span>
                  </motion.button>
                  <motion.button
                    onClick={(e) => handleDismissQuiz(e)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 to-red-600 text-white rounded-2xl shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <X className="w-5 h-5" />
                    <span>Dismiss</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      {/* Dismiss Confirmation Modal */}
      {showDismissConfirm && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={cancelDismiss}
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
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-[#003B73] mb-2">Confirm Dismiss</h2>
                <p className="text-[#003B73]/70">
                  Are you sure you want to dismiss this quiz? Your progress will be lost.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={cancelDismiss}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#DFF4FF] to-white border-2 border-[#003B73]/20 text-[#003B73] rounded-2xl hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDismiss}
                  className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Yes, Dismiss
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}

        {/* Tools & Features Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Zap className="w-8 h-8 text-[#003B73]" />
              <h2 className="text-[#003B73]">Powerful Tools at Your Fingertips</h2>
            </motion.div>
            <p className="text-[#003B73]/70 max-w-2xl mx-auto">
              Everything you need to create, take, and master quizzes with AI assistance
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Tool Card 1 */}
            <motion.div
              className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10 hover:shadow-xl transition-all"
              whileHover={{ y: -5, scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <PenSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-[#003B73] text-center mb-2">AI Quiz Creator</h3>
              <p className="text-[#003B73]/60 text-center">
                Generate custom quizzes instantly with AI
              </p>
            </motion.div>

            {/* Tool Card 2 */}
            <motion.div
              className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10 hover:shadow-xl transition-all"
              whileHover={{ y: -5, scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-[#003B73] text-center mb-2">Progress Analytics</h3>
              <p className="text-[#003B73]/60 text-center">
                Track performance with detailed insights
              </p>
            </motion.div>

            {/* Tool Card 3 */}
            <motion.div
              className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10 hover:shadow-xl transition-all"
              whileHover={{ y: -5, scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-[#003B73] text-center mb-2">Smart Timing</h3>
              <p className="text-[#003B73]/60 text-center">
                Adaptive timers that match your pace
              </p>
            </motion.div>

            {/* Tool Card 4 */}
            <motion.div
              className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10 hover:shadow-xl transition-all"
              whileHover={{ y: -5, scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-[#003B73] text-center mb-2">Community</h3>
              <p className="text-[#003B73]/60 text-center">
                Compete and collaborate with learners
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Create Quiz Card */}
          <motion.div
            onClick={onNavigateToCreateQuiz}
            className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#003B73]/10 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
            whileHover={{ y: -8, scale: 1.02 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#003B73]/5 to-[#B9E7FF]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Floating Robot Icon */}
            <motion.div
              className="absolute top-4 right-4"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            
            <div className="relative z-10">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-3xl flex items-center justify-center mb-6 shadow-lg relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <PenSquare className="w-10 h-10 text-white" />
                {/* Smiley face overlay */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                </div>
              </motion.div>
              
              <h2 className="text-[#003B73] mb-3">Create a Quiz</h2>
              <p className="text-[#003B73]/70 mb-6">
                Design custom quizzes powered by AI. Choose your topics, difficulty, and question types.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-[#DFF4FF] text-[#003B73] rounded-xl border border-[#003B73]/10 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  AI-Powered
                </span>
                <span className="px-3 py-1.5 bg-[#DFF4FF] text-[#003B73] rounded-xl border border-[#003B73]/10 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Custom Topics
                </span>
                <span className="px-3 py-1.5 bg-[#DFF4FF] text-[#003B73] rounded-xl border border-[#003B73]/10 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Instant Generation
                </span>
              </div>
            </div>

            {/* Decorative element */}
            <motion.div
              className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#003B73]/5 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Take Quiz Card */}
          <motion.div
            onClick={handleTakeQuizClick}
            className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#003B73]/10 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
            whileHover={{ y: -8, scale: 1.02 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#B9E7FF]/20 to-[#003B73]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Floating Brain Icon */}
            <motion.div
              className="absolute top-4 right-4"
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#B9E7FF] to-[#DFF4FF] rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                <Brain className="w-6 h-6 text-[#003B73]" />
              </div>
            </motion.div>
            
            <div className="relative z-10">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-[#B9E7FF] to-[#003B73]/20 rounded-3xl flex items-center justify-center mb-6 shadow-lg border-2 border-[#003B73]/20 relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Target className="w-10 h-10 text-[#003B73]" />
                {/* Smiley face overlay */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#003B73]/60 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-[#003B73]/60 rounded-full" />
                </div>
              </motion.div>
              
              <h2 className="text-[#003B73] mb-3">Take a Quiz</h2>
              <p className="text-[#003B73]/70 mb-6">
                Challenge yourself with quizzes from various topics. Track your progress and earn rewards.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-[#DFF4FF] text-[#003B73] rounded-xl border border-[#003B73]/10 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Track Progress
                </span>
                <span className="px-3 py-1.5 bg-[#DFF4FF] text-[#003B73] rounded-xl border border-[#003B73]/10 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Earn XP
                </span>
                <span className="px-3 py-1.5 bg-[#DFF4FF] text-[#003B73] rounded-xl border border-[#003B73]/10 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  Leaderboards
                </span>
              </div>
            </div>

            {/* Decorative element */}
            <motion.div
              className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#B9E7FF]/30 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
          </motion.div>
        </div>

        {/* Progress Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-[#003B73]/10 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-[#003B73] mb-8">Your Progress</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* XP Card */}
            <motion.div 
              className="p-6 bg-gradient-to-br from-[#DFF4FF] to-white rounded-2xl border border-[#003B73]/10"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[#003B73]/60">Experience Points</p>
                  <h3 className="text-[#003B73]">{xp.toLocaleString()} XP</h3>
                </div>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-[#003B73]/10">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#003B73] to-[#0056A8]"
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </div>
              <p className="text-[#003B73]/60 mt-2">Level {level} - 550 XP to next level</p>
            </motion.div>

            {/* Streak Card */}
            <motion.div 
              className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-200"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-orange-700/60">Current Streak</p>
                  <h3 className="text-orange-700">{streak} Days</h3>
                </div>
              </div>
              <p className="text-orange-700/70">
                Keep it up! You&apos;re on fire
              </p>
              <p className="text-orange-700/60 mt-2">Longest streak: 12 days</p>
            </motion.div>

            {/* Achievements Card */}
            <motion.div 
              className="p-6 bg-gradient-to-br from-yellow-50 to-white rounded-2xl border border-yellow-200"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-yellow-700/60">Achievements</p>
                  <h3 className="text-yellow-700">12 Badges</h3>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center justify-center text-[#003B73]/60">
                  +9
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gradient-to-r from-[#DFF4FF] to-[#B9E7FF] border-t border-[#003B73]/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-[#003B73]" />
              <p className="text-[#003B73]/70">© 2025 QuizAI. Powered by AI Intelligence.</p>
            </div>
            <div className="flex gap-6 text-[#003B73]/70">
              <button className="hover:text-[#003B73] transition-colors">About</button>
              <button className="hover:text-[#003B73] transition-colors">Privacy</button>
              <button className="hover:text-[#003B73] transition-colors">Terms</button>
              <button className="hover:text-[#003B73] transition-colors">Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}