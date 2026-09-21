import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({
  children,
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  ...props
}) {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium tracking-wide",
    md: "text-xs px-2.5 py-1 font-semibold tracking-wider",
    lg: "text-sm px-3 py-1.5 font-semibold",
  };

  const variantStyles = {
    default: "bg-slate-800/80 text-slate-300 border-slate-700/80",
    primary: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]",
    secondary: "bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    danger: "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
    info: "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]",
  };

  const dotColors = {
    default: "bg-slate-400",
    primary: "bg-cyan-400",
    secondary: "bg-purple-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-blue-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md uppercase tracking-wider font-mono select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                dotColors[variant]
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              dotColors[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
