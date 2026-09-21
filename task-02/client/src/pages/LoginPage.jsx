import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';
  const isOrderingPrompt =
    searchParams.get('prompt') === 'order' ||
    redirectPath.includes('checkout') ||
    redirectPath.includes('cart');

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        res = await register(name, email, password);
      } else {
        res = await login(email, password);
      }

      if (res.success) {
        toast.success(isRegister ? 'Account created successfully!' : 'Welcome back!');
        navigate(redirectPath);
      } else {
        setError(res.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoType) => {
    if (demoType === 'login') {
      setIsRegister(false);
      setEmail('engineer@techloom.store');
      setPassword('password123');
      toast.info('Demo login credentials loaded');
    } else {
      setIsRegister(true);
      setName('Demo User');
      setEmail(`user.${Math.floor(100 + Math.random() * 900)}@techloom.store`);
      setPassword('password123');
      toast.info('Demo registration credentials loaded');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Animated gradient background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/[0.07] rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/[0.07] rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/[0.04] rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-md space-y-5 relative z-10">
        
        {/* Ordering Prompt Alert */}
        {isOrderingPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cyan-950/40 border border-cyan-500/30 rounded-2xl p-4 flex items-start gap-3 text-cyan-200"
          >
            <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-sm space-y-0.5">
              <strong className="text-white block font-display text-sm">Sign in to continue</strong>
              <p className="text-xs text-cyan-200/80">Please sign in or create an account to complete your order.</p>
            </div>
          </motion.div>
        )}

        {/* Authentication Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-[#0d1527]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 space-y-7"
        >
          {/* Brand & Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-sm text-slate-400 mt-1.5">
                {isRegister
                  ? 'Join TechLoom to start ordering hardware components'
                  : 'Sign in to your TechLoom account'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#070b14] border border-white/[0.06] rounded-xl text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                isRegister
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-200 text-sm"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#070b14] border border-white/[0.1] focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/[0.1] focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/[0.1] focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                variant="glow"
                size="lg"
                disabled={loading}
                isLoading={loading}
                className="w-full font-semibold tracking-wide text-sm py-3.5"
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                {isRegister ? 'Create Account' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Demo Quick Fill */}
          <div className="border-t border-white/[0.06] pt-5">
            <p className="text-xs text-slate-500 text-center mb-3">
              Try it out with demo credentials
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('login')}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 hover:border-cyan-500/40 transition-all cursor-pointer text-center"
              >
                Demo Sign In
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('register')}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 hover:border-purple-500/40 transition-all cursor-pointer text-center"
              >
                Demo Register
              </button>
            </div>
          </div>

          {/* Privacy Footnote */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 text-center pt-1">
            <ShieldCheck className="w-3 h-3 text-cyan-500/60" />
            <span>Secure, encrypted connection</span>
          </div>

        </motion.div>

      </div>
    </div>
  );
};
