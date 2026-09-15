import React from 'react';
import { CheckCircle2, ExternalLink, PlusCircle, Trash2 } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { CopyLinkBox } from './CopyLinkBox';
import { CountdownTimer } from '../common/CountdownTimer';

export function ShareSuccessModal({ shareData, onNewShare, onViewRecipient, onDeleteShare }) {
  if (!shareData) return null;

  const shareUrl = `${window.location.origin}/share/${shareData.shortCode}`;

  return (
    <div className="w-full max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in text-center border border-brand-500/20">
      
      {/* Header Badge */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Link Generated Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {shareData.totalImages} {shareData.totalImages === 1 ? 'image is' : 'images are'} live. Timer started automatically.
          </p>
        </div>

        {/* Live Active Timer */}
        <CountdownTimer initialSeconds={shareData.remainingSeconds || 600} />
      </div>

      {/* Share Box & QR Code */}
      <div className="space-y-6 pt-2">
        <CopyLinkBox shareUrl={shareUrl} />

        <div className="pt-2 flex flex-col items-center">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
            Scan QR Code to Open on Mobile
          </p>
          <QRCodeDisplay shareUrl={shareUrl} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onDeleteShare}
          type="button"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Now</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onNewShare}
            type="button"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Share</span>
          </button>

          <button
            onClick={onViewRecipient}
            type="button"
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-brand-500/20"
          >
            <span>View Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
