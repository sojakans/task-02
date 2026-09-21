import React from 'react';
import { Timer, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { CountdownCircle } from './animations/CountdownCircle';

export const ReservationCountdown = ({ expiresAt, onExpire }) => {
  const { formattedTime, secondsLeft, isExpired } = useCountdown(expiresAt, onExpire);

  const isWarning = secondsLeft <= 60 && !isExpired;

  if (isExpired) {
    return (
      <div className="bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl p-6 text-center shadow-xl shadow-rose-950/30 space-y-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-rose-300">
            Stock Reservation Hold Expired
          </h3>
          <p className="text-xs font-mono text-slate-300 mt-1 max-w-md mx-auto">
            Your 5-minute allocation window has elapsed. Unsettled inventory has been returned automatically to the global pool.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 border mb-6 relative overflow-hidden ${
        isWarning
          ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
          : 'bg-[#0d1527]/90 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.12)]'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left Info */}
        <div className="text-center sm:text-left space-y-1.5">
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isWarning ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isWarning ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
              />
            </span>
            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isWarning ? 'text-amber-400' : 'text-cyan-400'
              }`}
            >
              Atomic Stock Lock Active
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">
            Guaranteed Inventory Hold
          </h3>
          <p className="text-xs text-slate-300 font-mono max-w-sm">
            Complete settlement before expiration to ensure your components are not reallocated.
          </p>
        </div>

        {/* Right Radial Timer */}
        <div className="flex flex-col items-center shrink-0">
          <CountdownCircle
            secondsLeft={secondsLeft}
            totalSeconds={300}
            size={84}
            strokeWidth={6}
          />
          <span
            className={`text-[10px] font-mono tracking-widest uppercase mt-2 font-bold ${
              isWarning ? 'text-amber-400 animate-pulse' : 'text-slate-400'
            }`}
          >
            {isWarning ? 'EXPIRING SOON' : 'RESERVATION TIME'}
          </span>
        </div>
      </div>
    </div>
  );
};
