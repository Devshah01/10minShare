import React from 'react';

export function LogoIcon({ className = "w-5 h-5 text-zinc-900 dark:text-white" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Central Dial Knob */}
      <circle cx="50" cy="50" r="11" />

      {/* Dial Needle pointing up-right */}
      <path
        d="M 45 46 L 68 24 C 70 22, 72 25, 70 27 L 53 53 Z"
      />

      {/* Arc Dots representing 10-minute dial */}
      <circle cx="66" cy="12" r="3.5" />
      <circle cx="47" cy="12" r="5" />
      <circle cx="29" cy="21" r="6" />
      <circle cx="17" cy="37" r="6.5" />
      <circle cx="16" cy="61" r="7" />
      <circle cx="29" cy="78" r="8" />
      <circle cx="51" cy="85" r="9" />
      <circle cx="76" cy="73" r="11.5" />
    </svg>
  );
}
