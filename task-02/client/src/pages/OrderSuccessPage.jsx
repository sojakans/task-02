import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Cpu,
  ReceiptText,
  ArrowRight,
} from 'lucide-react';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { SuccessConfetti } from '../components/3d/SuccessConfetti';
import { CheckoutStepper } from '../components/CheckoutStepper';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Error fetching order for success page:', err);
        setError('Unable to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-spin mb-4">
          <Cpu className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-slate-400">Confirming order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-8 shadow-2xl space-y-4">
          <h2 className="font-display font-bold text-xl text-white">Order Record Not Found</h2>
          <Link to="/orders">
            <Button variant="primary" size="md">
              Check Order History
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
      {/* 3D Confetti Particle Explosion */}
      <SuccessConfetti duration={4500} />

      {/* Stepper */}
      <CheckoutStepper currentStep={4} />

      {/* Main Success Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0d1527]/90 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(16,185,129,0.15)] text-center space-y-6 relative overflow-hidden"
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-24 bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Large Glowing Checkmark Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <Badge variant="success" size="sm" dot>
            SETTLEMENT VERIFIED
          </Badge>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Order Dispatched to Warehouse
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-md mx-auto">
            Your payment was processed successfully. Inventory is confirmed and your items are being prepared for dispatch.
          </p>
        </div>

        {/* Specs & Receipt Matrix */}
        <div className="bg-[#070b14]/90 border border-white/[0.08] rounded-2xl p-5 text-left font-mono text-xs space-y-2.5">
          <div className="flex justify-between items-center text-slate-400 border-b border-white/[0.06] pb-2">
            <span>Order Reference:</span>
            <span className="text-cyan-400 font-bold">#{order.orderId}</span>
          </div>

          {order.paymentId && (
            <div className="flex justify-between items-center text-slate-400 border-b border-white/[0.06] pb-2">
              <span>Payment Gateway Ref:</span>
              <span className="text-purple-400 font-bold">{order.paymentId}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-400 border-b border-white/[0.06] pb-2">
            <span>Timestamp:</span>
            <span className="text-slate-200">{formatDate(order.createdAt)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400 border-b border-white/[0.06] pb-2">
            <span>Allocated Units:</span>
            <span className="text-slate-200">{order.items?.length || 0} items</span>
          </div>

          <div className="flex justify-between items-baseline pt-1 text-sm">
            <span className="font-bold text-white">Settled Total:</span>
            <span className="font-black text-xl text-emerald-400">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Link to={`/orders/${order.orderId}`}>
            <Button
              variant="primary"
              size="md"
              className="w-full font-mono text-xs font-bold"
              iconRight={<ExternalLink className="w-3.5 h-3.5" />}
            >
              VIEW ORDER
            </Button>
          </Link>
          <Link to="/orders">
            <Button
              variant="secondary"
              size="md"
              className="w-full font-mono text-xs"
              iconLeft={<ReceiptText className="w-3.5 h-3.5" />}
            >
              MY ORDERS
            </Button>
          </Link>
          <Link to="/products">
            <Button
              variant="secondary"
              size="md"
              className="w-full font-mono text-xs"
              iconLeft={<ShoppingBag className="w-3.5 h-3.5" />}
            >
              SHOP MORE
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500 pt-2 border-t border-white/[0.06]">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Complimentary Tracking & Hardware Replacement Warranty</span>
        </div>

      </motion.div>

    </div>
  );
};
