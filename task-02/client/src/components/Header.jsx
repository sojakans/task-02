import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Search,
  ShoppingBag,
  User,
  LogOut,
  RefreshCw,
  Menu,
  X,
  ChevronLeft,
  Terminal,
  Layers,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { seedService } from '../services/api';
import { CartPulseBadge } from './animations/FlyToCart';

const CATEGORIES = ['Microcontrollers', 'Sensors', 'Displays', 'Robotics'];

export const Header = () => {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [reseedLoading, setReseedLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
    setMobileMenuOpen(false);
  };

  const handleReseed = async () => {
    if (window.confirm('Reset and re-seed database with fresh hardware inventory?')) {
      try {
        setReseedLoading(true);
        await seedService.reseed();
        toast.success('Inventory re-seeded with factory specifications!');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        toast.error('Failed to reseed database: ' + err.message);
      } finally {
        setReseedLoading(false);
        setMobileMenuOpen(false);
      }
    }
  };

  const pathname = location.pathname;
  let mobileTitle = null;
  let showBack = false;

  if (pathname.startsWith('/products/')) {
    mobileTitle = 'Component Specs';
    showBack = true;
  } else if (pathname.startsWith('/checkout/')) {
    mobileTitle = 'Secure Checkout';
    showBack = true;
  } else if (pathname.startsWith('/payment/')) {
    mobileTitle = 'Payment Gateway';
    showBack = true;
  } else if (pathname.startsWith('/orders/')) {
    mobileTitle = 'Telemetry & Logistics';
    showBack = true;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070b14]/80 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="md:hidden p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] transition-all">
                <Cpu className="w-5 h-5 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                  TECH<span className="text-cyan-400">LOOM</span>
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-mono font-semibold -mt-1">
                  Silicon Logistics
                </span>
              </div>
            </Link>

            {/* Desktop Categories Navigation */}
            <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-white/[0.08]">
              <Link
                to="/products"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide font-mono transition-all ${
                  pathname === '/products' && !location.search.includes('category=')
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                ALL HARDWARE
              </Link>
              {CATEGORIES.map((cat) => {
                const isActive = location.search.includes(`category=${encodeURIComponent(cat)}`);
                return (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide font-mono transition-all ${
                      isActive
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Middle: Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xs xl:max-w-sm relative items-center"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search components, specs, SKUs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b1222]/90 border border-white/[0.08] hover:border-white/20 focus:border-cyan-500/60 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Re-seed Database Action */}
            <button
              onClick={handleReseed}
              disabled={reseedLoading}
              title="Reset inventory to factory specs"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-cyan-400 bg-slate-900/60 hover:bg-cyan-500/10 border border-white/[0.06] hover:border-cyan-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reseedLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden xl:inline">Reset Stock</span>
            </button>

            {/* Orders History Link */}
            <Link
              to="/orders"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                pathname === '/orders'
                  ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Orders</span>
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center p-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-all shadow-sm"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <CartPulseBadge count={itemCount} />
            </Link>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-1">
                <span className="hidden md:inline-block text-xs font-mono text-slate-400 truncate max-w-[100px]">
                  {user?.name || user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono tracking-wider text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              >
                <User className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a0f1d] border-b border-white/[0.1] px-4 py-4 space-y-3 overflow-hidden"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search components, specs, SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070b14] border border-white/[0.1] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/60 font-mono"
              />
            </form>

            <div className="pt-2">
              <p className="text-[11px] font-mono uppercase text-slate-500 font-bold px-2 mb-1.5">
                Hardware Categories
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-mono font-medium text-slate-300 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08]"
                >
                  All Inventory
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-xs font-mono font-medium text-slate-300 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08]"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={handleReseed}
                disabled={reseedLoading}
                className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 px-2 py-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reseedLoading ? 'animate-spin' : ''}`} />
                <span>Reset Demo Stock</span>
              </button>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-mono text-cyan-400 px-2 py-1.5"
              >
                Order History &rarr;
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
