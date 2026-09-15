import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {/* Mobile Minimal Bold Button */}
      <button
        onClick={toggleTheme}
        className="sm:hidden p-2 text-zinc-900 dark:text-white focus:outline-none transition-all flex items-center justify-center active:scale-90 font-extrabold"
        aria-label="Toggle theme"
        title="Toggle Light / Dark mode"
      >
        {isDark ? (
          <Sun className="w-5 h-5 stroke-[2.8]" />
        ) : (
          <Moon className="w-5 h-5 stroke-[2.8]" />
        )}
      </button>

      {/* Desktop Segmented Pill */}
      <div 
        onClick={toggleTheme}
        className="hidden sm:inline-flex items-center p-1 rounded-full bg-zinc-200/80 dark:bg-zinc-900 cursor-pointer select-none transition-all shadow-inner font-extrabold"
        role="button"
        tabIndex={0}
        aria-label="Toggle theme"
        title="Toggle Light / Dark mode"
      >
        {/* Light option */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-tight transition-all duration-200 ${
            !isDark
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Light</span>
        </div>

        {/* Dark option */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-tight transition-all duration-200 ${
            isDark
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Dark</span>
        </div>
      </div>
    </>
  );
}
