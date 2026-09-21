import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(function Input(
  {
    className,
    type = 'text',
    error,
    helperText,
    label,
    iconLeft,
    iconRight,
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {iconLeft && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {iconLeft}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full bg-[#0b1222]/80 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 transition-all duration-200 border outline-none",
            "border-white/[0.1] focus:border-cyan-500/60 focus:bg-[#0f172a] focus:ring-2 focus:ring-cyan-500/20",
            iconLeft && "pl-10",
            iconRight && "pr-10",
            error && "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20 text-rose-200",
            className
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {iconRight}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={cn("text-xs mt-1.5", error ? "text-rose-400 font-medium" : "text-slate-500")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});
