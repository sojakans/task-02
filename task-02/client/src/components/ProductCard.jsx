import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);

  const isOutOfStock = product.availableStock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    const res = await addToCart(product._id, 1);
    setAdding(false);

    if (res.success) {
      setMessage('Added to cart!');
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage(res.message);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div
      className="spec-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Product Image Header */}
      <Link
        to={`/products/${product._id}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#f1f5f9',
          display: 'block',
          aspectRatio: '4 / 3',
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Availability Badge floating over image on mobile */}
        <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem' }}>
          <StatusBadge status={product.availableStock} type="stock" />
        </div>

        {product.sku && (
          <span
            className="desktop-only"
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              left: '0.5rem',
              background: 'rgba(15, 23, 42, 0.85)',
              color: '#f8fafc',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backdropFilter: 'blur(4px)',
              fontFamily: 'monospace',
            }}
          >
            {product.sku}
          </span>
        )}
      </Link>

      {/* Card Body */}
      <div
        style={{
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Category Tag */}
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--secondary)',
            marginBottom: '0.25rem',
          }}>
            {product.category}
          </div>

          {/* Product Title */}
          <Link to={`/products/${product._id}`} style={{ display: 'block' }}>
            <h3
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--slate-dark)',
                lineHeight: 1.3,
                marginBottom: '0.375rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.4rem',
              }}
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>

          {/* Desktop Hardware Specs Pills */}
          {product.specs && (
            <div className="desktop-flex" style={{ flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
              {product.specs.architecture && (
                <span style={{
                  fontSize: '0.6875rem',
                  background: 'var(--card-subtle)',
                  color: 'var(--slate-dark)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-hairline)',
                }}>
                  {product.specs.architecture}
                </span>
              )}
              {product.specs.clockSpeed && (
                <span style={{
                  fontSize: '0.6875rem',
                  background: 'var(--card-subtle)',
                  color: 'var(--slate-dark)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-hairline)',
                }}>
                  {product.specs.clockSpeed}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action Area */}
        <div style={{
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-hairline)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.125rem',
                fontWeight: 800,
                color: 'var(--slate-dark)',
              }}>
                {formatCurrency(product.price)}
              </span>
            </div>
            <Link
              to={`/products/${product._id}`}
              className="desktop-only"
              style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              Specs →
            </Link>
          </div>

          {/* Add to Cart Button (Touch Friendly) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              minHeight: '40px',
              borderRadius: 'var(--radius-md)',
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            {adding ? (
              <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>
                sync
              </span>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  add_shopping_cart
                </span>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div style={{
            marginTop: '0.375rem',
            fontSize: '0.6875rem',
            textAlign: 'center',
            padding: '0.2rem 0.4rem',
            borderRadius: '4px',
            background: message.includes('Added') ? 'var(--stock-in-bg)' : 'var(--stock-out-bg)',
            color: message.includes('Added') ? 'var(--stock-in-text)' : 'var(--stock-out-text)',
            border: `1px solid ${message.includes('Added') ? 'var(--stock-in-border)' : 'var(--stock-out-border)'}`,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
