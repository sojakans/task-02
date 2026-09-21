import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Card({
  children,
  className,
  variant = 'default',
  interactive = false,
  onClick,
  ...props
}) {
  const variants = {
    default: "bg-[#0d1527]/70 backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/40",
    elevated: "bg-[#111c34]/80 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/50",
    glow: "bg-[#0d1527]/70 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.12)]",
    flat: "bg-slate-900/50 border border-white/[0.05]",
  };

  const Component = interactive ? motion.div : 'div';
  const interactiveProps = interactive ? {
    whileHover: { y: -4, transition: { duration: 0.2 } },
    className: cn(
      "rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_12px_30px_rgba(6,182,212,0.15)] cursor-pointer",
      variants[variant],
      className
    ),
    onClick,
    ...props
  } : {
    className: cn("rounded-2xl overflow-hidden transition-all duration-200", variants[variant], className),
    onClick,
    ...props
  };

  return <Component {...interactiveProps}>{children}</Component>;
}

export function CardHeader({ children, className, ...props }) {
  return <div className={cn("p-6 pb-3 border-b border-white/[0.06]", className)} {...props}>{children}</div>;
}

export function CardContent({ children, className, ...props }) {
  return <div className={cn("p-6", className)} {...props}>{children}</div>;
}

export function CardFooter({ children, className, ...props }) {
  return <div className={cn("p-6 pt-3 border-t border-white/[0.06] flex items-center justify-between", className)} {...props}>{children}</div>;
}
