import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { ReservationCountdown } from '../components/ReservationCountdown';
import { CancelOrderModal } from '../components/CancelOrderModal';

export const OrderDetailsPage = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState(null);

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
      setCancelMessage(null);
      const res = await orderService.cancelOrder(order.orderId, reason);
      if (res.success) {
        setModalOpen(false);
        setCancelMessage({
          type: 'success',
          text: res.refund
            ? `Order cancelled successfully! A refund of ${formatCurrency(res.refund.amount)} has been initiated (Ref: ${res.refund.refundId}).`
            : 'Order cancelled successfully! Reserved components have been released back to stock.',
        });
        await fetchOrder();
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setCancelMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel order.',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Loading order telemetry...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', background: 'var(--card)', padding: '2rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>error</span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '0.75rem', fontSize: '1.25rem' }}>Order Not Found</h2>
          <Link to="/orders" className="btn-primary" style={{ marginTop: '1.5rem', minHeight: '44px' }}>Back to Orders</Link>
        </div>
      </div>
    );
  }

  const isReserved = order.status === 'RESERVED';
  const isPaid = order.status === 'PAID';
  const isCancelled = order.status === 'CANCELLED';
  const isExpired = order.status === 'EXPIRED';
  const isFailed = order.status === 'FAILED';
  const canCancel = isReserved || isPaid;

  // Compute timeline steps
  const timeline = [
    {
      title: 'Order Created',
      desc: formatDate(order.createdAt),
      status: 'completed',
      icon: 'check_circle',
    },
    {
      title: 'Stock Reserved',
      desc: isExpired
        ? '5-min window elapsed'
        : isReserved
        ? 'Active session lock'
        : 'Guaranteed lot hold',
      status: isExpired ? 'failed' : 'completed',
      icon: isExpired ? 'cancel' : 'check_circle',
    },
    {
      title: 'Payment Completed',
      desc: isPaid
        ? 'Captured & authorized'
        : isFailed
        ? 'Declined by gateway'
        : isExpired
        ? 'Expired without payment'
        : 'Awaiting payment',
      status: isPaid ? 'completed' : isFailed ? 'failed' : isReserved ? 'current' : 'pending',
      icon: isPaid ? 'check_circle' : isFailed ? 'cancel' : isReserved ? 'pending' : 'radio_button_unchecked',
    },
    {
      title: 'Order Confirmed',
      desc: isPaid ? 'Ready for laboratory dispatch' : isCancelled ? 'Cancelled & released' : 'Pending payment settlement',
      status: isPaid ? 'completed' : isCancelled ? 'failed' : 'pending',
      icon: isPaid ? 'verified' : isCancelled ? 'cancel' : 'radio_button_unchecked',
    },
  ];

  return (
    <div style={{ padding: '1.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}>
          <Link to="/orders" style={{ color: 'var(--text-muted)' }}>My Orders</Link>
          <span>/</span>
          <span style={{ color: 'var(--slate-dark)', fontWeight: 600 }}>#{order.orderId}</span>
        </div>

        {/* Cancellation feedback banner */}
        {cancelMessage && (
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-lg)',
            background: cancelMessage.type === 'success' ? 'var(--stock-in-bg)' : 'var(--stock-out-bg)',
            border: `1px solid ${cancelMessage.type === 'success' ? 'var(--stock-in-border)' : 'var(--stock-out-border)'}`,
            color: cancelMessage.type === 'success' ? 'var(--stock-in-text)' : 'var(--stock-out-text)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontSize: '0.875rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {cancelMessage.type === 'success' ? 'verified' : 'error'}
            </span>
            <span>{cancelMessage.text}</span>
          </div>
        )}

        {/* 5-Min Timer if still RESERVED */}
        {isReserved && (
          <ReservationCountdown
            expiresAt={order.reservationExpiresAt}
            onExpire={fetchOrder}
          />
        )}

        {/* Order Header Card */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-sm)',
          padding: '1.25rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.875rem',
            borderBottom: '1px solid var(--border-hairline)',
            marginBottom: '1rem',
          }}>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Order Identification
              </span>
              <h1 style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--slate-dark)',
              }}>
                #{order.orderId}
              </h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatDate(order.createdAt)}
              </span>
            </div>

            <StatusBadge status={order.status} type="order" />
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Payment Status
              </span>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--slate-dark)' }}>
                {order.paymentStatus}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Order Value
              </span>
              <div style={{ fontWeight: 800, fontSize: '1.1875rem', color: 'var(--primary)' }}>
                {formatCurrency(order.totalAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            REQUIREMENT 14: ORDER TIMELINE COMPONENT
            ✓ Order Created
            ↓
            ✓ Stock Reserved
            ↓
            ✓ Payment Completed
            ↓
            ✓ Order Confirmed
            ============================================================ */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-sm)',
          padding: '1.25rem',
          marginBottom: '1.25rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--slate-dark)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
              timeline
            </span>
            Order Progression Timeline
          </h3>

          {/* Vertical Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {timeline.map((step, idx) => {
              const isLast = idx === timeline.length - 1;
              const isDone = step.status === 'completed';
              const isFailedStep = step.status === 'failed';
              const isCurrentStep = step.status === 'current';

              const color = isDone
                ? 'var(--stock-in)'
                : isFailedStep
                ? 'var(--stock-out)'
                : isCurrentStep
                ? 'var(--primary)'
                : 'var(--text-subtle)';

              return (
                <div key={step.title} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {/* Step Node + Vertical Line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isDone ? '#ecfdf5' : isFailedStep ? '#fee2e2' : isCurrentStep ? '#eff6ff' : '#f1f5f9',
                      color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${color}`,
                      zIndex: 2,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {step.icon}
                      </span>
                    </div>
                    {!isLast && (
                      <div style={{
                        width: '2px',
                        flex: 1,
                        minHeight: '28px',
                        background: isDone ? 'var(--stock-in-border)' : '#e2e8f0',
                        margin: '2px 0',
                      }} />
                    )}
                  </div>

                  {/* Step Content */}
                  <div style={{ paddingBottom: isLast ? '0' : '1.25rem', flex: 1 }}>
                    <div style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: isDone || isCurrentStep ? 'var(--slate-dark)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}>
                      <span>{step.title}</span>
                      {isCurrentStep && (
                        <span style={{
                          fontSize: '0.625rem',
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Products Bill of Materials (BOM) */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-sm)',
          padding: '1.25rem',
          marginBottom: '1.25rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--slate-dark)',
            marginBottom: '0.875rem',
          }}>
            Purchased Products ({order.items.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
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
                }}
              >
                <div>
                  <strong style={{ color: 'var(--slate-dark)', display: 'block' }}>{item.name}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {formatCurrency(item.price)} × {item.quantity} unit(s)
                  </span>
                </div>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--slate-dark)' }}>
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingTop: '0.25rem',
          }}>
            <strong style={{ fontSize: '1rem', color: 'var(--slate-dark)' }}>Total Settled:</strong>
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

        {/* Section: Payment & Dispatch Details */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-sm)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--slate-dark)',
            marginBottom: '0.75rem',
          }}>
            Fulfillment & Payment Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Recipient: </span>
              <strong style={{ color: 'var(--slate-dark)' }}>{order.customer?.fullName || 'Lead Hardware Engineer'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Shipping Destination: </span>
              <strong style={{ color: 'var(--slate-dark)' }}>{order.customer?.address || 'Silicon Hub 404, Tech Park, Bangalore'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Stock Status: </span>
              <strong style={{ color: order.stockReleased ? 'var(--stock-warning)' : 'var(--stock-in)' }}>
                {order.stockReleased ? 'Released to Inventory' : 'Allocated in Warehouse'}
              </strong>
            </div>
            {order.refund && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.625rem 0.75rem',
                background: '#ecfdf5',
                borderRadius: '6px',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontWeight: 600,
              }}>
                Refund {order.refund.status}: {formatCurrency(order.refund.amount)} (Ref: {order.refund.refundId})
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isReserved && (
            <Link
              to={`/payment/${order.orderId}`}
              className="btn-primary"
              style={{ width: '100%', minHeight: '48px', fontSize: '1rem' }}
            >
              <span>Proceed to Payment</span>
              <span className="material-symbols-outlined">payments</span>
            </Link>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-danger"
              style={{ width: '100%', minHeight: '44px', fontSize: '0.9375rem' }}
            >
              <span className="material-symbols-outlined">cancel</span>
              <span>Cancel Order</span>
            </button>
          )}

          <Link
            to="/orders"
            className="btn-secondary"
            style={{ width: '100%', minHeight: '44px', fontSize: '0.9375rem' }}
          >
            ← Back to All Orders
          </Link>
        </div>

        {/* Cancellation Modal */}
        <CancelOrderModal
          order={order}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmCancel}
          loading={cancelling}
        />
      </div>
    </div>
  );
};
