import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Bot, Sparkles, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';


export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authAPI.login(username, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DFF4FF] to-[#B9E7FF] relative overflow-hidden">
      {/* Decorative geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 bg-[#003B73]/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#B9E7FF]/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/40 rounded-full blur-2xl"
          animate={{ 
            y: [0, -30, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      {/* Abstract floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
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
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo/Icon Section */}
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-[#B9E7FF] to-white rounded-3xl shadow-lg border border-[#003B73]/10 relative"
              animate={{ 
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Bot className="w-12 h-12 text-[#003B73]" />
              {/* Robot eyes */}
              <div className="absolute top-6 left-6 flex gap-2">
                <motion.div 
                  className="w-2 h-2 bg-[#003B73] rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="w-2 h-2 bg-[#003B73] rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
              </div>
              {/* Robot smile */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-6 h-2 border-b-2 border-[#003B73] rounded-full" />
              
              <motion.div
                className="absolute"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-[#003B73]/40 absolute -top-2 -right-2" />
              </motion.div>
            </motion.div>
            <h1 className="text-[#003B73] mb-2 text-3xl font-semibold">Welcome Back!</h1>
            <p className="text-[#003B73]/60">Continue your learning journey</p>
          </div>

          {/* Login Form Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-8"
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 59, 115, 0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-[#003B73] mb-2">Username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40" />
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

              {/* Password Input */}
              <div>
                <label className="block text-[#003B73] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003B73]/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-gradient-to-r from-[#DFF4FF]/50 to-white border border-[#003B73]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]/30 transition-all"
                    placeholder="Enter your password"
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

              {/* Forgot Password Link */}
              <div className="text-right">
                <button type="button" className="text-[#003B73] hover:text-[#003B73]/70 transition-colors">
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-[#003B73]/60">
                Don&apos;t have an account?{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-[#003B73] hover:text-[#003B73]/70 transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </motion.div>

          {/* Additional decorative element */}
          <motion.div 
            className="mt-6 text-center text-[#003B73]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>Powered by AI Intelligence</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
