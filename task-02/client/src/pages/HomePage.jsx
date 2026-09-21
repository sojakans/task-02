import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu,
  Layers,
  Activity,
  Tv,
  Bot,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  RefreshCw,
  Zap,
  Sparkles,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { productService } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { HeroScene } from '../components/3d/HeroScene';
import { StaggerGrid, StaggerItem } from '../components/animations/StaggerGrid';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

const CATEGORIES = [
  { label: 'All Catalog', value: 'All', icon: Layers },
  { label: 'Microcontrollers', value: 'Microcontrollers', icon: Cpu },
  { label: 'Sensors', value: 'Sensors', icon: Activity },
  { label: 'Displays', value: 'Displays', icon: Tv },
  { label: 'Robotics', value: 'Robotics', icon: Bot },
];

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSearch, setMobileSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const params = { limit: 8 };
        if (activeCategory !== 'All') {
          params.category = activeCategory;
        }
        const data = await productService.getProducts(params);
        if (data.success) {
          setFeaturedProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(mobileSearch.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden">
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-3 bg-[#0a0f1d]/90 border-b border-white/[0.08] backdrop-blur-xl">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search microcontrollers, sensors..."
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            className="w-full bg-[#070b14] border border-white/[0.1] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/60 font-mono"
          />
        </form>
      </div>

      {/* ============================================================
          HERO SECTION WITH 3D QUANTUM CORE
          ============================================================ */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        {/* Subtle Ambient Light Orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Mission & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* High-Tech Status Pill */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>ATOMIC STOCK RESERVATION ENGINE v2.4</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]"
              >
                Silicon Logistics for{' '}
                <span className="text-gradient-cyan block sm:inline">
                  Hardware Innovators.
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-body"
              >
                Next-generation electronics fulfillment engineered for embedded systems architects, roboticists, and prototype makers. Guaranteed 5-minute inventory hold and idempotency-shielded payments.
              </motion.p>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <Link to="/products">
                  <Button
                    size="lg"
                    variant="primary"
                    iconRight={<ArrowRight className="w-4 h-4" />}
                  >
                    EXPLORE HARDWARE
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button
                    size="lg"
                    variant="secondary"
                    iconLeft={<Terminal className="w-4 h-4 text-cyan-400" />}
                  >
                    LIVE ORDERS
                  </Button>
                </Link>
              </motion.div>

              {/* Live Spec Metrics */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]"
              >
                <div>
                  <div className="font-display text-xl sm:text-2xl font-bold text-white">
                    5:00<span className="text-cyan-400 text-sm">m</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                    Hold Guarantee
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl sm:text-2xl font-bold text-cyan-400">
                    100%
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                    Atomic Locks
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl sm:text-2xl font-bold text-purple-400">
                    Zero
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                    Double-Charge Risk
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Interactive 3D Holographic Core */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <HeroScene />
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          CATEGORY CHIPS SELECTOR BAR
          ============================================================ */}
      <section className="border-y border-white/[0.08] bg-[#090d16]/80 backdrop-blur-xl sticky top-16 z-20 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED INVENTORY CATALOG GRID
          ============================================================ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Stock Matrix</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeCategory === 'All' ? 'Precision Hardware Components' : `${activeCategory} Collection`}
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider group"
            >
              <span>View Entire Inventory</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <StaggerItem key={product._id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          ) : (
            <div className="text-center py-16 bg-[#0a0f1d] border border-white/[0.08] rounded-2xl">
              <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-mono">No hardware components found in this category.</p>
            </div>
          )}

        </div>
      </section>

      {/* ============================================================
          PLATFORM ARCHITECTURE & GUARANTEES
          ============================================================ */}
      <section className="py-16 bg-[#050810] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              Engineered for High-Concurrency
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white mt-1">
              Assessment Architecture Highlights
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every checkout flow, stock reservation, and mock payment is built to emulate production financial logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#0b1222] border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">
                5-Min Hold Window
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stock is locked atomically during checkout. If uncompleted within 300s, automated background cleanup returns inventory immediately.
              </p>
            </div>

            <div className="bg-[#0b1222] border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">
                Idempotency Shield
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every transaction issues an Idempotency-Key header, guaranteeing zero double-charges even on network timeouts or double-clicks.
              </p>
            </div>

            <div className="bg-[#0b1222] border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">
                Atomic Decrements
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct database-level atomic decrements prevent overselling, racing carts, and phantom stock allocations across concurrent makers.
              </p>
            </div>

            <div className="bg-[#0b1222] border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">
                Simulated Refunds
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full order cancellation and refund state machines restore inventory seamlessly and log transactional history with status audit trails.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
