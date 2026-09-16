import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const CATEGORIES = [
  { label: 'All', value: 'All', icon: 'apps' },
  { label: 'Microcontrollers', value: 'Microcontrollers', icon: 'memory' },
  { label: 'Sensors', value: 'Sensors', icon: 'sensors' },
  { label: 'Displays', value: 'Displays', icon: 'tv' },
  { label: 'Robotics', value: 'Robotics', icon: 'smart_toy' },
];

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSearch, setMobileSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const params = { limit: 8 };
        if (activeCategory !== 'All') {
          params.category = activeCategory;
        }
        const data = await productService.getProducts(params);
        if (data.success) {
          setFeaturedProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(mobileSearch.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div>
      {/* ============================================================
          MOBILE SEARCH & CATEGORY CHIPS BAR (Below Mobile Header)
          ============================================================ */}
      <div className="mobile-only" style={{
        padding: '0.875rem 1rem 0.5rem',
        background: '#ffffff',
        borderBottom: '1px solid var(--border-hairline)',
      }}>
        {/* Large Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
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
            placeholder="Search products..."
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            style={{
              paddingLeft: '2.5rem',
              paddingRight: mobileSearch ? '2.5rem' : '1rem',
              background: 'var(--card-subtle)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-hairline)',
              fontSize: '0.9375rem',
            }}
          />
          {mobileSearch && (
            <button
              type="button"
              onClick={() => setMobileSearch('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Clear Search"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                close
              </span>
            </button>
          )}
        </form>

        {/* Horizontally Scrollable Categories */}
        <div>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: '0.375rem',
          }}>
            Categories
          </div>
          <div className="category-chips-bar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`chip-item ${activeCategory === cat.value ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          HERO SECTION (Desktop & Mobile Adaptive)
          ============================================================ */}
      <section style={{
        backgroundColor: 'var(--slate-dark)',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        padding: '2.5rem 0',
      }}>
        {/* Ambient Grid Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}>
            {/* Left Hero Content */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                background: 'var(--slate-muted)',
                color: '#7dd3fc',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stock-in)' }}>
                  bolt
                </span>
                Real-time Silicon Logistics Engine
              </div>

              <h1 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}>
                Build. Create.{' '}
                <span style={{ color: '#38bdf8' }}>Innovate.</span>
              </h1>

              <p style={{
                fontSize: '0.9375rem',
                color: '#cbd5e1',
                lineHeight: 1.5,
                maxWidth: '540px',
                marginBottom: '1.5rem',
              }}>
                Precision electronics and development components for hardware engineers, IoT specialists, and roboticists. 5-minute atomic stock locking on checkout.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link
                  to="/products"
                  className="btn-primary"
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.9375rem' }}
                >
                  <span>Explore Catalog</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_forward
                  </span>
                </Link>
                <Link
                  to="/orders"
                  className="btn-secondary"
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.9375rem',
                    background: 'var(--slate-muted)',
                    color: '#ffffff',
                    borderColor: 'var(--slate-surface)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#7dd3fc' }}>
                    receipt_long
                  </span>
                  <span>My Orders</span>
                </Link>
              </div>

              {/* Trust Badges Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.625rem',
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #1e293b',
              }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--stock-warning)', fontSize: '18px' }}>
                    timer
                  </span>
                  <div style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Guaranteed
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                    5-Min Lock
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--stock-in)', fontSize: '18px' }}>
                    local_shipping
                  </span>
                  <div style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Express
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                    4h Dispatch
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: '#38bdf8', fontSize: '18px' }}>
                    verified
                  </span>
                  <div style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Certified
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                    Lab Stock
                  </div>
                </div>
              </div>
            </div>

            {/* Right Telemetry Bench Card (Desktop Only) */}
            <div className="desktop-only">
              <div style={{
                background: 'var(--slate-muted)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                border: '1px solid var(--slate-surface)',
                boxShadow: 'var(--shadow-xl)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--stock-out)' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--stock-warning)' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--stock-in)' }}></div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', marginLeft: '0.25rem' }}>
                      MCU_TELEMETRY.SYS
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.6875rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: 'var(--stock-in)',
                    fontWeight: 700,
                  }}>
                    LIVE PING 12ms
                  </span>
                </div>

                <div style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  height: '220px',
                  marginBottom: '1rem',
                  background: 'var(--slate-dark)',
                }}>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIdGiIB-wJyLRSD44B08eCxDJ9UB-lBP_LMpK3FelFoJqbZoASLYPoVH8mO5eX1QkcEx3B0w7y8V08q1nTvnfDb6xdU4HcDf08gTSambDGpQE6geYjjI88fuE4vbrgG0-W-qY9xqMw96D0uLAkrdO29wUkhuC8voYNTJUNAlYGNVSXCmT2CwNlPHUv9W6MTozo-oGLNgSPB7UVWTNUM1XESyYDqelDal48kKddXhkKtuFguCbOJzYA"
                    alt="ESP32 Microcontroller PCB"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    left: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.9)',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                  }}>
                    PINOUT: ESP32-WROOM-32E
                  </div>
                </div>

                <div style={{
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--slate-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.375rem',
                      borderRadius: '6px',
                      background: 'rgba(37, 99, 235, 0.2)',
                      color: '#38bdf8',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        lock_clock
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                        Active Session Reservations
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                        Guaranteed Silicon Allocation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          POPULAR PRODUCTS SECTION (2-Column Mobile Grid)
          ============================================================ */}
      <section style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
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
                {activeCategory === 'All' ? 'Certified Inventory' : activeCategory}
              </span>
              <h2 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.375rem',
                fontWeight: 800,
                color: 'var(--slate-dark)',
              }}>
                Popular Products
              </h2>
            </div>
            <Link
              to="/products"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>View All</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Skeletons while loading */}
          {loading ? (
            <div className="mobile-2col-grid">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="spec-card" style={{ padding: '0.75rem' }}>
                  <div className="skeleton-box" style={{ width: '100%', aspectRatio: '4/3', marginBottom: '0.5rem' }} />
                  <div className="skeleton-box" style={{ width: '40%', height: '10px', marginBottom: '0.5rem' }} />
                  <div className="skeleton-box" style={{ width: '90%', height: '14px', marginBottom: '0.5rem' }} />
                  <div className="skeleton-box" style={{ width: '60%', height: '18px', marginBottom: '0.75rem' }} />
                  <div className="skeleton-box" style={{ width: '100%', height: '36px', borderRadius: '6px' }} />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: 'var(--card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-hairline)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-subtle)' }}>
                inventory_2
              </span>
              <h3 style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                No components found in this category
              </h3>
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="btn-primary"
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
              >
                Show All Categories
              </button>
            </div>
          ) : (
            <div className="mobile-2col-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
