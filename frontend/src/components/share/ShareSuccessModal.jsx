import React from 'react';
import { CheckCircle2, ExternalLink, PlusCircle, Trash2 } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { CopyLinkBox } from './CopyLinkBox';
import { CountdownTimer } from '../common/CountdownTimer';

export function ShareSuccessModal({ shareData, onNewShare, onViewRecipient, onDeleteShare }) {
  if (!shareData) return null;

  const shareUrl = `${window.location.origin}/share/${shareData.shortCode}`;

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl p-6 sm:p-8 space-y-6 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm animate-fade-in">
      
      {/* Header Badge */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-white">
            Link Generated Successfully
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {shareData.totalImages} {shareData.totalImages === 1 ? 'image is' : 'images are'} live. Timer started automatically.
          </p>
        </div>

        {/* Live Active Timer */}
        <CountdownTimer initialSeconds={shareData.remainingSeconds || 600} />
      </div>

      {/* Share Box & QR Code */}
      <div className="space-y-5 pt-1">
        <CopyLinkBox shareUrl={shareUrl} />

        <div className="pt-2 flex flex-col items-center">
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
            Scan QR Code to Open on Mobile
          </p>
          <QRCodeDisplay shareUrl={shareUrl} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onDeleteShare}
          type="button"
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Now</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onNewShare}
            type="button"
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Share</span>
          </button>

          <button
            onClick={onViewRecipient}
            type="button"
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>View Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
