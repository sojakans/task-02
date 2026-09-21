import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { orderService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { ReservationCountdown } from '../components/ReservationCountdown';
import { StatusBadge } from '../components/StatusBadge';
import { CheckoutStepper } from '../components/CheckoutStepper';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(orderId);
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error loading order for checkout:', err);
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleCountdownExpire = async () => {
    await fetchOrder();
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-spin mb-4">
          <Cpu className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-slate-400">Verifying atomic inventory reservation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-8 shadow-2xl space-y-4">
          <AlertOctagon className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="font-display font-bold text-xl text-white">Invalid Order Reference</h2>
          <p className="text-xs font-mono text-slate-400">
            {error || 'Unable to locate order telemetry.'}
          </p>
          <Link to="/products">
            <Button variant="primary" size="md">
              Return to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isReserved = order.status === 'RESERVED';
  const isExpired = order.status === 'EXPIRED';
  const isPaid = order.status === 'PAID';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Checkout Progress Stepper */}
      <CheckoutStepper currentStep={2} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <span>Order Reference</span>
            <span className="text-slate-400">#{order.orderId?.slice(-8) || order._id?.slice(-8)}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
            Checkout Verification
          </h1>
        </div>
        <StatusBadge status={order.status} type="order" />
      </div>

      {/* Countdown Timer for Stock Hold */}
      {isReserved && (
        <ReservationCountdown
          expiresAt={order.reservationExpiresAt}
          onExpire={handleCountdownExpire}
        />
      )}

      {/* Expired Notification */}
      {isExpired && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-6 text-center mb-6 space-y-3">
          <AlertOctagon className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="font-display font-bold text-lg text-rose-200">
            Stock Reservation Hold Elapsed
          </h3>
          <p className="text-xs font-mono text-slate-300 max-w-sm mx-auto">
            This reservation expired. Please add components to your cart and initiate a fresh order.
          </p>
          <Link to="/products">
            <Button variant="secondary" size="sm" iconLeft={<ArrowLeft className="w-4 h-4" />}>
              Source New Inventory
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Allocated Items Card */}
        <div className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Allocated Silicon Units
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {order.items?.length || 0} line item(s)
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#070b14] border border-white/[0.08] overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs font-mono text-slate-400">
                      Qty: <span className="text-cyan-400 font-bold">{item.quantity}</span> &times; {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-sm text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Calculation */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Logistics & Courier:</span>
              <span className="text-emerald-400">COMPLIMENTARY</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Hardware Allocation Tax:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-white/[0.06] text-base">
              <span className="font-bold text-white">Final Settled Amount:</span>
              <span className="font-extrabold text-xl sm:text-2xl text-cyan-400">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Fulfillment Destination Card */}
        {order.shippingAddress && (
          <div className="bg-[#0b1222] border border-white/[0.08] rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Fulfillment Logistics Terminal
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

        {/* Action Button */}
        <div className="pt-4 space-y-3">
          {isReserved ? (
            <Button
              size="lg"
              variant="glow"
              className="w-full text-sm font-mono tracking-wider font-bold py-4"
              onClick={() => navigate(`/payment/${order.orderId}`)}
              iconRight={<CreditCard className="w-4 h-4" />}
            >
              PROCEED TO SECURE PAYMENT GATEWAY &rarr;
            </Button>
          ) : isPaid ? (
            <Button
              size="lg"
              variant="primary"
              className="w-full font-mono text-sm font-bold"
              onClick={() => navigate(`/order-success/${order.orderId}`)}
              iconRight={<CheckCircle2 className="w-4 h-4" />}
            >
              VIEW ORDER CONFIRMATION
            </Button>
          ) : (
            <Link to="/products">
              <Button size="lg" variant="secondary" className="w-full font-mono text-sm">
                Return to Product Directory
              </Button>
            </Link>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cryptographic Idempotency Shield Active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
