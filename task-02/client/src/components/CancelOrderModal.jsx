import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

export const CancelOrderModal = ({ order, isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('Ordered wrong chip / architecture variant');

  if (!order) return null;

  const isPaid = order.status === 'PAID';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cancel Order #${order.orderId?.slice(-8) || order.orderId}`}
      description="Hardware Inventory Reallocation Protocol"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">Release Stock Reservation</span>
            {isPaid ? (
              <p>
                Because payment of <strong className="text-white">{formatCurrency(order.totalAmount)}</strong> was confirmed, an automatic simulated refund will be generated and components returned to stock.
              </p>
            ) : (
              <p>
                The held stock units will be released back immediately to the active hardware catalog.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1.5">
            Cancellation Rationale
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-[#070b14] border border-white/[0.1] focus:border-cyan-500/60 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none cursor-pointer"
          >
            <option value="Ordered wrong chip / architecture variant">Ordered wrong chip / architecture variant</option>
            <option value="Pinout incompatible with custom PCB carrier">Pinout incompatible with custom PCB carrier</option>
            <option value="Lead time / project deadline requirement changed">Lead time / project deadline requirement changed</option>
            <option value="Found alternate vendor / surplus stock">Found alternate vendor / surplus stock</option>
            <option value="Evaluation / test session completed">Evaluation / test session completed</option>
          </select>
        </div>

        {/* Refund Breakdown */}
        <div className="bg-[#070b14] border border-white/[0.08] rounded-xl p-3.5 font-mono text-xs space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Order Value:</span>
            <span className="text-white font-bold">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Refund Protocol:</span>
            <span className={isPaid ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {isPaid ? '100% Full Refund Simulated' : 'No Payment Settled'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Keep Order
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => onConfirm(reason)}
            disabled={loading}
            isLoading={loading}
          >
            Cancel & Return Stock
          </Button>
        </div>
      </div>
    </Modal>
  );
};
