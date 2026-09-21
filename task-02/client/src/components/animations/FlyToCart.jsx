import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export function CartPulseBadge({ count = 0 }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950 font-mono shadow-[0_0_10px_rgba(6,182,212,0.8)]"
      >
        {count}
      </motion.span>
    </AnimatePresence>
  );
}
