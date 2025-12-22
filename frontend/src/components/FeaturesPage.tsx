import { motion } from 'motion/react';
import { 
  ArrowLeft,
  Bot,
  Brain,
  Zap,
  Target,
  BarChart3,
  Clock,
  Users,
  Shield,
  Globe,
  Sparkles,
  Trophy,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Award
} from 'lucide-react';

interface FeaturesPageProps {
  onBack: () => void;
}

export function FeaturesPage({ onBack }: FeaturesPageProps) {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Quiz Generation',
      description: 'Advanced artificial intelligence analyzes your study material and generates contextually relevant questions in seconds.',
      color: 'from-blue-400 to-blue-600',
      benefits: ['Smart question generation', 'Context-aware content', 'Instant creation']
    },
    {
      icon: Brain,
      title: 'Adaptive Learning',
      description: 'Our intelligent system adapts to your learning pace and style, providing personalized quiz experiences.',
      color: 'from-purple-400 to-purple-600',
      benefits: ['Personalized difficulty', 'Learning pattern analysis', 'Custom recommendations']
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Track your progress with comprehensive analytics and insights into your learning journey.',
      color: 'from-green-400 to-green-600',
      benefits: ['Performance metrics', 'Progress tracking', 'Visual insights']
    },
    {
      icon: Clock,
      title: 'Smart Timing System',
      description: 'Adaptive timers that adjust based on question difficulty and your performance history.',
      color: 'from-orange-400 to-orange-600',
      benefits: ['Flexible time limits', 'Performance-based adjustment', 'Fair assessment']
    },
    {
      icon: Users,
      title: 'Community Learning',
      description: 'Connect with learners worldwide, compete on leaderboards, and share knowledge.',
      color: 'from-pink-400 to-pink-600',
      benefits: ['Global leaderboards', 'Community quizzes', 'Social learning']
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'Earn XP, unlock achievements, maintain streaks, and level up as you learn.',
      color: 'from-yellow-400 to-yellow-600',
      benefits: ['Achievement badges', 'XP rewards', 'Streak tracking']
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We prioritize your privacy and data protection.',
      color: 'from-indigo-400 to-indigo-600',
      benefits: ['Data encryption', 'Privacy first', 'Secure storage']
    },
    {
      icon: Globe,
      title: 'Multi-Platform Access',
      description: 'Access your quizzes from any device, anywhere. Seamless sync across all platforms.',
      color: 'from-cyan-400 to-cyan-600',
      benefits: ['Cross-device sync', 'Mobile responsive', 'Offline access']
    }
  ];

  const capabilities = [
    {
      icon: Lightbulb,
      title: 'Multiple Question Types',
      description: 'Support for multiple choice, true/false, short answer, and mixed format questions.'
    },
    {
      icon: Target,
      title: 'Custom Difficulty Levels',
      description: 'Choose from easy, medium, or hard difficulty levels for each quiz.'
    },
    {
      icon: BookOpen,
      title: 'Material Upload Support',
      description: 'Upload PDFs, documents, and text files to generate quizzes automatically.'
    },
    {
      icon: TrendingUp,
      title: 'Performance Tracking',
      description: 'Monitor your improvement over time with detailed performance metrics.'
    },
    {
      icon: Award,
      title: 'Certification & Badges',
      description: 'Earn certificates and badges as you complete milestones and achievements.'
    },
    {
      icon: Sparkles,
      title: 'AI Recommendations',
      description: 'Get personalized quiz recommendations based on your learning history.'
    }
  ];

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
              <span>Back to Home</span>
            </motion.button>
            <div className="text-[#003B73] text-xl font-semibold">Platform Features</div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="w-16 h-16 text-[#003B73]" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-12 h-12 text-[#003B73]/60" />
            </motion.div>
          </div>
          <h1 className="text-[#003B73] text-5xl md:text-6xl mb-6">
            Powerful Features for Smarter Learning
          </h1>
          <p className="text-[#003B73]/70 text-lg max-w-3xl mx-auto">
            Discover how our AI-powered platform revolutionizes the way you create, take, and master quizzes.
            Built with cutting-edge technology to enhance your learning experience.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="mb-20">
          <h2 className="text-[#003B73] text-3xl text-center mb-12">Core Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-[#003B73]/10 hover:shadow-2xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-[#003B73] mb-2">{feature.title}</h3>
                <p className="text-[#003B73]/70 mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#003B73]/60">
                      <div className="w-1.5 h-1.5 bg-[#003B73] rounded-full" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Capabilities Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-[#003B73] text-3xl text-center mb-12">Additional Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-xl flex items-center justify-center">
                    <capability.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[#003B73] mb-2">{capability.title}</h3>
                  <p className="text-[#003B73]/70">{capability.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-[#003B73] to-[#0056A8] rounded-3xl p-12 shadow-2xl">
            <h2 className="text-white text-3xl mb-4">Ready to Start Learning?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already using our platform to enhance their knowledge and skills.
            </p>
            <motion.button
              onClick={onBack}
              className="px-8 py-4 bg-white text-[#003B73] rounded-2xl shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
