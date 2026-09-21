import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  Cpu,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AnimatedNumber } from '../components/animations/AnimatedNumber';

export const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, resetCartAfterCheckout, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const navigate = useNavigate();

  const items = cart?.items || [];
  const isEmpty = items.length === 0;
  const cartTotal = cart?.total ?? cart?.totalAmount ?? cart?.subtotal ?? 0;
  const totalItemCount = cart?.itemCount || items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const handleStartCheckout = async () => {
    if (isEmpty || checkingOut) return;

    if (!isAuthenticated) {
      navigate('/login?redirect=/cart&prompt=order');
      return;
    }

    try {
      setCheckingOut(true);
      setCheckoutError(null);

      const res = await checkoutService.checkout(cart.cartId, {
        fullName: user?.name || 'Lead Hardware Engineer',
        email: user?.email || 'engineer@techloom.store',
        address: 'Robotics Lab 102, Innovation Quarter',
        city: 'Bangalore',
        postalCode: '560100',
      });

      if (res.success && res.order) {
        await resetCartAfterCheckout();
        navigate(`/checkout/${res.order.orderId}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || 'Failed to initialize checkout. Check inventory availability.';
      setCheckoutError(msg);
      // Refresh cart — the server may have auto-removed stale items
      await refreshCart();
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-spin mb-4">
          <Cpu className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-slate-400">Synchronizing hardware allocation queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Hardware Allocation Queue</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
            Active Cart Matrix ({totalItemCount})
          </h1>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Sourcing</span>
        </Link>
      </div>

      {/* Error Banner */}
      {checkoutError && (
        <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-4 mb-6 flex items-start gap-3 text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-0.5">
            <p className="font-bold text-white">Checkout Allocation Blocked</p>
            <p>{checkoutError}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {isEmpty ? (
        <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-xl text-white">Your Cart Matrix is Empty</h2>
          <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto leading-relaxed">
            No silicon chips or development modules allocated yet. Browse our verified hardware directory to begin.
          </p>
          <div className="pt-2">
            <Link to="/products">
              <Button variant="primary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
                Explore Components
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence>
              {items.map((item, index) => {
                // Safely extract item fields supporting both backend structures
                const productId = item.productId || item.product?._id || item._id || `cart-item-${index}`;
                const name = item.name || item.product?.name || 'Hardware Component';
                const image = item.image || item.product?.image || '';
                const price = Number(item.price ?? item.product?.price ?? 0);
                const quantity = Number(item.quantity ?? 1);
                const availableStock = Number(item.availableStock ?? item.product?.availableStock ?? 99);
                const category = item.category || item.product?.category || 'Silicon Component';
                const itemSubtotal = Number(item.subtotal ?? (price * quantity));

                return (
                  <motion.div
                    key={productId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#0d1527]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center gap-4 min-w-0">
                      <Link
                        to={`/products/${productId}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#070b14] border border-white/[0.08] overflow-hidden shrink-0 block"
                      >
                        <img
                          src={image}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </Link>

                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                          {category}
                        </span>
                        <Link
                          to={`/products/${productId}`}
                          className="font-display font-bold text-sm sm:text-base text-white hover:text-cyan-300 transition-colors line-clamp-1 block"
                        >
                          {name}
                        </Link>
                        <span className="text-xs font-mono text-slate-400 mt-1 block">
                          {formatCurrency(price)} each
                        </span>
                      </div>
                    </div>

                    {/* Right: Quantity Stepper & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                      {/* Stepper */}
                      <div className="flex items-center bg-[#070b14] border border-white/[0.08] rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(productId, quantity - 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-xs text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(productId, quantity + 1)}
                          disabled={quantity >= availableStock}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <span className="font-mono font-bold text-sm sm:text-base text-white">
                          {formatCurrency(itemSubtotal)}
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(productId)}
                        title="Remove component"
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary Rail */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-6 shadow-2xl space-y-4">
              <h2 className="font-display font-bold text-base text-white uppercase tracking-wider border-b border-white/[0.08] pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Items:</span>
                  <span className="text-white font-bold">{totalItemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fulfillment:</span>
                  <span className="text-emerald-400">Complimentary Courier</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reservation Duration:</span>
                  <span className="text-cyan-400">5 Minutes (Guaranteed)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Calculated Total
                  </span>
                  <div className="text-2xl font-black font-mono text-white tracking-tight">
                    <AnimatedNumber
                      value={cartTotal}
                      format={(v) => formatCurrency(v)}
                    />
                  </div>
                </div>
                <Badge variant="primary" size="sm">
                  AUDITED
                </Badge>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                variant="glow"
                className="w-full font-mono tracking-wider font-bold text-sm"
                disabled={checkingOut}
                isLoading={checkingOut}
                onClick={handleStartCheckout}
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                {isAuthenticated ? 'LOCK INVENTORY & CHECKOUT' : 'SIGN IN TO CHECKOUT'}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500 pt-1">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Idempotency-Shielded Transaction</span>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="bg-[#0a0f1d] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed font-mono">
                <strong className="text-white block mb-0.5">Automated Stock Lock:</strong>
                Clicking checkout reserves these items for exactly 300 seconds so no other user can purchase them while you enter payment details.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
