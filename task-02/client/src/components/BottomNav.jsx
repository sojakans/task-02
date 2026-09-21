import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, ReceiptText, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartPulseBadge } from './animations/FlyToCart';

export const BottomNav = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Catalog', path: '/products', icon: Grid },
    { label: 'Cart', path: '/cart', icon: ShoppingBag, badge: itemCount },
    { label: 'Orders', path: '/orders', icon: ReceiptText },
    { label: isAuthenticated ? 'Profile' : 'Sign In', path: isAuthenticated ? '/orders' : '/login', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/90 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5" aria-label="Mobile Navigation">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <CartPulseBadge count={item.badge} />
                )}
              </div>
              <span className={`text-[10px] font-mono tracking-wider mt-1 ${active ? 'font-bold text-cyan-300' : 'font-medium'}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute -bottom-1 w-5 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_6px_#06b6d4]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
