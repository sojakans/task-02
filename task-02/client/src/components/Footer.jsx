import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ShieldCheck, Clock, RefreshCw, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#050810] border-t border-white/[0.08] text-slate-400 font-sans mt-auto pb-20 md:pb-8 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-display font-bold text-base tracking-wider text-white">
                TECH<span className="text-cyan-400">LOOM</span> MAKERS
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-body">
              Precision silicon logistics and rapid component fulfillment engineered for hardware hackers, roboticists, and embedded system architects.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>INVENTORY CLUSTERS ONLINE</span>
            </div>
          </div>

          {/* Quick Hardware Catalog */}
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-500 pl-2">
              Hardware Directory
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link to="/products?category=Microcontrollers" className="hover:text-cyan-400 transition-colors">
                  &gt; Microcontrollers & Dev Boards
                </Link>
              </li>
              <li>
                <Link to="/products?category=Sensors" className="hover:text-cyan-400 transition-colors">
                  &gt; Environmental & IMU Sensors
                </Link>
              </li>
              <li>
                <Link to="/products?category=Displays" className="hover:text-cyan-400 transition-colors">
                  &gt; Precision OLED & TFT Displays
                </Link>
              </li>
              <li>
                <Link to="/products?category=Robotics" className="hover:text-cyan-400 transition-colors">
                  &gt; Actuators & Motor Controllers
                </Link>
              </li>
            </ul>
          </div>

          {/* Assessment Architecture Specs */}
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-purple-500 pl-2">
              Platform Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Idempotency-Shielded Payments</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>5-Minute Stock Reservation</span>
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Simulated Refunds & Cancellation</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Atomic Inventory Decrements</span>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-500 pl-2">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link to="/orders" className="hover:text-cyan-400 transition-colors">
                  &gt; Track Your Orders
                </Link>
              </li>
              <li>
                <span className="hover:text-cyan-400 transition-colors cursor-pointer">
                  &gt; Shipping & Returns
                </span>
              </li>
              <li>
                <span className="hover:text-cyan-400 transition-colors cursor-pointer">
                  &gt; FAQs & Help Center
                </span>
              </li>
              <li>
                <span className="hover:text-cyan-400 transition-colors cursor-pointer">
                  &gt; Contact Us
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>&copy; {new Date().getFullYear()} TECHLOOM STORE. Engineered for maker electronics.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors">PRIVACY SPEC</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors">HARDWARE TERMS</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors">SECURITY AUDIT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
