import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  iconLeft,
  iconRight,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b14] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer overflow-hidden";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
    icon: "p-2.5",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:from-cyan-400 hover:to-blue-500 active:from-cyan-600 active:to-blue-700 border border-cyan-400/30",
    secondary: "bg-slate-800/80 backdrop-blur-md text-slate-200 hover:text-white hover:bg-slate-700/80 border border-slate-700/80 hover:border-slate-600 shadow-sm",
    outline: "bg-transparent text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]",
    ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-white/5",
    danger: "bg-rose-500/15 text-rose-300 hover:text-rose-100 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/60 shadow-lg shadow-rose-500/10",
    glow: "bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] border border-white/20",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        iconLeft && <span className="inline-flex shrink-0">{iconLeft}</span>
      )}
      <span>{children}</span>
      {!isLoading && iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </motion.button>
  );
}
