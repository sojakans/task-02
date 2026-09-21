import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ToastContainer({ toasts, onDismiss }) {
  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borderMap = {
    success: "border-emerald-500/30 bg-[#062419]/90 shadow-emerald-500/10",
    error: "border-rose-500/30 bg-[#2b0c14]/90 shadow-rose-500/10",
    warning: "border-amber-500/30 bg-[#291e0a]/90 shadow-amber-500/10",
    info: "border-cyan-500/30 bg-[#07202b]/90 shadow-cyan-500/10",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-xl",
              borderMap[toast.type || 'info']
            )}
          >
            {iconMap[toast.type || 'info']}
            <div className="flex-1 text-xs">
              {toast.title && <p className="font-semibold text-white font-display mb-0.5">{toast.title}</p>}
              <p className="text-slate-200">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
