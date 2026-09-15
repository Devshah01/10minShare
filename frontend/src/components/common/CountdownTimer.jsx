import React from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';

export function CountdownTimer({ initialSeconds = 600, onExpire }) {
  const { formattedTime, secondsLeft, isExpired } = useCountdown(initialSeconds, onExpire);

  const isLowTime = secondsLeft < 120 && secondsLeft > 0;

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>EXPIRED</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs tracking-wide transition-all duration-200 border ${
      isLowTime
        ? 'bg-zinc-900 text-white border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 animate-pulse'
        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800'
    }`}>
      <Timer className="w-3.5 h-3.5" />
      <span>{formattedTime}</span>
      <span className="text-[10px] font-sans font-normal uppercase opacity-60">left</span>
    </div>
  );
}
