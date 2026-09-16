import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';

export const OrderHistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load orders from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '3rem 1rem 6rem 1rem' }}>
        <div className="container" style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            padding: '2.5rem 1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)' }}>
              lock_person
            </span>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginTop: '0.75rem', color: 'var(--slate-dark)' }}>
              Sign In to View Orders
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.375rem', marginBottom: '1.5rem' }}>
              Access your hardware orders, stock reservation timers, and cancellation records.
            </p>
            <Link to="/login?redirect=/orders" className="btn-primary" style={{ width: '100%', minHeight: '46px', fontSize: '0.9375rem' }}>
              Sign In to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (filterTab === 'ALL') return true;
    return order.status === filterTab;
  });

  return (
    <div style={{ padding: '1.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
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
              Order History & Tracking
            </span>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
            }}>
              My Orders
            </h1>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', minHeight: '36px' }}
            title="Refresh order log"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Filters (Horizontally Scrollable) */}
        <div className="category-chips-bar" style={{ marginBottom: '1.25rem' }}>
          {['ALL', 'RESERVED', 'PAID', 'CANCELLED', 'EXPIRED', 'FAILED'].map((tab) => {
            const count = tab === 'ALL' ? orders.length : orders.filter((o) => o.status === tab).length;
            const active = filterTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`chip-item ${active ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                <span>{tab === 'ALL' ? 'All' : tab}</span>
                <span style={{
                  fontSize: '0.6875rem',
                  padding: '0.05rem 0.35rem',
                  borderRadius: '9999px',
                  background: active ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skeletons while loading */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="spec-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div className="skeleton-box" style={{ width: '100px', height: '18px' }} />
                  <div className="skeleton-box" style={{ width: '80px', height: '18px', borderRadius: '12px' }} />
                </div>
                <div className="skeleton-box" style={{ width: '120px', height: '14px', marginBottom: '0.5rem' }} />
                <div className="skeleton-box" style={{ width: '90px', height: '22px', marginBottom: '0.75rem' }} />
                <div className="skeleton-box" style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            background: 'var(--stock-out-bg)',
            borderRadius: 'var(--radius-xl)',
            color: 'var(--stock-out-text)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>error</span>
            <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>{error}</p>
            <button onClick={fetchOrders} className="btn-secondary" style={{ marginTop: '1rem', minHeight: '40px' }}>
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State (Requirement 18) */
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            padding: '4rem 1.5rem',
            textAlign: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-subtle)' }}>
              receipt_long
            </span>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginTop: '0.75rem', color: 'var(--slate-dark)' }}>
              You haven't placed any orders yet.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.375rem', maxWidth: '340px', margin: '0.375rem auto 1.5rem' }}>
              Browse hardware and complete a checkout session to track order allocations here.
            </p>
            <Link to="/products" className="btn-primary" style={{ padding: '0.75rem 1.5rem', minHeight: '44px' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          /* ============================================================
              REQUIREMENT 13: MOBILE ORDER CARDS (No tables)
              #ORD-1005  [STATUS]
              2 Products
              Rs. 12,500
              16 Sep 2026
              [ View Details ]
              ============================================================ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredOrders.map((order) => {
              const totalItemsCount = order.items.reduce((acc, cur) => acc + cur.quantity, 0);
              return (
                <div
                  key={order.orderId}
                  className="spec-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.875rem',
                  }}
                >
                  {/* Top: Order ID & Status Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-hairline)',
                  }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--slate-dark)',
                    }}>
                      #{order.orderId}
                    </span>
                    <StatusBadge status={order.status} type="order" />
                  </div>

                  {/* Products count & Item snippet */}
                  <div>
                    <span style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: 'var(--slate-dark)',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}>
                      {totalItemsCount} {totalItemsCount === 1 ? 'Product' : 'Products'}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {order.items.map((i) => i.name).slice(0, 2).join(', ')}
                      {order.items.length > 2 ? ' ...' : ''}
                    </span>
                  </div>

                  {/* Total & Date Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    paddingTop: '0.25rem',
                  }}>
                    <div>
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                        Total Amount
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-headline)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'var(--slate-dark)',
                      }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                        Date
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-dark)' }}>
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Primary CTA: [ View Details ] */}
                  <Link
                    to={`/orders/${order.orderId}`}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    <span>View Details</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      arrow_forward
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
