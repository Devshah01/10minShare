import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div 
      onClick={toggleTheme}
      className="inline-flex items-center p-1 rounded-full bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800 cursor-pointer select-none transition-all shadow-inner"
      role="button"
      tabIndex={0}
      aria-label="Toggle theme"
      title="Toggle Light / Dark mode"
    >
      {/* Light option */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-200 ${
          !isDark
            ? 'bg-white text-zinc-900 font-bold shadow-sm'
            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </div>

      {/* Dark option */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-200 ${
          isDark
            ? 'bg-zinc-800 text-white font-bold shadow-sm'
            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </div>
    </div>
  );
}
