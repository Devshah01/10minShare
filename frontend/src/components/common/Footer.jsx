import React from 'react';
import { Lock, Zap, RefreshCw } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/60 dark:border-slate-800/60 py-8 mt-auto bg-slate-100/40 dark:bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-500" />
          <span>10minshare — Fast, zero-trace temporary image sharing.</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" /> End-to-End Expiring
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-brand-500" /> Cloudflare R2 + Postgres
          </span>
        </div>

      </div>
    </footer>
  );
}
