import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { ReservationCountdown } from '../components/ReservationCountdown';
import { StatusBadge } from '../components/StatusBadge';

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
    console.log('[Checkout] Countdown expired. Refreshing status...');
    await fetchOrder();
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Synchronizing stock reservation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: 'var(--card)',
          padding: '2rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>
            error
          </span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '0.75rem', fontSize: '1.25rem', color: 'var(--slate-dark)' }}>
            {error || 'Invalid Order Reference'}
          </h2>
          <Link to="/products" className="btn-primary" style={{ marginTop: '1.5rem', minHeight: '44px' }}>
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isReserved = order.status === 'RESERVED';
  const isExpired = order.status === 'EXPIRED';

  return (
    <div style={{ padding: '1.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        {/* Page Title & Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <div>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--primary)',
              display: 'block',
            }}>
              Step 1 of 2
            </span>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
            }}>
              Checkout
            </h1>
          </div>
          <StatusBadge status={order.status} type="order" />
        </div>

        {/* ============================================================
            VERTICAL CHECKOUT LAYOUT (Requirement 7)
            1. Stock Reservation UI (Requirement 8)
            2. Order Summary
            3. Delivery / Fulfillment
            4. Payment Action
            ============================================================ */}

        {/* Section 1: Stock Reservation Card */}
        {isReserved && (
          <ReservationCountdown
            expiresAt={order.reservationExpiresAt}
            onExpire={handleCountdownExpire}
          />
        )}

        {isExpired && (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--stock-out-bg)',
            border: '1.5px solid var(--stock-out-border)',
            color: 'var(--stock-out-text)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
              hourglass_disabled
            </span>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.125rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Reservation Expired
            </h3>
            <p style={{ fontSize: '0.8125rem', margin: '0.375rem 0 1rem' }}>
              The 5-minute allocation window has expired. Your reserved components have been released back to stock.
            </p>
            <Link to="/products" className="btn-primary" style={{ minHeight: '44px', padding: '0.625rem 1.25rem' }}>
              Re-order Components
            </Link>
          </div>
        )}

        {/* Section 2: Order Summary */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.25rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-hairline)',
            marginBottom: '1rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--slate-dark)',
            }}>
              Order Summary ({order.items.length} items)
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              #{order.orderId}
            </span>
          </div>

          {/* Itemized list: Product, Quantity, Price, Subtotal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-hairline)',
                  fontSize: '0.875rem',
                  gap: '0.75rem',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ color: 'var(--slate-dark)', display: 'block', lineHeight: 1.3 }}>
                    {item.name}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Qty: {item.quantity} × {formatCurrency(item.price)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    Subtotal
                  </span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--slate-dark)' }}>
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingTop: '0.25rem',
          }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-dark)' }}>
                Total Amount:
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                (Inclusive of all taxes & shipping)
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.625rem',
              fontWeight: 800,
              color: 'var(--primary)',
            }}>
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Section 3: Delivery Details */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--slate-dark)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
              local_shipping
            </span>
            Delivery & Recipient Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Recipient:</span>
              <span style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>
                {order.customer?.fullName || 'Lead Hardware Engineer'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Address:</span>
              <span style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>
                {order.customer?.address || 'Silicon Hub 404, Tech Park, Bangalore 560100'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Confirmation Email:</span>
              <span style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>
                {order.customer?.email || 'maker@techloom.store'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Primary Checkout Action */}
        <div>
          {isReserved ? (
            <button
              type="button"
              onClick={() => navigate(`/payment/${order.orderId}`)}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                minHeight: '48px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span>Continue to Payment</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : isExpired ? (
            <button
              type="button"
              disabled
              className="btn-secondary"
              style={{ width: '100%', minHeight: '48px', opacity: 0.6 }}
            >
              Payment Disabled (Reservation Expired)
            </button>
          ) : (
            <Link
              to={`/orders/${order.orderId}`}
              className="btn-secondary"
              style={{ width: '100%', minHeight: '48px' }}
            >
              View Order Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
