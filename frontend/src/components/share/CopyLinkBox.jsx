import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyLinkBox({ shareUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-left">
        Direct Shareable Link
      </label>

      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="w-full bg-transparent px-3 text-xs sm:text-sm font-mono text-zinc-900 dark:text-zinc-100 outline-none truncate"
        />

        <button
          onClick={handleCopy}
          type="button"
          className={`px-3.5 py-2 rounded-lg font-display font-bold text-xs flex items-center gap-1.5 transition-all duration-200 ${
            copied
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-800 hover:bg-black dark:bg-zinc-200 dark:hover:bg-white text-white dark:text-zinc-900'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
