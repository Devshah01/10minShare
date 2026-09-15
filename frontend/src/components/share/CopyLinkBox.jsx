import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export function CopyLinkBox({ shareUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left">
        Direct Shareable Link
      </label>

      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-input">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="w-full bg-transparent px-3 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 outline-none truncate"
        />

        <button
          onClick={handleCopy}
          type="button"
          className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all duration-200 shadow-md ${
            copied
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
