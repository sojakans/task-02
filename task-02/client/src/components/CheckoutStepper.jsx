import React from 'react';
import { Check, Clock, CreditCard, ShoppingBag, CheckCircle2 } from 'lucide-react';

export const CheckoutStepper = ({ currentStep = 2 }) => {
  const steps = [
    { number: 1, title: 'Cart Queue', icon: ShoppingBag },
    { number: 2, title: 'Stock Hold', icon: Clock },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Logistics', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full py-4 mb-8">
      <div className="flex items-center justify-between relative max-w-lg mx-auto">
        {/* Track bar */}
        <div className="absolute left-6 right-6 top-1/2 transform -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
        <div
          className="absolute left-6 top-1/2 transform -translate-y-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 -z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 88}%` }}
        />

        {steps.map((step) => {
          const isDone = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex flex-col items-center z-10">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : isCurrent
                    ? 'bg-[#0d1527] border-2 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-[#0a0f1d] border border-white/10 text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[10px] font-mono tracking-wider uppercase mt-1.5 ${
                  isCurrent ? 'text-cyan-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
