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
  Sparkles,
  AlertCircle,
  KeyRound,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
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
          throw new Error('Please enter your full name or engineer handle.');
        }
        res = await register(name, email, password);
      } else {
        res = await login(email, password);
      }

      if (res.success) {
        toast.success(isRegister ? 'Maker account created!' : 'Signed in successfully!');
        navigate(redirectPath);
      } else {
        setError(res.message || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoType) => {
    if (demoType === 'engineer') {
      setIsRegister(false);
      setEmail('engineer@techloom.store');
      setPassword('password123');
      toast.info('Loaded demo engineer credentials');
    } else {
      setIsRegister(true);
      setName('Hardware Innovator');
      setEmail(`maker.${Math.floor(100 + Math.random() * 900)}@techloom.store`);
      setPassword('password123');
      toast.info('Generated new maker registration credentials');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Ordering Prompt Alert */}
        {isOrderingPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cyan-950/40 border border-cyan-500/40 rounded-2xl p-4 flex items-start gap-3 text-cyan-200"
          >
            <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono space-y-0.5">
              <strong className="text-white block font-display">Authentication Required to Hold Stock</strong>
              <p>Sign in or register below to activate your 5-minute atomic stock reservation window.</p>
            </div>
          </motion.div>
        )}

        {/* Authentication Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0d1527]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6"
        >
          {/* Brand & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Cpu className="w-6 h-6" />
            </div>
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              {isRegister ? 'Join the Hardware Network' : 'Access Silicon Registry'}
            </h1>
            <p className="text-xs font-mono text-slate-400">
              {isRegister
                ? 'Create a maker profile for allocation and order tracking'
                : 'Enter your developer credentials to manage hardware orders'}
            </p>
          </div>

          {/* Quick Demo Autofill Bar */}
          <div className="bg-[#070b14] border border-white/[0.06] rounded-2xl p-2.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold pl-1.5">
              Demo Mode:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('engineer')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
              >
                Lead Engineer
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('new')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
              >
                New Maker
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#070b14] border border-white/[0.06] rounded-xl font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
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
              className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                isRegister
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2.5 text-rose-200 text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1.5">
                  Engineer Name / Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#070b14] border border-white/[0.1] focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="engineer@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/[0.1] focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1.5">
                Passcode / Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/[0.1] focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="glow"
                size="lg"
                disabled={loading}
                isLoading={loading}
                className="w-full font-mono tracking-wider font-bold text-xs py-3.5"
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                {isRegister ? 'CONFIRM REGISTRATION' : 'AUTHENTICATE & ENTER'}
              </Button>
            </div>
          </form>

          {/* Privacy Footnote */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500 text-center pt-2 border-t border-white/[0.06]">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>Encrypted Session &bull; Zero Public Exposure</span>
          </div>

        </motion.div>

      </div>
    </div>
  );
};
