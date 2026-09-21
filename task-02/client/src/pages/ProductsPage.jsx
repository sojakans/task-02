import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpDown,
  DollarSign,
  AlertCircle,
  Package,
} from 'lucide-react';
import { productService } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { StaggerGrid, StaggerItem } from '../components/animations/StaggerGrid';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

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
  const activeFilterCount =
    (category !== 'All' ? 1 : 0) +
    (minPrice !== '' || maxPrice !== '' ? 1 : 0) +
    (availableOnly ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Silicon Catalog</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
            Hardware Inventory Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            {totalCount} active items synchronized with real-time stock allocation
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleOpenFilterSheet}
            className="flex-1"
            iconLeft={<SlidersHorizontal className="w-4 h-4 text-cyan-400" />}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </div>

      {/* Main Layout Grid: Sidebar Filters (desktop) + Product Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ============================================================
            DESKTOP FILTER SIDEBAR
            ============================================================ */}
        <aside className="hidden lg:block lg:col-span-3 bg-[#0a0f1d]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sticky top-24 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Filter Matrix
              </span>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold text-slate-400 block">
              Search Inventory
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SKU, keyword, model..."
                className="w-full bg-[#070b14] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Categories Radio/List */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono uppercase font-bold text-slate-400 block">
              Hardware Category
            </label>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
            <label className="text-xs font-mono uppercase font-bold text-slate-400 block">
              Price Range ($)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ($)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-[#070b14] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
              <input
                type="number"
                placeholder="Max ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-[#070b14] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 border-t border-white/[0.06]">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  availableOnly ? 'bg-cyan-500' : 'bg-slate-800 border border-white/10'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    availableOnly ? 'left-4' : 'left-1'
                  }`}
                />
              </div>
              <span className="text-xs font-mono text-slate-300">In-Stock Items Only</span>
            </label>
          </div>

        </aside>

        {/* ============================================================
            PRODUCT MATRIX COLUMN
            ============================================================ */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Controls Bar: Search & Sort for mobile/desktop */}
          <div className="bg-[#0a0f1d]/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Active filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {category !== 'All' && (
                <Badge variant="primary" size="sm" className="gap-1 cursor-pointer" onClick={() => setCategory('All')}>
                  <span>Category: {category}</span>
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {(minPrice || maxPrice) && (
                <Badge
                  variant="info"
                  size="sm"
                  className="gap-1 cursor-pointer"
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                >
                  <span>Price: ${minPrice || 0} - ${maxPrice || '∞'}</span>
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {availableOnly && (
                <Badge variant="success" size="sm" className="gap-1 cursor-pointer" onClick={() => setAvailableOnly(false)}>
                  <span>In-Stock Only</span>
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {activeFilterCount === 0 && (
                <span className="text-xs font-mono text-slate-400">Showing all components</span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <ArrowUpDown className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#070b14] border border-white/[0.08] text-xs font-mono text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-cyan-500/60 cursor-pointer"
              >
                <option value="newest">Sort: Newest Arrival</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

          </div>

          {/* Grid or Error State */}
          {error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs font-mono text-rose-300">{error}</p>
              <Button size="sm" variant="secondary" onClick={fetchProducts}>
                Retry Fetch
              </Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <StaggerItem key={product._id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          ) : (
            <div className="text-center py-20 bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-8 space-y-4">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-display font-bold text-lg text-white">No hardware matched criteria</h3>
              <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                Try widening your price range or clearing search keywords.
              </p>
              <Button size="sm" variant="primary" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </div>
          )}

        </main>

      </div>

      {/* ============================================================
          MOBILE BOTTOM SHEET FILTER MODAL
          ============================================================ */}
      <AnimatePresence>
        {filterSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterSheetOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#0d1527] border-t border-white/[0.1] rounded-t-3xl p-6 space-y-6 z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <span className="font-display font-bold text-base text-white">
                    Filter Hardware
                  </span>
                </div>
                <button
                  onClick={() => setFilterSheetOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category selector */}
              <div>
                <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTempCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono text-left ${
                        tempCategory === cat
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'bg-slate-900/60 text-slate-400 border border-white/[0.06]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price inputs */}
              <div>
                <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-2">
                  Price Limits ($)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={tempMinPrice}
                    onChange={(e) => setTempMinPrice(e.target.value)}
                    className="bg-[#070b14] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={tempMaxPrice}
                    onChange={(e) => setTempMaxPrice(e.target.value)}
                    className="bg-[#070b14] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="pt-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={tempAvailableOnly}
                    onChange={(e) => setTempAvailableOnly(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                  <span className="text-xs font-mono text-slate-300">In-Stock Only</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.08]">
                <Button variant="secondary" onClick={handleResetFilters}>
                  Reset
                </Button>
                <Button variant="primary" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
