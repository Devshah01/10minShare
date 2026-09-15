import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export function UploadProgress({ progress }) {
  return (
    <div className="w-full p-8 rounded-3xl glass-card text-center space-y-4 animate-fade-in max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto shadow-inner">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-1">
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
          Encrypting & Uploading to Cloudflare R2...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Setting up 10-minute automatic self-destruct timer
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-brand-400 to-emerald-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
        <span>Uploading...</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
}
