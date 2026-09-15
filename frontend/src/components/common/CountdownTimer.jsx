import React from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';

export function CountdownTimer({ initialSeconds = 600, onExpire }) {
  const { formattedTime, secondsLeft, isExpired } = useCountdown(initialSeconds, onExpire);

  const isLowTime = secondsLeft < 120 && secondsLeft > 0;

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold animate-pulse">
        <AlertTriangle className="w-4 h-4" />
        <span>EXPIRED</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-mono font-bold text-sm tracking-wide transition-all duration-300 border ${
      isLowTime
        ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 animate-pulse-fast'
        : 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border-brand-500/30'
    }`}>
      <Timer className={`w-4 h-4 ${isLowTime ? 'text-amber-500' : 'text-brand-500'}`} />
      <span>{formattedTime}</span>
      <span className="text-[10px] font-sans font-normal uppercase opacity-75">left</span>
    </div>
  );
}
