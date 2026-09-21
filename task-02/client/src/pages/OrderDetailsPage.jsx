import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Terminal,
  Package,
  MapPin,
  XCircle,
  ArrowLeft,
  Cpu,
} from 'lucide-react';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { ReservationCountdown } from '../components/ReservationCountdown';
import { CancelOrderModal } from '../components/CancelOrderModal';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { toast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(orderId);
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleConfirmCancel = async (reason) => {
    try {
      setCancelling(true);
      const res = await orderService.cancelOrder(order.orderId, reason);
      if (res.success) {
        setModalOpen(false);
        if (res.refund) {
          toast.success(
            `Order cancelled. Full refund of ${formatCurrency(res.refund.amount)} generated (Ref: ${res.refund.refundId}).`
          );
        } else {
          toast.success('Order cancelled. Reserved components released back to stock.');
        }
        await fetchOrder();
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-spin mb-4">
          <Cpu className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-slate-400">Loading order telemetry ledger...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-8 shadow-2xl space-y-4">
          <h2 className="font-display font-bold text-xl text-white">Order Record Not Found</h2>
          <p className="text-xs font-mono text-slate-400">{error}</p>
          <Link to="/orders">
            <Button variant="primary" size="md">
              Return to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isReserved = order.status === 'RESERVED';
  const isPaid = order.status === 'PAID';
  const isCancelled = order.status === 'CANCELLED';
  const canCancel = isReserved || isPaid;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders Ledger</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              Order #{order.orderId}
            </h1>
          </div>
          <span className="text-xs font-mono text-slate-400 mt-1 block">
            Logged: {formatDate(order.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} type="order" />
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setModalOpen(true)}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Stock Hold Countdown if Reserved */}
      {isReserved && (
        <ReservationCountdown
          expiresAt={order.expiresAt}
          onExpire={fetchOrder}
        />
      )}

      {/* Cancelled Notice */}
      {isCancelled && (
        <div className="bg-slate-900/80 border border-white/[0.1] rounded-2xl p-5 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-1">
            <span className="font-bold text-white block">Order De-allocated</span>
            <p className="text-slate-300">
              This order was cancelled. Reserved components were released back to available inventory.
            </p>
            {order.cancellationReason && (
              <p className="text-slate-400 italic">Reason: &ldquo;{order.cancellationReason}&rdquo;</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Allocated Components */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Package className="w-4 h-4 text-cyan-400" />
              <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Silicon Components
              </h2>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-white/[0.06] shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        Qty: <span className="text-cyan-400 font-bold">{item.quantity}</span> &times; {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-sm text-white shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-between items-baseline text-base font-mono">
              <span className="font-bold text-white">Order Total:</span>
              <span className="font-black text-xl text-cyan-400">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Reserved Order Prompt to Pay */}
          {isReserved && (
            <div className="bg-gradient-to-r from-cyan-950/40 via-[#0d1527] to-purple-950/40 border border-cyan-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <h3 className="font-display font-bold text-lg text-white">
                Pending Payment Settlement
              </h3>
              <p className="text-xs font-mono text-slate-300 max-w-md mx-auto">
                Stock reservation is active. Complete payment through the idempotency-shielded gateway before time expires.
              </p>
              <Link to={`/payment/${order.orderId}`}>
                <Button variant="glow" size="lg" className="w-full font-mono text-sm font-bold">
                  PROCEED TO PAYMENT GATEWAY &rarr;
                </Button>
              </Link>
            </div>
          )}

        </div>

        {/* Right Column: Destination & Telemetry */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Shipping Details */}
          {order.shippingAddress && (
            <div className="bg-[#0b1222] border border-white/[0.08] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                  Logistics Dispatch Point
                </h3>
              </div>
              <div className="font-mono text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p className="text-slate-400">{order.shippingAddress.email}</p>
              </div>
            </div>
          )}

          {/* Transaction Metadata */}
          <div className="bg-[#0b1222] border border-white/[0.08] rounded-2xl p-6 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Audited System Metadata
              </h3>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Database ID:</span>
              <span className="text-slate-200 truncate max-w-[140px]">{order._id}</span>
            </div>
            {order.paymentId && (
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Payment Ref:</span>
                <span className="text-purple-400 font-bold">{order.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Status State:</span>
              <span className="text-cyan-400 font-bold">{order.status}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        order={order}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
      />

    </div>
  );
};
