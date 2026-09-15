import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LogoIcon } from './LogoIcon';

export function Header({ onLogoClick }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo - Pill shaped container with icon in front of text */}
        <button 
          onClick={onLogoClick}
          className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-2.5 group focus:outline-none hover:bg-zinc-200/70 dark:hover:bg-zinc-800/70 transition-all"
        >
          <LogoIcon className="w-5 h-5 text-zinc-900 dark:text-white transition-transform group-hover:scale-105" />
          <span className="font-display font-extrabold text-base tracking-tight text-zinc-900 dark:text-white">
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
