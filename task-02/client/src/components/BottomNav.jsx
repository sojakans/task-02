import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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
    {
      label: 'Home',
      path: '/',
      icon: 'home',
    },
    {
      label: 'Products',
      path: '/products',
      icon: 'grid_view',
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: 'shopping_bag',
      badge: itemCount > 0 ? itemCount : null,
    },
    {
      label: 'Orders',
      path: '/orders',
      icon: 'receipt_long',
    },
    {
      label: isAuthenticated ? 'Profile' : 'Sign In',
      path: isAuthenticated ? '/orders' : '/login',
      icon: isAuthenticated ? 'person' : 'account_circle',
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`mobile-nav-item ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <div className="nav-icon-wrap">
              <span className="material-symbols-outlined">
                {item.icon}
              </span>
              {item.badge && (
                <span className="mobile-nav-badge">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
