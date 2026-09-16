import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { useCart } from '../context/CartContext';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        if (data.success && data.product) {
          setProduct(data.product);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Product not found or unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const isOutOfStock = !product || product.availableStock <= 0;
  const maxAllowedQuantity = product ? Math.max(1, product.availableStock) : 1;

  const handleIncrement = () => {
    if (quantity < maxAllowedQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) return;

    setAdding(true);
    setFeedback(null);

    const res = await addToCart(product._id, quantity);
    setAdding(false);

    if (res.success) {
      setFeedback({ type: 'success', text: `Added ${quantity} × ${product.name} to cart!` });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  // Mobile Skeleton Loader
  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
        <div className="skeleton-box" style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem' }} />
        <div className="skeleton-box" style={{ width: '40%', height: '16px', marginBottom: '0.75rem' }} />
        <div className="skeleton-box" style={{ width: '85%', height: '28px', marginBottom: '1rem' }} />
        <div className="skeleton-box" style={{ width: '50%', height: '32px', marginBottom: '1.5rem' }} />
        <div className="skeleton-box" style={{ width: '100%', height: '80px', marginBottom: '1.5rem' }} />
        <div className="skeleton-box" style={{ width: '100%', height: '50px', borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: 'var(--card)',
          padding: '2rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>
            error
          </span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '1rem', fontSize: '1.25rem', color: 'var(--slate-dark)' }}>
            {error || 'Component Not Found'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            The requested hardware identifier could not be verified in the silicon registry.
          </p>
          <Link to="/products" className="btn-primary" style={{ padding: '0.75rem 1.5rem', minHeight: '44px' }}>
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="has-sticky-action" style={{ padding: '1.5rem 0 3rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Breadcrumb Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'var(--text-muted)' }}>Products</Link>
          <span>/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: 'var(--text-muted)' }}>
            {product.category}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--slate-dark)', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Mobile Vertical Sequence & Desktop Two-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* 1. Product Image Card */}
          <div>
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-hairline)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              aspectRatio: '4 / 3',
            }}>
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                }}
              />
              {product.sku && (
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#f8fafc',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '6px',
                  backdropFilter: 'blur(4px)',
                }}>
                  SKU: {product.sku}
                </div>
              )}
            </div>

            {/* Live Logistics Guarantee Box */}
            <div style={{
              marginTop: '1rem',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--card-subtle)',
              border: '1px solid var(--border-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>
                  verified
                </span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                    Certified Factory Lot Stock
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Guaranteed 5-min checkout reservation hold
                  </div>
                </div>
              </div>
              <span className="badge-stock-in" style={{ fontSize: '0.6875rem' }}>Active</span>
            </div>
          </div>

          {/* 2. Product Information & Actions */}
          <div>
            {/* Category & Status Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--secondary)',
              }}>
                {product.category}
              </span>
              <StatusBadge status={product.availableStock} type="stock" />
            </div>

            {/* Product Name */}
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.625rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
              lineHeight: 1.25,
              marginBottom: '0.75rem',
            }}>
              {product.name}
            </h1>

            {/* Price Card */}
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--border-hairline)',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Direct Unit Price
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.875rem',
                  fontWeight: 800,
                  color: 'var(--slate-dark)',
                }}>
                  {formatCurrency(product.price)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  (all taxes included)
                </span>
              </div>
            </div>

            {/* Availability */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isOutOfStock ? 'var(--stock-out)' : 'var(--stock-in)' }}>
                {isOutOfStock ? 'cancel' : 'check_circle'}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isOutOfStock ? 'var(--stock-out-text)' : 'var(--stock-in-text)' }}>
                {isOutOfStock ? 'Currently Out of Stock' : `${product.availableStock} Units Available for Immediate Dispatch`}
              </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Description
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                {product.description}
              </p>
            </div>

            {/* Quantity Selector Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.5rem', display: 'block' }}>
                Quantity:
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Stepper with Large Touch Targets (Min 44px) */}
                <div className="touch-stepper">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="stepper-value">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= maxAllowedQuantity || isOutOfStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Total: <strong>{formatCurrency(product.price * quantity)}</strong>
                </span>
              </div>
            </div>

            {/* Desktop Add to Cart Button */}
            <div className="desktop-only" style={{ marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem 1.5rem', fontSize: '1rem', minHeight: '48px' }}
              >
                <span className="material-symbols-outlined">add_shopping_cart</span>
                {adding
                  ? 'Validating Stock...'
                  : isOutOfStock
                  ? 'Out of Stock'
                  : `Add ${quantity} Unit(s) to Cart — ${formatCurrency(product.price * quantity)}`}
              </button>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: feedback.type === 'success' ? 'var(--stock-in-bg)' : 'var(--stock-out-bg)',
                color: feedback.type === 'success' ? 'var(--stock-in-text)' : 'var(--stock-out-text)',
                border: `1px solid ${feedback.type === 'success' ? 'var(--stock-in-border)' : 'var(--stock-out-border)'}`,
                marginBottom: '1.5rem',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {feedback.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>{feedback.text}</span>
                {feedback.type === 'success' && (
                  <Link
                    to="/cart"
                    style={{
                      marginLeft: 'auto',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View Cart →
                  </Link>
                )}
              </div>
            )}

            {/* Hardware Specification Sheet */}
            {product.specs && (
              <div style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-hairline)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  background: 'var(--card-subtle)',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border-hairline)',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: 'var(--slate-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                    description
                  </span>
                  Hardware Specifications
                </div>

                <div style={{ padding: '0.25rem 1rem' }}>
                  {Object.entries(product.specs).map(([key, val]) => {
                    if (!val) return null;
                    const formattedVal = Array.isArray(val) ? val.join(', ') : val;
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase());

                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          borderBottom: '1px solid #f1f5f9',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                        <span style={{ fontWeight: 600, color: 'var(--slate-dark)', fontFamily: 'monospace' }}>
                          {formattedVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          MOBILE STICKY BOTTOM ACTION BAR (Requirement 5)
          Large tap button (min 48px), total amount & Add to Cart
          ============================================================ */}
      <div className="mobile-sticky-action-bar">
        <div>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
            Total ({quantity} item)
          </span>
          <span style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1.1875rem',
            fontWeight: 800,
            color: 'var(--slate-dark)',
          }}>
            {formatCurrency(product.price * quantity)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          className="btn-primary"
          style={{
            flex: 1,
            minHeight: '48px',
            fontSize: '0.9375rem',
            padding: '0.75rem 1rem',
          }}
          aria-label={`Add ${quantity} to cart`}
        >
          {adding ? (
            <>
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
                sync
              </span>
              <span>Adding...</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : (
            <>
              <span className="material-symbols-outlined">add_shopping_cart</span>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
