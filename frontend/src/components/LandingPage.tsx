import { motion } from 'motion/react';
import {
  Brain,
  Zap,
  Trophy,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Rocket,
  Star,
  BarChart3,
  Plus,
  PlayCircle,
  X
} from 'lucide-react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Quizzes',
      description: 'Upload your materials and let AI generate personalized quizzes instantly',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: Target,
      title: 'Adaptive Learning',
      description: 'Choose difficulty levels that match your skill and progress at your pace',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'Earn XP, unlock badges, and track your learning streak',
      color: 'from-orange-400 to-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Detailed analytics and performance insights to monitor your growth',
      color: 'from-green-400 to-green-600'
    }
  ];

  const stats = [
    { label: 'Active Learners', value: '10,000+', icon: Users },
    { label: 'Quizzes Created', value: '50,000+', icon: BookOpen },
    { label: 'Success Rate', value: '94%', icon: TrendingUp },
    { label: 'Avg. Improvement', value: '40%', icon: Award }
  ];

  const categories = [
    'Academics',
    'Programming',
    'Aptitude',
    'General Knowledge',
    'Competitive Exams',
    'Computer Science'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DFF4FF] to-[#B9E7FF] overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-[#003B73]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-[#003B73] text-xl font-semibold">QuizAI</h2>
            </motion.div>

            {/* Center Tabs */}
            <motion.div
              className="hidden md:flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 text-[#003B73] hover:bg-[#DFF4FF]/50 rounded-xl transition-all border border-[#003B73]/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>Create Quiz</span>
              </motion.button>

              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 text-[#003B73] hover:bg-[#DFF4FF]/50 rounded-xl transition-all border border-[#003B73]/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayCircle className="w-5 h-5" />
                <span>Take Quiz</span>
              </motion.button>
            </motion.div>

            {/* Auth Buttons */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 text-[#003B73] hover:bg-[#DFF4FF]/50 rounded-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Auth Required Modal */}
      {showAuthModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#003B73]/10 hover:bg-[#003B73]/20 transition-colors"
            >
              <X className="w-5 h-5 text-[#003B73]" />
            </button>

            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-3xl flex items-center justify-center mx-auto mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-[#003B73] text-center mb-4 text-2xl font-semibold">
              <span className="font-bold">Login Required</span>
            </h2>

            <p className="text-[#003B73]/70 text-center mb-8">
              Please sign in or create an account to access quiz creation and quiz-taking features.
            </p>

            <div className="space-y-3">
              <motion.button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/login');
                }}
                className="w-full py-4 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login to Continue
              </motion.button>

              <motion.button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/signup');
                }}
                className="w-full py-4 bg-white border-2 border-[#003B73] text-[#003B73] rounded-2xl shadow-md hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create New Account
              </motion.button>
            </div>

            <div className="mt-6 p-4 bg-[#DFF4FF]/30 rounded-2xl border border-[#003B73]/10">
              <p className="text-[#003B73]/60 text-center">
                Join 10,000+ learners and start your journey today!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#DFF4FF] to-white border border-[#003B73]/20 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-[#003B73]" />
              <span className="text-[#003B73]">AI-Powered Learning Platform</span>
            </motion.div>

            <h1 className="text-[#003B73] mb-6 text-[40px] leading-[1.1] font-bold md:text-[52px]">
              Master Any Subject with
              <span className="block lp-gradient-text">AI-Generated Quizzes</span>
            </h1>

            <p className="text-[#003B73]/70 mb-8 text-lg">
              Transform your learning materials into engaging quizzes. Upload PDFs, documents, or choose from thousands of topics. Track your progress, earn rewards, and achieve your learning goals faster.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <motion.button
                onClick={() => navigate('/signup')}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-5 h-5" />
                <span>Start Learning Free</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-[#003B73] text-[#003B73] rounded-2xl shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Sign In</span>
              </motion.button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[#003B73] font-medium">10,000+ learners</p>
                  <p className="text-[#003B73]/60">Join the community</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative md:justify-self-end md:max-w-xl w-full"
          >
            {/* IMPORTANT: overflow-visible so the icons can go outside */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#003B73]/10 p-8 overflow-visible isolate">
             <div className="lp-float-icon lp-float-tr">
  <motion.div
    className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl"
    animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
    transition={{ duration: 4, repeat: Infinity }}
  >
    <Trophy className="w-12 h-12 text-white" />
  </motion.div>
</div>




              {/* Zap (Bottom Left) */}
             {/* ✅ Zap (Bottom Center) */}
<div className="lp-float-icon lp-float-bc">
  <motion.div
    className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl z-30 pointer-events-none"
    animate={{ rotate: [0, -10, 10, 0], y: [0, 10, 0] }}
    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
  >
    <Zap className="w-12 h-12 text-white" />
  </motion.div>
</div>


              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#DFF4FF]/50 to-white rounded-2xl border border-[#003B73]/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[#003B73] font-semibold">JavaScript Quiz</h4>
                    <p className="text-[#003B73]/60">25 Questions • Medium</p>
                  </div>
                  <div className="ml-auto">
                    <div className="text-[#003B73] font-semibold">92%</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#DFF4FF]/50 to-white rounded-2xl border border-[#003B73]/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[#003B73] font-semibold">React Basics</h4>
                    <p className="text-[#003B73]/60">30 Questions • Easy</p>
                  </div>
                  <div className="ml-auto">
                    <div className="text-[#003B73] font-semibold">98%</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#DFF4FF]/50 to-white rounded-2xl border border-[#003B73]/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[#003B73] font-semibold">Python Advanced</h4>
                    <p className="text-[#003B73]/60">20 Questions • Hard</p>
                  </div>
                  <div className="ml-auto">
                    <div className="text-[#003B73] font-semibold">87%</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10 p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl text-[#003B73] mb-2 font-bold">{stat.value}</div>
                <p className="text-[#003B73]/60">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#DFF4FF] to-white border border-[#003B73]/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#003B73]" />
            <span className="text-[#003B73]">Platform Features</span>
          </div>
          <h2 className="text-[#003B73] mb-4 text-3xl font-bold">Everything You Need to Excel</h2>
          <p className="text-[#003B73]/70 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with proven learning methodologies to help you achieve your learning goals faster
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#003B73]/10 p-8 hover:shadow-xl transition-all group"
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-[#003B73] mb-3 font-semibold">{feature.title}</h3>
                <p className="text-[#003B73]/60">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h2 className="text-[#003B73] mb-4 text-3xl font-bold">Explore Popular Categories</h2>
          <p className="text-[#003B73]/70">Choose from a wide range of topics to start your learning journey</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-3 bg-white/80 backdrop-blur-xl border-2 border-[#003B73]/10 rounded-2xl shadow-md hover:shadow-lg hover:border-[#003B73]/30 transition-all cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <span className="text-[#003B73] font-medium">{category}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden"
        >
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />

          <div className="relative z-10">
            <motion.div
              className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-white mb-4 text-3xl font-bold">Ready to Start Learning?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
              Join thousands of learners who are already improving their skills with AI-powered quizzes
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                onClick={() => navigate('/signup')}
                className="flex items-center gap-2 px-8 py-4 bg-white text-[#003B73] rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-semibold">Create Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-xl border-2 border-white text-white rounded-2xl hover:bg-white/30 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-semibold">Sign In</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003B73]/5 border-t border-[#003B73]/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#003B73] font-semibold">QuizAI Platform</span>
            </div>
            <p className="text-[#003B73]/60 text-center md:text-left">
              © 2026 QuizAI. Empowering learners worldwide with AI-powered education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
