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
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-lg flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-zinc-900 dark:text-white stroke-[2.5] animate-spin" />
        </div>
        <p className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300 font-sans tracking-tight">
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-950 rounded-[2.25rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
        
        <div className="flex items-center gap-3 text-left">
          <button
            onClick={onBackToUpload}
            type="button"
            className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white transition-colors"
            title="Upload your own images"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div>
            <h1 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
              Shared Photo Collection <Sparkles className="w-4 h-4 text-zinc-900 dark:text-white" />
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {shareData.files.length} {shareData.files.length === 1 ? 'image shared' : 'images shared'} • Link auto-destructs soon
            </p>
          </div>
        </div>

        {/* Live Active Countdown Timer & Action */}
        <div className="flex items-center gap-3">
          <CountdownTimer
            initialSeconds={shareData.remainingSeconds}
            onExpire={() => setIsExpired(true)}
          />

          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            type="button"
            className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-display font-extrabold text-xs shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>Creating ZIP...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-4 h-4 stroke-[2.5]" />
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
