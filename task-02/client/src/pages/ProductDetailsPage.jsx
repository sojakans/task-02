import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu,
  ChevronRight,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Clock,
  Zap,
  Box,
  Eye,
  Layers,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { productService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductViewer } from '../components/3d/ProductViewer';
import { AnimatedNumber } from '../components/animations/AnimatedNumber';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [viewMode, setViewMode] = useState('image'); // 'image' | '3d'

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        if (data.success && data.product) {
          setProduct(data.product);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Product not found or unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const isOutOfStock = !product || product.availableStock <= 0;
  const maxAllowedQuantity = product ? Math.max(1, product.availableStock) : 1;

  const handleIncrement = () => {
    if (quantity < maxAllowedQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) return;

    setAdding(true);
    const res = await addToCart(product._id, quantity);
    setAdding(false);

    if (res.success) {
      toast.success(`Allocated ${quantity} × ${product.name} to cart!`);
    } else {
      toast.error(res.message || 'Stock allocation failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="h-80 bg-slate-800/50 rounded-2xl border border-white/10" />
          <div className="space-y-4">
            <div className="h-4 w-28 bg-slate-800 rounded" />
            <div className="h-8 w-3/4 bg-slate-800 rounded" />
            <div className="h-20 bg-slate-800/40 rounded-xl" />
            <div className="h-12 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white">Component Registry Error</h2>
          <p className="text-xs font-mono text-slate-400 mt-2 mb-6">
            {error || 'The requested silicon item could not be resolved from current inventory records.'}
          </p>
          <Link to="/products">
            <Button variant="primary" iconLeft={<ArrowLeft className="w-4 h-4" />}>
              Return to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = (product.price * quantity);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-cyan-400 transition-colors">HOME</Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <Link to="/products" className="hover:text-cyan-400 transition-colors">CATALOG</Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-cyan-400 transition-colors">
          {product.category.toUpperCase()}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-200 font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Media Stage (Image or 3D Interactive Model) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#090d16] border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/50">
            {viewMode === 'image' ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-radial from-cyan-950/20 to-[#070b14]">
                <ProductViewer category={product.category} />
              </div>
            )}

            {/* Mode Switcher Toggle: 2D Image vs 3D Inspector */}
            <div className="absolute top-3 right-3 z-10 flex items-center bg-black/60 backdrop-blur-md rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setViewMode('image')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  viewMode === 'image'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Photo</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  viewMode === '3d'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3 h-3" />
                <span>3D Model</span>
              </button>
            </div>

            {/* SKU Badge */}
            {product.sku && (
              <div className="absolute bottom-3 left-3 z-10 bg-black/70 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-mono px-2.5 py-1 rounded-lg">
                SKU: <span className="text-cyan-400 font-bold">{product.sku}</span>
              </div>
            )}
          </div>

          {/* Logistics Guarantee Card */}
          <div className="bg-[#0b1222] border border-white/[0.08] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                  5-Minute Atomic Hold
                </p>
                <p className="text-[11px] text-slate-400">
                  Stock locks immediately once you initiate checkout.
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm" dot pulse>
              Live Sync
            </Badge>
          </div>

        </div>

        {/* Right Column: Information, Pricing & Cart Action */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                {product.category}
              </span>
              <StatusBadge status={product.availableStock} type="stock" />
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing Panel */}
          <div className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Unit Specification Price
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                  {formatCurrency(product.price)}
                </div>
              </div>
              {quantity > 1 && (
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Calculated Subtotal ({quantity}x)
                  </span>
                  <div className="text-xl font-bold font-mono text-cyan-400">
                    <AnimatedNumber value={subtotal} format={(val) => formatCurrency(val)} />
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Controller & Add to Cart */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center justify-between sm:justify-start bg-[#070b14] border border-white/[0.08] rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-mono font-bold text-sm text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= maxAllowedQuantity || isOutOfStock}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <Button
                variant={isOutOfStock ? 'ghost' : 'glow'}
                size="lg"
                disabled={isOutOfStock || adding}
                isLoading={adding}
                onClick={handleAddToCart}
                className="flex-1 text-sm font-mono tracking-wider font-bold"
                iconLeft={<ShoppingBag className="w-4 h-4" />}
              >
                {isOutOfStock ? 'OUT OF STOCK' : `ADD TO CART — ${formatCurrency(subtotal)}`}
              </Button>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Component Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                {product.description}
              </p>
            </div>
          )}

          {/* Technical Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Hardware Specifications Datasheet
                </h3>
              </div>
              <div className="bg-[#090d16] border border-white/[0.08] rounded-xl overflow-hidden font-mono text-xs">
                {Object.entries(product.specifications).map(([key, val], idx) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-4 py-2.5 ${
                      idx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                    } border-b border-white/[0.04] last:border-0`}
                  >
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="text-cyan-300 font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
