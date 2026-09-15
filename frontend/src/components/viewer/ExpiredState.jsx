import React from 'react';
import { Clock, ShieldAlert, PlusCircle } from 'lucide-react';

export function ExpiredState({ onStartNew }) {
  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 text-center space-y-6 animate-fade-in border border-rose-500/20 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
        <Clock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
          Link Expired & Deleted
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          The 10-minute timer for this share session has elapsed. All images and metadata have been permanently erased from our servers and Cloudflare R2 storage.
        </p>
      </div>

      <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 text-left">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <span>For privacy and security, expired links cannot be restored or recovered.</span>
      </div>

      <button
        onClick={onStartNew}
        type="button"
        className="w-full py-3.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-display font-extrabold text-sm shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Upload New 10-Min Share</span>
      </button>
    </div>
  );
}
