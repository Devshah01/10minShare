import React, { useState, useEffect } from 'react';
import { DownloadCloud, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { api } from '../../services/api';
import { CountdownTimer } from '../common/CountdownTimer';
import { ImageGallery } from './ImageGallery';
import { LightboxModal } from './LightboxModal';
import { ExpiredState } from './ExpiredState';

export function ShareViewer({ shortCode, onBackToUpload }) {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    fetchShare();
  }, [shortCode]);

  const fetchShare = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getShare(shortCode);

      if (data.expired) {
        setIsExpired(true);
      } else {
        setShareData(data);
      }
    } catch (err) {
      setError(err.message || 'Share link not found or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAllZip = async () => {
    if (!shareData || !shareData.files || shareData.files.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(`10minshare-${shortCode}`);

      for (const file of shareData.files) {
        const response = await fetch(file.downloadUrl);
        const blob = await response.blob();
        folder.file(file.name, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `10minshare-${shortCode}.zip`);
    } catch (err) {
      alert('Failed to generate ZIP download. Please try downloading images individually.');
    } finally {
      setIsZipping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading 10-minute share session...
        </p>
      </div>
    );
  }

  if (isExpired || (shareData && shareData.expired)) {
    return <ExpiredState onStartNew={onBackToUpload} />;
  }

  if (error || !shareData) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl glass-card text-center space-y-4">
        <p className="text-rose-500 font-semibold text-sm">{error || 'Session unavailable'}</p>
        <button
          onClick={onBackToUpload}
          className="px-6 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      {/* Recipient Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 glass-card rounded-3xl border border-brand-500/20">
        
        <div className="flex items-center gap-3 text-left">
          <button
            onClick={onBackToUpload}
            type="button"
            className="p-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Upload your own images"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="font-display font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              Shared Photo Collection <Sparkles className="w-4 h-4 text-brand-500" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {shareData.files.length} {shareData.files.length === 1 ? 'image shared' : 'images shared'} • Link auto-destructs soon
            </p>
          </div>
        </div>

        {/* Live Active Countdown Timer */}
        <div className="flex items-center gap-3">
          <CountdownTimer
            initialSeconds={shareData.remainingSeconds}
            onExpire={() => setIsExpired(true)}
          />

          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            type="button"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-600 hover:from-brand-600 hover:to-emerald-700 text-white font-display font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating ZIP...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-4 h-4" />
                <span>Download All (.zip)</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Gallery Grid */}
      <ImageGallery files={shareData.files} onSelectImage={setSelectedFile} />

      {/* Lightbox Modal */}
      {selectedFile && (
        <LightboxModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}

    </div>
  );
}
