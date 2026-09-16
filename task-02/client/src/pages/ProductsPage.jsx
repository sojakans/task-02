import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const CATEGORIES = ['All', 'Microcontrollers', 'Sensors', 'Displays', 'Robotics'];

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Mobile Bottom Sheet Filter Modal State
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Temporary filter state for bottom sheet before applying
  const [tempCategory, setTempCategory] = useState(category);
  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);
  const [tempAvailableOnly, setTempAvailableOnly] = useState(availableOnly);

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state if URL query params change externally
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        minPrice: minPrice !== '' ? minPrice : undefined,
        maxPrice: maxPrice !== '' ? maxPrice : undefined,
        available: availableOnly ? 'true' : undefined,
        sort,
      };

      const data = await productService.getProducts(params);
      if (data.success) {
        setProducts(data.products);
        setTotalCount(data.total);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load components from backend. Ensure the server is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, availableOnly, sort, minPrice, maxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearSearch = () => {
    setSearch('');
    // Trigger immediate fetch with empty search
    setTimeout(() => fetchProducts(), 0);
  };

  const handleOpenFilterSheet = () => {
    setTempCategory(category);
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
    setTempAvailableOnly(availableOnly);
    setFilterSheetOpen(true);
  };

  const handleApplyFilters = () => {
    setCategory(tempCategory);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setAvailableOnly(tempAvailableOnly);
    setFilterSheetOpen(false);
  };

  const handleResetFilters = () => {
    setTempCategory('All');
    setTempMinPrice('');
    setTempMaxPrice('');
    setTempAvailableOnly(false);

    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setAvailableOnly(false);
    setSort('newest');
    setSearchParams({});
    setFilterSheetOpen(false);
  };

  // Count active filters for badge
  const activeFilterCount = (category !== 'All' ? 1 : 0) +
    (minPrice !== '' || maxPrice !== '' ? 1 : 0) +
    (availableOnly ? 1 : 0);

  return (
    <div style={{ padding: '1.5rem 0 5rem 0' }}>
      <div className="container">
        {/* ============================================================
            PAGE HEADER & SEARCH BAR
            ============================================================ */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="desktop-only" style={{ marginBottom: '1rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--primary)',
              display: 'block',
              marginBottom: '0.25rem',
            }}>
              Discovery Engine
            </span>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
            }}>
              Hardware Components Catalog
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              Parametric search across microcontrollers, sensor packages, and robotics modules.
            </p>
          </div>

          {/* Large Full-Width Search Input (Requirement 3) */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '1rem' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)',
                fontSize: '22px',
                pointerEvents: 'none',
              }}
            >
              search
            </span>
            <input
              type="text"
              className="input-field"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: '2.75rem',
                paddingRight: search ? '4.5rem' : '1rem',
                fontSize: '0.9375rem',
                borderRadius: 'var(--radius-md)',
                height: '46px',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '3rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Clear Search Text"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  close
                </span>
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{
                position: 'absolute',
                right: '0.375rem',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8125rem',
                height: '36px',
              }}
            >
              Search
            </button>
          </form>

          {/* Horizontally Scrollable Category Chips (Mobile Requirement 2) */}
          <div className="mobile-only" style={{ marginBottom: '1rem' }}>
            <div className="category-chips-bar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`chip-item ${category === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Toolbar: [ Filter ] button + Sort dropdown + Results Count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'var(--card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-hairline)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {/* Mobile Filter Sheet Trigger Button (Requirement 4) */}
            <div className="mobile-only">
              <button
                type="button"
                onClick={handleOpenFilterSheet}
                className="btn-secondary"
                style={{
                  padding: '0.45rem 0.875rem',
                  fontSize: '0.8125rem',
                  minHeight: '38px',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                  tune
                </span>
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '0.25rem',
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Results Count */}
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <strong>{products.length}</strong> items
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span className="desktop-only" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Sort:
              </span>
              <select
                className="input-field"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.8125rem',
                  width: 'auto',
                  minHeight: '38px',
                }}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A–Z</option>
                <option value="stock_desc">Highest Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================
            MAIN CONTENT: DESKTOP SIDEBAR + RESPONSIVE PRODUCT GRID
            ============================================================ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '1.5rem',
          alignItems: 'start',
        }}>
          {/* Main Grid Area */}
          <main>
            {/* Loading Skeletons */}
            {loading ? (
              <div className="mobile-2col-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                  <div key={idx} className="spec-card" style={{ padding: '0.75rem' }}>
                    <div className="skeleton-box" style={{ width: '100%', aspectRatio: '4/3', marginBottom: '0.5rem' }} />
                    <div className="skeleton-box" style={{ width: '40%', height: '10px', marginBottom: '0.5rem' }} />
                    <div className="skeleton-box" style={{ width: '90%', height: '14px', marginBottom: '0.5rem' }} />
                    <div className="skeleton-box" style={{ width: '60%', height: '18px', marginBottom: '0.75rem' }} />
                    <div className="skeleton-box" style={{ width: '100%', height: '38px', borderRadius: '6px' }} />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                background: 'var(--stock-out-bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--stock-out-border)',
                color: 'var(--stock-out-text)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>error</span>
                <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>{error}</p>
                <button onClick={fetchProducts} className="btn-secondary" style={{ marginTop: '1rem' }}>
                  Retry Query
                </button>
              </div>
            ) : products.length === 0 ? (
              /* No-Results State (Requirement 3 & 18) */
              <div style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                background: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-hairline)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-subtle)' }}>
                  search_off
                </span>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginTop: '0.75rem', color: 'var(--slate-dark)' }}>
                  No products found
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '360px', margin: '0.25rem auto 1.25rem' }}>
                  No hardware matches your search "{search}". Try clearing search or resetting filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-primary"
                  style={{ padding: '0.625rem 1.25rem' }}
                >
                  Clear Search & Filters
                </button>
              </div>
            ) : (
              /* 2-Column Mobile Grid (Requirement 2) */
              <div className="mobile-2col-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================
          MOBILE BOTTOM SHEET FILTER MODAL (Requirement 4)
          ============================================================ */}
      {filterSheetOpen && (
        <div className="bottom-sheet-overlay" onClick={() => setFilterSheetOpen(false)}>
          <div
            className="bottom-sheet-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-heading"
          >
            {/* Grab handle */}
            <div className="bottom-sheet-handle" />

            {/* Sheet Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--border-hairline)',
            }}>
              <h3 id="filter-heading" style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--slate-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
                  tune
                </span>
                Filter Products
              </h3>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
                aria-label="Close filters"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  close
                </span>
              </button>
            </div>

            {/* Sheet Body (Scrollable) */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Category */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.5rem', display: 'block' }}>
                  Category
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTempCategory(cat)}
                      className={`chip-item ${tempCategory === cat ? 'active' : ''}`}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.5rem', display: 'block' }}>
                  Price Range (₹)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      placeholder="Min Price"
                      className="input-field"
                      value={tempMinPrice}
                      onChange={(e) => setTempMinPrice(e.target.value)}
                    />
                  </div>
                  <span style={{ color: 'var(--text-subtle)', fontWeight: 700 }}>—</span>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      placeholder="Max Price"
                      className="input-field"
                      value={tempMaxPrice}
                      onChange={(e) => setTempMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-hairline)' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--slate-dark)',
                  padding: '0.5rem 0',
                }}>
                  <input
                    type="checkbox"
                    checked={tempAvailableOnly}
                    onChange={(e) => setTempAvailableOnly(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border-hairline)',
              background: 'var(--card-subtle)',
              display: 'flex',
              gap: '0.75rem',
            }}>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary"
                style={{ flex: 1, minHeight: '46px', fontSize: '0.9375rem' }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="btn-primary"
                style={{ flex: 2, minHeight: '46px', fontSize: '0.9375rem' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
