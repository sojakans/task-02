import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, ArrowRight, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { TiltCard } from './3d/TiltCard';
import { Button } from './ui/Button';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.availableStock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    const res = await addToCart(product._id, 1);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      toast.success(`Added 1x ${product.name} to cart!`);
      setTimeout(() => setAdded(false), 2000);
    } else {
      toast.error(res.message || 'Could not add to cart');
    }
  };

  return (
    <TiltCard
      maxTilt={6}
      className="group flex flex-col h-full bg-[#0d1527]/80 hover:bg-[#111c34]/90 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl transition-all duration-300 shadow-xl shadow-black/40 hover:shadow-[0_12px_32px_rgba(6,182,212,0.18)] overflow-hidden"
    >
      {/* Product Image Stage */}
      <Link
        to={`/products/${product._id}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#0a0f1d] border-b border-white/[0.06]"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1527] via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Stock Badge Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={product.availableStock} type="stock" />
        </div>

        {/* SKU Badge Top Left */}
        {product.sku && (
          <span className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md">
            {product.sku}
          </span>
        )}

        {/* Quick View Button floating on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/90 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-cyan-500/40 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>VIEW SPECS</span>
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category Tag */}
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400/90 uppercase tracking-wider mb-1">
            <span>{product.category}</span>
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product._id}`}
            className="block font-display font-bold text-sm sm:text-base text-white hover:text-cyan-300 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Key Specs snippet if available */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(product.specifications).slice(0, 2).map(([key, val]) => (
                <span
                  key={key}
                  className="inline-block text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] text-slate-400 px-1.5 py-0.5 rounded"
                >
                  {val}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Unit Price
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
              {formatCurrency(product.price)}
            </span>
          </div>

          <Button
            size="sm"
            variant={added ? 'secondary' : isOutOfStock ? 'ghost' : 'primary'}
            disabled={isOutOfStock || adding}
            onClick={handleAddToCart}
            className="shrink-0"
            iconLeft={
              added ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )
            }
          >
            {isOutOfStock ? 'Sold Out' : added ? 'Added' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </TiltCard>
  );
};
