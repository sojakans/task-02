import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  ShieldCheck,
  RotateCcw,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Lock,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  ArrowLeft,
  Copy,
  Zap,
} from 'lucide-react';
import { orderService, paymentService } from '../services/api';
import { formatCurrency, generateIdempotencyKey } from '../utils/formatters';
import { ReservationCountdown } from '../components/ReservationCountdown';
import { CheckoutStepper } from '../components/CheckoutStepper';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';

export const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  // Simulator test mode selection
  const [simulateOutcome, setSimulateOutcome] = useState('SUCCESS'); // 'SUCCESS' | 'FAILED' | 'TIMEOUT'
  const [showAdvancedSimulator, setShowAdvancedSimulator] = useState(true);

  // Dedicated screen outcome states
  const [paymentFailedState, setPaymentFailedState] = useState(false);
  const [paymentTimeoutState, setPaymentTimeoutState] = useState(false);

  // Idempotency state
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey());
  const [processing, setProcessing] = useState(false);
  const [idempotentNotice, setIdempotentNotice] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(orderId);
      if (data.success && data.order) {
        setOrder(data.order);
        if (data.order.status === 'EXPIRED') {
          setPaymentTimeoutState(true);
        } else if (data.order.status === 'FAILED') {
          setPaymentFailedState(true);
        }
      }
    } catch (err) {
      console.error('Error fetching order for payment:', err);
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleProcessPayment = async (e) => {
    if (e) e.preventDefault();
    if (processing || !order) return;

    try {
      setProcessing(true);
      setError(null);
      setIdempotentNotice(null);

      const res = await paymentService.processPayment({
        orderId: order.orderId,
        outcome: simulateOutcome,
        idempotencyKey,
      });

      if (res.isIdempotentReplay) {
        setIdempotentNotice(
          `Idempotent replay detected: payment ${res.payment?.paymentId} was already settled. Zero double-charge occurred.`
        );
        toast.info('Idempotency shield protected order from duplicate settlement.');
        await fetchOrder();
        return;
      }

      if (simulateOutcome === 'SUCCESS') {
        toast.success('Payment settled successfully!');
        navigate(`/order-success/${order.orderId}`);
      } else if (simulateOutcome === 'FAILED') {
        setPaymentFailedState(true);
        toast.error('Simulation: Card declined by payment gateway');
        await fetchOrder();
      } else if (simulateOutcome === 'TIMEOUT') {
        setPaymentTimeoutState(true);
        toast.warning('Simulation: Gateway timeout triggered');
        await fetchOrder();
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      const msg = err.response?.data?.message || 'Payment processing error';
      setError(msg);
      toast.error(msg);
      await fetchOrder();
    } finally {
      setProcessing(false);
    }
  };

  const handleRegenerateKey = () => {
    const newKey = generateIdempotencyKey();
    setIdempotencyKey(newKey);
    setIdempotentNotice(null);
    toast.info('New Idempotency-Key generated');
  };

  const copyKey = () => {
    navigator.clipboard.writeText(idempotencyKey);
    toast.success('Idempotency key copied to clipboard');
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-spin mb-4">
          <Cpu className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-slate-400">Initializing encrypted payment gateway...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-8 shadow-2xl space-y-4">
          <AlertOctagon className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="font-display font-bold text-xl text-white">{error}</h2>
          <Link to="/products">
            <Button variant="primary" size="md">
              Return to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Outcome screen: Payment Failed
  if (paymentFailedState && order?.status === 'FAILED') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-[#0d1527] border border-rose-500/40 rounded-3xl p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white">Payment Declined</h2>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            The simulated card authorization was rejected. Your 5-minute stock hold is still maintained if time permits.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setPaymentFailedState(false);
                setSimulateOutcome('SUCCESS');
              }}
            >
              Retry Settlement (Success Mode)
            </Button>
            <Link to="/products">
              <Button variant="ghost">Cancel and Return to Catalog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Outcome screen: Payment Timeout / Expired
  if (paymentTimeoutState || order?.status === 'EXPIRED') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-[#0d1527] border border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white">Hold Period Elapsed</h2>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            The reservation deadline passed without payment confirmation. Inventory has been returned to the public pool.
          </p>
          <div className="pt-4">
            <Link to="/products">
              <Button variant="primary" iconLeft={<ArrowLeft className="w-4 h-4" />}>
                Source New Components
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Checkout Stepper */}
      <CheckoutStepper currentStep={3} />

      {/* Stock Hold Countdown */}
      {order?.status === 'RESERVED' && (
        <ReservationCountdown
          expiresAt={order.expiresAt}
          onExpire={fetchOrder}
        />
      )}

      {/* Idempotent Notice Alert */}
      {idempotentNotice && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4 mb-6 flex items-start gap-3 text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-1">
            <strong className="text-white block font-display">Idempotency Guard Protected Your Funds</strong>
            <p>{idempotentNotice}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Virtual Silicon Card & Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Holographic Virtual Card */}
          <div className="relative w-full aspect-[1.58/1] rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#13203c] via-[#0d162a] to-[#080d19] border border-cyan-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_30px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col justify-between select-none">
            {/* Ambient Card Mesh Pattern */}
            <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

            {/* Card Header: Chip & Contactless */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {/* Silicon Microchip */}
                <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200/50 shadow-md flex flex-col justify-between p-1">
                  <div className="h-1 bg-amber-700/50 rounded-xs" />
                  <div className="h-1 bg-amber-700/50 rounded-xs" />
                </div>
                <span className="font-mono text-[10px] text-cyan-300 uppercase tracking-widest font-bold">
                  TECHLOOM IDEMPOTENT PAY
                </span>
              </div>
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>

            {/* Card Number */}
            <div className="z-10 py-2">
              <span className="font-mono text-lg sm:text-2xl font-bold tracking-[0.2em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {cardNumber}
              </span>
            </div>

            {/* Card Footer: Cardholder & Expiry */}
            <div className="flex items-end justify-between z-10 font-mono text-xs text-slate-300">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Cardholder</span>
                <span className="font-bold text-white uppercase">{order?.shippingAddress?.fullName || 'LEAD ENGINEER'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Expires</span>
                <span className="font-bold text-white">{expiryDate}</span>
              </div>
            </div>
          </div>

          {/* Payment Form Fields */}
          <form onSubmit={handleProcessPayment} className="bg-[#0d1527] border border-white/[0.08] rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider border-b border-white/[0.08] pb-3">
              Payment Authorization Details
            </h3>

            <div>
              <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1.5">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1.5">
                  Security Code (CVV)
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* Gateway Settlement Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="glow"
                size="lg"
                disabled={processing || order?.status !== 'RESERVED'}
                isLoading={processing}
                className="w-full text-sm font-mono tracking-wider font-bold py-4"
                iconLeft={<Lock className="w-4 h-4" />}
              >
                AUTHORIZE SETTLEMENT &bull; {formatCurrency(order?.totalAmount || 0)}
              </Button>
            </div>
          </form>

        </div>

        {/* Right Column: Assessment Simulator Suite & Idempotency Shield */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Assessment Testing Harness Card */}
          <div className="bg-[#0a0f1d] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                  Testing Simulation Suite
                </h3>
              </div>
              <Badge variant="primary" size="sm">
                SANDBOX
              </Badge>
            </div>

            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Verify requirement test-cases by picking the simulated payment outcome:
            </p>

            {/* Outcome Selection Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Success', value: 'SUCCESS', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
                { label: 'Failed', value: 'FAILED', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
                { label: 'Timeout', value: 'TIMEOUT', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setSimulateOutcome(m.value)}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    simulateOutcome === m.value
                      ? m.color + ' shadow-md'
                      : 'border-white/[0.08] text-slate-400 hover:text-white bg-[#070b14]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Idempotency Suite */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  Idempotency Key:
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[#070b14] border border-white/[0.08] rounded-xl px-3 py-2">
                <span className="font-mono text-[11px] text-slate-300 truncate flex-1">
                  {idempotencyKey}
                </span>
                <button
                  type="button"
                  onClick={copyKey}
                  title="Copy Key"
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Idempotency Test Double-Click Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={processing}
                  onClick={handleProcessPayment}
                  className="w-full text-xs font-mono"
                  iconLeft={<ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                >
                  Simulate Double-Click (Same Key)
                </Button>
                <span className="text-[10px] font-mono text-slate-500 block text-center mt-1">
                  Executes payment with active key to prove idempotency replay handling.
                </span>
              </div>
            </div>

          </div>

          {/* Order Snapshot */}
          <div className="bg-[#0b1222] border border-white/[0.08] rounded-2xl p-6 space-y-3 font-mono text-xs">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider border-b border-white/[0.06] pb-2">
              Transaction Snapshot
            </h4>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Order ID:</span>
              <span className="text-white font-bold">#{order?.orderId}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Line Items:</span>
              <span>{order?.items?.length || 0} hardware piece(s)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Status:</span>
              <span className="text-cyan-400 font-bold">{order?.status}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-white/[0.06] text-sm">
              <span className="font-bold text-white">Amount Due:</span>
              <span className="font-black text-lg text-cyan-400">{formatCurrency(order?.totalAmount || 0)}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
