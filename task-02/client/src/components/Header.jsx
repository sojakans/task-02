import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { seedService } from '../services/api';

const CATEGORIES = ['Microcontrollers', 'Sensors', 'Displays', 'Robotics'];

export const Header = () => {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [reseedLoading, setReseedLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
    setDrawerOpen(false);
  };

  const handleReseed = async () => {
    if (confirm('Re-seed database with fresh hardware products?')) {
      try {
        setReseedLoading(true);
        await seedService.reseed();
        alert('Database successfully re-seeded!');
        window.location.reload();
      } catch (err) {
        alert('Failed to reseed database: ' + err.message);
      } finally {
        setReseedLoading(false);
        setDrawerOpen(false);
      }
    }
  };

  // Determine context for mobile header
  const pathname = location.pathname;
  let mobileTitle = null;
  let showBack = false;

  if (pathname.startsWith('/products/')) {
    mobileTitle = 'Product Details';
    showBack = true;
  } else if (pathname.startsWith('/checkout/')) {
    mobileTitle = 'Checkout';
    showBack = true;
  } else if (pathname.startsWith('/payment/')) {
    mobileTitle = 'Payment';
    showBack = true;
  } else if (pathname.startsWith('/orders/')) {
    mobileTitle = 'Order Details';
    showBack = true;
  } else if (pathname.startsWith('/order-success/')) {
    mobileTitle = 'Order Confirmed';
    showBack = false;
  }

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-hairline)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* ============================================================
            MOBILE COMPACT HEADER (<769px)
            ============================================================ */}
        <div className="mobile-only" style={{ padding: '0 0.875rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '3.5rem',
            gap: '0.5rem',
          }}>
            {/* Left Action: Back button or Hamburger Drawer */}
            {showBack ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--slate-dark)',
                  background: 'var(--card-subtle)',
                  border: '1px solid var(--border-hairline)',
                }}
                aria-label="Go Back"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  arrow_back
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--slate-dark)',
                  background: 'var(--card-subtle)',
                  border: '1px solid var(--border-hairline)',
                }}
                aria-label="Open Menu"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  menu
                </span>
              </button>
            )}

            {/* Center: Title or Logo */}
            <div style={{ flex: 1, textAlign: 'center', overflow: 'hidden' }}>
              {mobileTitle ? (
                <h1 style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  color: 'var(--slate-dark)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '0 0.5rem',
                }}>
                  {mobileTitle}
                </h1>
              ) : (
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      memory
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '1.1875rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'var(--slate-dark)',
                  }}>
                    Techloom
                  </span>
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.3rem',
                    borderRadius: '3px',
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                  }}>
                    Makers
                  </span>
                </Link>
              )}
            </div>

            {/* Right Action: Cart */}
            <Link
              to="/cart"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--slate-dark)',
                background: 'var(--card-subtle)',
                border: '1px solid var(--border-hairline)',
                position: 'relative',
              }}
              aria-label="View Cart"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                shopping_bag
              </span>
              {itemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9999px',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.3)',
                  }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ============================================================
            DESKTOP HEADER (>=769px) - Preserves existing desktop spec
            ============================================================ */}
        <div className="desktop-only container">
          {/* Main Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4.5rem',
            gap: '1.5rem',
          }}>
            {/* Logo & Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                    memory
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '1.375rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'var(--slate-dark)',
                  }}>
                    Techloom
                  </span>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '4px',
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                  }}>
                    Makers
                  </span>
                </div>
              </Link>

              <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  to="/"
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: pathname === '/' ? 'var(--primary)' : 'var(--slate-dark)',
                    background: pathname === '/' ? 'var(--primary-subtle)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: pathname.startsWith('/products') ? 'var(--primary)' : 'var(--text-muted)',
                    background: pathname.startsWith('/products') ? 'var(--primary-subtle)' : 'transparent',
                    transition: 'color 0.15s',
                  }}
                >
                  Products
                </Link>
                <Link
                  to="/orders"
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: pathname.startsWith('/orders') ? 'var(--primary)' : 'var(--text-muted)',
                    background: pathname.startsWith('/orders') ? 'var(--primary-subtle)' : 'transparent',
                    transition: 'color 0.15s',
                  }}
                >
                  My Orders
                </Link>
              </nav>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                flex: 1,
                maxWidth: '480px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  color: 'var(--text-subtle)',
                  fontSize: '20px',
                  pointerEvents: 'none',
                }}
              >
                search
              </span>
              <input
                type="text"
                className="input-field"
                placeholder="Search products, microcontrollers, sensors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '4rem', background: 'var(--card-subtle)' }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--text-muted)',
                }}
              >
                Search
              </button>
            </form>

            {/* Actions & Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Seed Database utility */}
              <button
                onClick={handleReseed}
                disabled={reseedLoading}
                title="Reset sample hardware catalog"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.625rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'var(--card-subtle)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  sync
                </span>
                {reseedLoading ? 'Seeding...' : 'Reset Catalog'}
              </button>

              {/* Cart Link */}
              <Link
                to="/cart"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--slate-dark)',
                  background: 'var(--card-subtle)',
                  transition: 'background 0.15s',
                }}
                title="Shopping Cart"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  shopping_bag
                </span>
                {itemCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '9999px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-hairline)' }} />

              {/* Profile / Auth Button */}
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    title={user?.email}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0284c7 0%, #004ac6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                    }}
                  >
                    {(user?.name || 'M').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-dark)', lineHeight: 1.2 }}>
                      {user?.name}
                    </span>
                    <button
                      type="button"
                      onClick={logout}
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--stock-out)',
                        textAlign: 'left',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-secondary"
                  style={{
                    padding: '0.45rem 0.875rem',
                    fontSize: '0.8125rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    account_circle
                  </span>
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>

          {/* Sub-bar / Telemetry Status (from Stitch layout) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.375rem',
            paddingBottom: '0.375rem',
            borderTop: '1px solid var(--border-hairline)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--stock-in)', fontWeight: 600 }}>
                <span className="pulse-dot" style={{ background: 'var(--stock-in)' }} />
                Global Silicon Logistics Live
              </span>
              <span style={{ color: 'var(--border-focused)' }}>/</span>
              <span>Microcontrollers, FPGAs, Telemetry Sensors</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Express Dispatch within 4h</span>
              <span style={{ color: 'var(--border-focused)' }}>•</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                5-Min Guaranteed Stock Lock
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          MOBILE DRAWER (OFFCANVAS SLIDE-IN)
          ============================================================ */}
      {drawerOpen && (
        <>
          <div
            className="mobile-drawer-overlay"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="mobile-drawer" aria-label="Mobile Navigation Menu">
            {/* Drawer Header */}
            <div style={{
              padding: '1.25rem 1rem',
              borderBottom: '1px solid var(--border-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--card-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    memory
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--slate-dark)' }}>
                    Techloom
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Silicon Logistics Engine
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  color: 'var(--text-muted)',
                }}
                aria-label="Close Menu"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  close
                </span>
              </button>
            </div>

            {/* User Info / Sign In block */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-hairline)' }}>
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7 0%, #004ac6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}>
                    {(user?.name || 'M').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--slate-dark)' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {user?.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { logout(); setDrawerOpen(false); }}
                    style={{ fontSize: '0.75rem', color: 'var(--stock-out)', fontWeight: 600 }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    account_circle
                  </span>
                  <span>Sign In to Account</span>
                </Link>
              )}
            </div>

            {/* Navigation Links */}
            <nav style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--slate-dark)',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                  home
                </span>
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--slate-dark)',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                  grid_view
                </span>
                All Products
              </Link>
              <Link
                to="/cart"
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--slate-dark)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                    shopping_bag
                  </span>
                  Shopping Cart
                </div>
                {itemCount > 0 && (
                  <span style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                  }}>
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--slate-dark)',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                  receipt_long
                </span>
                Order History & Tracking
              </Link>
            </nav>

            {/* Categories Section */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-hairline)' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
              }}>
                Categories
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--slate-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span>{cat}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-subtle)' }}>
                      chevron_right
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Reset DB utility */}
            <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-hairline)' }}>
              <button
                type="button"
                onClick={handleReseed}
                disabled={reseedLoading}
                className="btn-secondary"
                style={{ width: '100%', padding: '0.625rem', fontSize: '0.8125rem' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  sync
                </span>
                {reseedLoading ? 'Resetting Catalog...' : 'Reset Sample Catalog'}
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
