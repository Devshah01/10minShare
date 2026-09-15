import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header({ onLogoClick }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo - Monochrome Minimal */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 group focus:outline-none"
        >
          <span className="font-display font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white transition-opacity group-hover:opacity-80">
            10min<span className="font-light text-zinc-500 dark:text-zinc-400">share</span>
          </span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            <span>Auto Self-Destruct in 10m</span>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
