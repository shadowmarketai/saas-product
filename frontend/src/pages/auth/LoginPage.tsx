import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { DashboardBackground } from '@/components/three/DashboardBackground';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4 relative transition-colors', isDark ? 'bg-[#0B0F19]' : 'bg-[#F9FAFB]')}>
      <DashboardBackground />

      {/* Theme toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md relative z-10">
        <div className={cn(
          'rounded-3xl p-8 border backdrop-blur-xl transition-colors',
          isDark ? 'bg-gray-900/70 border-gray-800 shadow-2xl shadow-black/20' : 'bg-white/80 border-white/50 shadow-2xl shadow-gray-200/50'
        )}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/25 mx-auto mb-4">
              N
            </div>
            <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted mt-1 text-sm">Sign in to your NexaStack account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-body mb-1.5">Email</label>
              <input
                type="email"
                data-testid="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none',
                  isDark ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-body mb-1.5">Password</label>
              <input
                type="password"
                data-testid="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none',
                  isDark ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                )}
              />
            </div>

            {error && <p data-testid="login-error" className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-500/10 rounded-lg py-2">{error}</p>}

            <button
              type="submit"
              data-testid="login-button"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-indigo-500 font-medium hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
