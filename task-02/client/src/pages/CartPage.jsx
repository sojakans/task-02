import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, resetCartAfterCheckout } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const navigate = useNavigate();

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  const handleStartCheckout = async () => {
    if (isEmpty || checkingOut) return;

    // Must be logged in to order/checkout
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart&prompt=order');
      return;
    }

    try {
      setCheckingOut(true);
      setCheckoutError(null);

      // Trigger checkout on server
      const res = await checkoutService.checkout(cart.cartId, {
        fullName: user?.name || 'Lead Hardware Engineer',
        email: user?.email || 'engineer@techloom.store',
        address: 'Robotics Lab 102, Innovation Quarter',
        city: 'Bangalore',
        postalCode: '560100',
      });

      if (res.success && res.order) {
        // Reset active cart in local storage
        await resetCartAfterCheckout();
        // Route customer to checkout reservation view
        navigate(`/checkout/${res.order.orderId}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || 'Failed to start checkout. Check inventory availability.';
      setCheckoutError(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Calculating cart totals...</p>
      </div>
    );
  }

  return (
    <div className={isEmpty ? 'has-mobile-nav' : 'has-sticky-action'} style={{ padding: '1.5rem 0 3rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--primary)',
            display: 'block',
          }}>
            Allocation Queue
          </span>
          <h1 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--slate-dark)',
          }}>
            Shopping Cart ({cart?.itemCount || 0})
          </h1>
        </div>

        {/* Error Alert */}
        {checkoutError && (
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--stock-out-bg)',
            border: '1px solid var(--stock-out-border)',
            color: 'var(--stock-out-text)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>error</span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem' }}>Checkout Reservation Blocked</strong>
              <span style={{ fontSize: '0.8125rem' }}>{checkoutError}</span>
            </div>
          </div>
        )}

        {/* Empty State (Requirement 18) */}
        {isEmpty ? (
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--card-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-subtle)',
              marginBottom: '1rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                remove_shopping_cart
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Your cart is empty.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.375rem', maxWidth: '360px', margin: '0.375rem auto 1.5rem' }}>
              Explore our microcontrollers, sensors, and development boards to start building.
            </p>
            <Link
              to="/products"
              className="btn-primary"
              style={{ padding: '0.75rem 1.75rem', minHeight: '44px', fontSize: '0.9375rem' }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}>
            {/* ============================================================
                ITEMIZED CART CARDS (Requirement 6: No large desktop tables)
                ============================================================ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="spec-card"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {/* Top Row: Thumbnail, Name, Unit Price, Remove Button */}
                  <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        border: '1px solid var(--border-hairline)',
                        background: '#f8fafc',
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/products/${item.productId}`}
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--slate-dark)',
                          lineHeight: 1.3,
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {item.name}
                      </Link>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Unit: {formatCurrency(item.price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-subtle)',
                        background: 'var(--card-subtle)',
                        flexShrink: 0,
                      }}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        delete
                      </span>
                    </button>
                  </div>

                  {/* Bottom Row: Stepper and Subtotal */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-hairline)',
                  }}>
                    {/* Stepper (Min 44px tap targets) */}
                    <div className="touch-stepper">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="stepper-value">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                        Subtotal
                      </span>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'var(--slate-dark)',
                      }}>
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ============================================================
                PRICING SUMMARY CARD
                ============================================================ */}
            <div style={{
              background: 'var(--card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-hairline)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--slate-dark)',
                marginBottom: '1rem',
              }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{formatCurrency(cart?.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span>Taxes & Hardware Excise:</span>
                  <span style={{ fontWeight: 600, color: 'var(--stock-in)' }}>Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span>Express Logistics (India):</span>
                  <span style={{ fontWeight: 600, color: 'var(--stock-in)' }}>FREE</span>
                </div>

                <div style={{
                  paddingTop: '0.75rem',
                  marginTop: '0.25rem',
                  borderTop: '1px solid var(--border-hairline)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--slate-dark)' }}>Total:</strong>
                  <span style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                  }}>
                    {formatCurrency(cart?.total)}
                  </span>
                </div>
              </div>

              {/* Stock Reservation Notice */}
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--card-subtle)',
                border: '1px solid var(--border-hairline)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)', marginTop: '2px' }}>
                  lock_clock
                </span>
                <span>
                  Proceeding to checkout holds inventory for <strong>5 minutes</strong> to guarantee allocation.
                </span>
              </div>

              {/* Desktop Checkout CTA */}
              <div className="desktop-only">
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  disabled={isEmpty || checkingOut}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', minHeight: '48px' }}
                >
                  {checkingOut ? (
                    <>
                      <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
                        sync
                      </span>
                      <span>Reserving Stock...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          STICKY BOTTOM ACTION BAR (Requirement 6)
          Subtotal / Total + Proceed to Checkout
          ============================================================ */}
      {!isEmpty && (
        <div className="mobile-sticky-action-bar">
          <div>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
              Total Payable
            </span>
            <span style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.1875rem',
              fontWeight: 800,
              color: 'var(--primary)',
            }}>
              {formatCurrency(cart?.total)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleStartCheckout}
            disabled={isEmpty || checkingOut}
            className="btn-primary"
            style={{
              flex: 1,
              minHeight: '48px',
              fontSize: '0.9375rem',
              padding: '0.75rem 1rem',
            }}
          >
            {checkingOut ? (
              <>
                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
                  sync
                </span>
                <span>Reserving...</span>
              </>
            ) : (
              <>
                <span>Proceed to Checkout</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
