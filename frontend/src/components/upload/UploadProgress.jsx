import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export function UploadProgress({ progress }) {
  return (
    <div className="w-full p-8 rounded-[2.25rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-5 animate-fade-in max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center mx-auto shadow-inner border border-zinc-200 dark:border-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white stroke-[2.5]" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-display font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white tracking-tight">
          Encrypting & Uploading Photos...
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Setting up 10-minute automatic self-destruct timer
        </p>
      </div>

      {/* Progress Bar - Monochrome */}
      <div className="space-y-2">
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-300/40 dark:border-zinc-700/40">
          <div
            className="bg-zinc-900 dark:bg-white h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400">
          <span>Uploading...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
