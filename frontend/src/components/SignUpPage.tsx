import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, Brain, BookOpen, Sparkles, Eye, EyeOff, Upload } from 'lucide-react';
import { authAPI } from '../services/api';

interface SignUpPageProps {
  onSignUp: () => void;
}

export function SignUpPage({ onSignUp }: SignUpPageProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.register(username, email, password, confirmPassword);
      onSignUp(); // Update auth state in App
      navigate('/'); // Navigate to home
    } catch (err: any) {
      const errorMsg = err.message;
      try {
        const errorObj = JSON.parse(errorMsg);
        const errorMessages = Object.entries(errorObj)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errorMessages);
      } catch {
        setError(errorMsg || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DFF4FF] to-[#B9E7FF] relative overflow-hidden">
      {/* Decorative geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 right-10 w-64 h-64 bg-[#003B73]/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-96 h-96 bg-[#B9E7FF]/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#003B73]/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12">
        <motion.div 
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo/Icon Section */}
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center justify-center gap-3 mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#B9E7FF] to-white rounded-3xl shadow-lg border border-[#003B73]/10 flex items-center justify-center relative">
                  <Brain className="w-10 h-10 text-[#003B73]" />
                  {/* Brain pulse */}
                  <motion.div
                    className="absolute inset-0 bg-[#003B73]/20 rounded-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {/* Eyes */}
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#003B73] rounded-full" />
                    <div className="w-1.5 h-1.5 bg-[#003B73] rounded-full" />
                  </div>
                </div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <BookOpen className="w-6 h-6 text-[#003B73]/60" />
                </motion.div>
              </div>
              
              {/* Smiley Robot */}
              <motion.div
                className="relative"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg flex items-center justify-center relative">
                  <span className="text-2xl">🤖</span>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="w-8 h-8 text-[#003B73]/40" />
              </motion.div>
            </motion.div>
            <h1 className="text-[#003B73] mb-2 text-3xl font-semibold">Join the Learning Revolution</h1>
            <p className="text-[#003B73]/60">Create your account and start your journey</p>
          </div>

          {/* Sign Up Form Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-8"
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 59, 115, 0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-[#003B73] mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-r from-[#DFF4FF]/50 to-white border border-[#003B73]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]/30 transition-all"
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[#003B73] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-r from-[#DFF4FF]/50 to-white border border-[#003B73]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]/30 transition-all"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Inputs in Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#003B73] mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gradient-to-r from-[#DFF4FF]/50 to-white border border-[#003B73]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]/30 transition-all"
                      placeholder="Password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#003B73]/40 hover:text-[#003B73] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#003B73] mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gradient-to-r from-[#DFF4FF]/50 to-white border border-[#003B73]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]/30 transition-all"
                      placeholder="Confirm"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#003B73]/40 hover:text-[#003B73] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-[#DFF4FF]/30 rounded-2xl border border-[#003B73]/10">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#003B73] rounded"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="text-[#003B73]/80 cursor-pointer">
                  I agree to the Terms & Conditions and Privacy Policy
                </label>
              </div>

              {/* Create Account Button */}
              <motion.button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                disabled={!agreeTerms || isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-[#003B73]/60">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#003B73] hover:text-[#003B73]/70 transition-colors"
                >
                  Login
                </button>
              </p>
            </div>
          </motion.div>

          {/* Illustration text */}
          <motion.div 
            className="mt-6 text-center text-[#003B73]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>Start your AI-powered learning adventure</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
