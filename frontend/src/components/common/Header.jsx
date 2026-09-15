import React from 'react';
import { Clock, ShieldCheck, Zap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header({ onLogoClick }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#080b11]/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
            <Clock className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
              10min<span className="gradient-text">share</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 -mt-1">
              Ephemeral Storage
            </span>
          </div>
        </button>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>Auto Self-Destruct in 10 Min</span>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
