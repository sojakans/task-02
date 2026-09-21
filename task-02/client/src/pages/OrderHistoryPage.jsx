import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  Package,
  ChevronRight,
  Lock,
  Cpu,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/ui/Button';
import { StaggerGrid, StaggerItem } from '../components/animations/StaggerGrid';

const FILTER_TABS = ['ALL', 'PAID', 'RESERVED', 'CANCELLED', 'EXPIRED'];

export const OrderHistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-[#0d1527] border border-white/[0.08] rounded-3xl p-8 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-xl text-white">Sign In for Order Telemetry</h2>
          <p className="text-xs font-mono text-slate-400">
            Access your stock reservation timers, fulfillment tracking, and simulated refund history.
          </p>
          <div className="pt-2">
            <Link to="/login?redirect=/orders">
              <Button variant="primary" size="md" className="w-full">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-spin mb-4">
          <Cpu className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-slate-400">Retrieving order ledger records...</p>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (filterTab === 'ALL') return true;
    return order.status === filterTab;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>Fulfillment Ledger</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
            Order History & Telemetry
          </h1>
        </div>
        <Link to="/products">
          <Button variant="secondary" size="sm" iconLeft={<ShoppingBag className="w-3.5 h-3.5" />}>
            New Hardware Order
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = filterTab === tab;
          const count = orders.filter((o) => (tab === 'ALL' ? true : o.status === tab)).length;
          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              <span>{tab}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <StaggerGrid className="space-y-4">
          {filteredOrders.map((order) => (
            <StaggerItem key={order._id || order.orderId}>
              <div className="bg-[#0d1527]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-xl shadow-black/40 space-y-4">
                
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-white">
                      #{order.orderId?.slice(-8) || order._id?.slice(-8)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <StatusBadge status={order.status} type="order" />
                </div>

                {/* Items Preview */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex -space-x-3 overflow-hidden shrink-0">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg border-2 border-[#0d1527] object-cover bg-slate-800"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-xs font-mono text-slate-300 truncate">
                      <span>{order.items?.[0]?.name}</span>
                      {order.items?.length > 1 && (
                        <span className="text-cyan-400 ml-1">
                          +{order.items.length - 1} more item(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Total</span>
                      <span className="font-mono font-bold text-base text-white">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    <Link to={`/orders/${order.orderId}`}>
                      <Button
                        size="sm"
                        variant={order.status === 'RESERVED' ? 'glow' : 'secondary'}
                        iconRight={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        {order.status === 'RESERVED' ? 'Pay Now' : 'Telemetry'}
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      ) : (
        <div className="text-center py-16 bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-8 space-y-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-display font-bold text-lg text-white">No Orders Found</h3>
          <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
            {filterTab === 'ALL'
              ? "You haven't placed any hardware component orders yet."
              : `No orders currently match the "${filterTab}" filter.`}
          </p>
          <Link to="/products">
            <Button size="sm" variant="primary">
              Browse Components
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
};
