import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LogoIcon } from './LogoIcon';

export function Header({ onLogoClick }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b-[2.5px] border-zinc-500 dark:border-zinc-400 bg-zinc-200/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo - Pill shaped container with icon in front of text */}
        <button 
          onClick={onLogoClick}
          className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-white border border-zinc-800 dark:border-zinc-200 shadow-sm flex items-center gap-2.5 group focus:outline-none hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all"
        >
          <LogoIcon className="w-6 h-6 shrink-0 text-white dark:text-zinc-900 transition-transform group-hover:scale-105" />
          <span className="font-display font-extrabold text-base tracking-tight text-white dark:text-zinc-900">
            10min<span className="font-light text-zinc-400 dark:text-zinc-500">share</span>
          </span>
        </button>

        {/* Theme Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
