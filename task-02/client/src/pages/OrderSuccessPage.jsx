import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

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
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Confirming dispatch authorization...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', background: 'var(--card)', padding: '2rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>error</span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '0.75rem', fontSize: '1.25rem' }}>Order Not Found</h2>
          <Link to="/orders" className="btn-primary" style={{ marginTop: '1.5rem', minHeight: '44px' }}>View Order History</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1rem 5rem 1rem', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px', width: '100%' }}>
        {/* ============================================================
            REQUIREMENT 10: PROFESSIONAL MOBILE SUCCESS SCREEN
            Large success icon, "Payment Successful", Order ID, Total Amount,
            Payment ID, Date, [ View Order ], [ Continue Shopping ].
            ============================================================ */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-md)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
        }}>
          {/* Large Success Icon */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#ecfdf5',
            color: 'var(--stock-in)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            border: '2px solid #a7f3d0',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '42px', fontWeight: 800 }}>
              check
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1.625rem',
            fontWeight: 800,
            color: 'var(--slate-dark)',
            marginBottom: '0.375rem',
          }}>
            Payment Successful
          </h1>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Your transaction has been cryptographically confirmed. Silicon inventory is officially allocated.
          </p>

          {/* Key Details Card */}
          <div style={{
            background: 'var(--card-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-hairline)',
            padding: '1.25rem',
            marginBottom: '2rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Order ID:</span>
              <strong style={{ fontSize: '0.9375rem', fontFamily: 'monospace', color: 'var(--slate-dark)' }}>
                #{order.orderId}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Amount:</span>
              <strong style={{ fontSize: '1.125rem', fontFamily: 'var(--font-headline)', color: 'var(--primary)' }}>
                {formatCurrency(order.totalAmount)}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Payment ID:</span>
              <strong style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--slate-dark)' }}>
                {order.paymentId || `PAY-${order.orderId.slice(-6).toUpperCase()}`}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Date:</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-dark)' }}>
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons: [ View Order ] and [ Continue Shopping ] */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to={`/orders/${order.orderId}`}
              className="btn-primary"
              style={{ width: '100%', minHeight: '48px', fontSize: '1rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                receipt_long
              </span>
              <span>View Order</span>
            </Link>

            <Link
              to="/products"
              className="btn-secondary"
              style={{ width: '100%', minHeight: '48px', fontSize: '0.9375rem' }}
            >
              <span>Continue Shopping</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
