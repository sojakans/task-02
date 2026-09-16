import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService, paymentService } from '../services/api';
import { formatCurrency, generateIdempotencyKey } from '../utils/formatters';
import { ReservationCountdown } from '../components/ReservationCountdown';

export const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Fields (Full width, Section 9)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  // Simulator test mode selection
  const [simulateOutcome, setSimulateOutcome] = useState('SUCCESS'); // 'SUCCESS' | 'FAILED' | 'TIMEOUT'
  const [showAdvancedSimulator, setShowAdvancedSimulator] = useState(false);

  // Dedicated screen outcome states (Sections 11 & 12)
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
        setIdempotentNotice(`Idempotent request recognized: payment ${res.payment?.paymentId} was already finalized. No double-charge occurred.`);
        await fetchOrder();
        return;
      }

      if (simulateOutcome === 'SUCCESS') {
        navigate(`/order-success/${order.orderId}`);
      } else if (simulateOutcome === 'FAILED') {
        setPaymentFailedState(true);
        await fetchOrder();
      } else if (simulateOutcome === 'TIMEOUT') {
        setPaymentTimeoutState(true);
        await fetchOrder();
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      const msg = err.response?.data?.message || 'Payment processing error';
      setError(msg);
      await fetchOrder();
    } finally {
      setProcessing(false);
    }
  };

  const handleRegenerateKey = () => {
    setIdempotencyKey(generateIdempotencyKey());
    setIdempotentNotice(null);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Loading payment gateway...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--card)', padding: '2rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>error</span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '0.75rem', fontSize: '1.25rem' }}>{error}</h2>
          <Link to="/products" className="btn-primary" style={{ marginTop: '1.5rem', minHeight: '44px' }}>Browse Catalog</Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // REQUIREMENT 12: DEDICATED PAYMENT TIMEOUT SCREEN
  // ============================================================
  if (paymentTimeoutState || order.status === 'EXPIRED') {
    return (
      <div style={{ padding: '3rem 1rem 5rem 1rem', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            boxShadow: 'var(--shadow-md)',
            padding: '2.5rem 1.5rem',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fffbeb',
              color: 'var(--stock-warning)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                hourglass_disabled
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
              marginBottom: '0.5rem',
            }}>
              Reservation Expired
            </h1>

            <p style={{
              fontSize: '0.9375rem',
              color: 'var(--text-muted)',
              marginBottom: '2rem',
              lineHeight: 1.5,
            }}>
              Your stock reservation has expired.
            </p>

            <Link
              to="/cart"
              className="btn-primary"
              style={{ width: '100%', minHeight: '48px', fontSize: '1rem' }}
            >
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // REQUIREMENT 11: DEDICATED PAYMENT FAILURE SCREEN
  // ============================================================
  if (paymentFailedState || order.status === 'FAILED') {
    return (
      <div style={{ padding: '3rem 1rem 5rem 1rem', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            boxShadow: 'var(--shadow-md)',
            padding: '2.5rem 1.5rem',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: 'var(--stock-out)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                error
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
              marginBottom: '0.5rem',
            }}>
              Payment Failed
            </h1>

            <p style={{
              fontSize: '0.9375rem',
              color: 'var(--text-muted)',
              marginBottom: '2rem',
              lineHeight: 1.5,
            }}>
              The payment could not be completed.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setPaymentFailedState(false);
                  setSimulateOutcome('SUCCESS');
                  handleRegenerateKey();
                }}
                className="btn-primary"
                style={{ width: '100%', minHeight: '48px', fontSize: '1rem' }}
              >
                Try Again
              </button>

              <Link
                to="/cart"
                className="btn-secondary"
                style={{ width: '100%', minHeight: '48px', fontSize: '0.9375rem' }}
              >
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isReserved = order.status === 'RESERVED';

  return (
    <div style={{ padding: '1.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        {/* Reservation Countdown (Requirement 8) */}
        {isReserved && (
          <ReservationCountdown
            expiresAt={order.reservationExpiresAt}
            onExpire={() => {
              setPaymentTimeoutState(true);
              fetchOrder();
            }}
          />
        )}

        {/* Idempotent Notice Alert */}
        {idempotentNotice && (
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-lg)',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--stock-warning)' }}>
              verified_user
            </span>
            <span>{idempotentNotice}</span>
          </div>
        )}

        {/* ============================================================
            REQUIREMENT 9: MOBILE PAYMENT FORM
            Full-width fields: Card Number, Expiry Date, CVV
            ============================================================ */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem',
          marginBottom: '1.25rem',
        }}>
          {/* Header & Payable Total */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-hairline)',
            marginBottom: '1.25rem',
          }}>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Order #{order.orderId}
              </span>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-dark)' }}>
                Payment Details
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Payable
              </span>
              <span style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--primary)',
              }}>
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Clean Payment Form */}
          <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Field 1: Card Number (Full width) */}
            <div>
              <label style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate-dark)',
                marginBottom: '0.375rem',
                display: 'block',
              }}>
                Card Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  style={{
                    paddingLeft: '2.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.9375rem',
                    letterSpacing: '0.05em',
                  }}
                />
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-subtle)',
                    fontSize: '20px',
                  }}
                >
                  credit_card
                </span>
              </div>
            </div>

            {/* Field 2: Expiry Date (Full width) */}
            <div>
              <label style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate-dark)',
                marginBottom: '0.375rem',
                display: 'block',
              }}>
                Expiry Date
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM / YY"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            {/* Field 3: CVV (Full width) */}
            <div>
              <label style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate-dark)',
                marginBottom: '0.375rem',
                display: 'block',
              }}>
                CVV / Security Code
              </label>
              <input
                type="password"
                required
                maxLength={4}
                className="input-field"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            {/* Simulator Scenario Picker (Allows seamless testing of SUCCESS, DECLINE, TIMEOUT) */}
            <div style={{
              background: 'var(--card-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              border: '1px solid var(--border-hairline)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                  Simulator Test Scenario:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdvancedSimulator(!showAdvancedSimulator)}
                  style={{ fontSize: '0.6875rem', color: 'var(--primary)', fontWeight: 600 }}
                >
                  {showAdvancedSimulator ? 'Hide Keys' : 'Show Key'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem' }}>
                <button
                  type="button"
                  onClick={() => setSimulateOutcome('SUCCESS')}
                  style={{
                    padding: '0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: simulateOutcome === 'SUCCESS' ? 'var(--stock-in)' : '#ffffff',
                    color: simulateOutcome === 'SUCCESS' ? '#ffffff' : 'var(--slate-dark)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  Success
                </button>
                <button
                  type="button"
                  onClick={() => setSimulateOutcome('FAILED')}
                  style={{
                    padding: '0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: simulateOutcome === 'FAILED' ? 'var(--stock-out)' : '#ffffff',
                    color: simulateOutcome === 'FAILED' ? '#ffffff' : 'var(--slate-dark)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => setSimulateOutcome('TIMEOUT')}
                  style={{
                    padding: '0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: simulateOutcome === 'TIMEOUT' ? 'var(--stock-warning)' : '#ffffff',
                    color: simulateOutcome === 'TIMEOUT' ? '#ffffff' : 'var(--slate-dark)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  Timeout
                </button>
              </div>

              {/* Advanced Idempotency Key config */}
              {showAdvancedSimulator && (
                <div style={{ marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-hairline)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Idempotency Key:</span>
                    <button
                      type="button"
                      onClick={handleRegenerateKey}
                      style={{ fontSize: '0.6875rem', color: 'var(--primary)' }}
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    className="input-field"
                    value={idempotencyKey}
                    onChange={(e) => setIdempotencyKey(e.target.value)}
                    style={{ fontSize: '0.75rem', fontFamily: 'monospace', height: '36px' }}
                  />
                </div>
              )}
            </div>

            {/* Primary Button: [ Pay Now ] (Requirement 9)
                While processing: [ Processing Payment... ]
                Disabled while processing to prevent accidental repeated taps. */}
            <button
              type="submit"
              disabled={processing || !isReserved}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                minHeight: '48px',
                marginTop: '0.25rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {processing ? (
                <>
                  <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
                    sync
                  </span>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">lock</span>
                  <span>Pay Now — {formatCurrency(order.totalAmount)}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security / SSL Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stock-in)' }}>
            verified_user
          </span>
          <span>Encrypted with 256-bit SSL & Idempotency Key Shielding</span>
        </div>
      </div>
    </div>
  );
};
