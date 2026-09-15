import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ImageDropzone } from './components/upload/ImageDropzone';
import { ImagePreviewGrid } from './components/upload/ImagePreviewGrid';
import { UploadProgress } from './components/upload/UploadProgress';
import { ShareSuccessModal } from './components/share/ShareSuccessModal';
import { ShareViewer } from './components/viewer/ShareViewer';
import { api } from './services/api';
import { AlertCircle, Lock, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdShare, setCreatedShare] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [shortCodeFromUrl, setShortCodeFromUrl] = useState('');

  useEffect(() => {
    // Check if URL matches /share/:shortCode
    const path = window.location.pathname;
    const match = path.match(/\/share\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      setShortCodeFromUrl(match[1]);
    }

    const handlePopState = () => {
      const p = window.location.pathname;
      const m = p.match(/\/share\/([a-zA-Z0-9]+)/);
      if (m && m[1]) {
        setShortCodeFromUrl(m[1]);
      } else {
        setShortCodeFromUrl('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleFilesSelected = (newFiles) => {
    setErrorMessage(null);
    const combined = [...selectedFiles, ...newFiles];
    if (combined.length > 10) {
      setErrorMessage('Maximum limit is 10 images per share session.');
      setSelectedFiles(combined.slice(0, 10));
    } else {
      setSelectedFiles(combined);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
  };

  const handleSubmitUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      const response = await api.createShare(selectedFiles, (progress) => {
        setUploadProgress(progress);
      });

      setCreatedShare(response.data);
      setSelectedFiles([]);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload images.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNewShare = () => {
    setCreatedShare(null);
    setSelectedFiles([]);
    setShortCodeFromUrl('');
    window.history.pushState({}, '', '/');
  };

  const handleViewRecipient = () => {
    if (!createdShare) return;
    const code = createdShare.shortCode;
    setShortCodeFromUrl(code);
    window.history.pushState({}, '', `/share/${code}`);
  };

  const handleDeleteShare = async () => {
    if (!createdShare) return;
    try {
      await api.deleteShare(createdShare.shortCode);
    } catch (e) {
      // Ignored
    }
    handleNewShare();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <Header onLogoClick={handleNewShare} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Error Alert Toast */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between animate-fade-in max-w-xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-xs font-bold underline">
              Dismiss
            </button>
          </div>
        )}

        {/* View Mode Router */}
        {shortCodeFromUrl ? (
          <ShareViewer
            shortCode={shortCodeFromUrl}
            onBackToUpload={handleNewShare}
          />
        ) : createdShare ? (
          <ShareSuccessModal
            shareData={createdShare}
            onNewShare={handleNewShare}
            onViewRecipient={handleViewRecipient}
            onDeleteShare={handleDeleteShare}
          />
        ) : isUploading ? (
          <UploadProgress progress={uploadProgress} />
        ) : (
          <div className="space-y-8 max-w-3xl mx-auto w-full">
            {/* Hero Text */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant 10-Minute Ephemeral Storage</span>
              </div>
              
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
                Share Photos Safely.<br />
                <span className="gradient-text">Gone in 10 Minutes.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-sans">
                Upload up to <strong className="text-slate-800 dark:text-slate-200">10 images</strong>. Get a instant link & QR Code. After 10 minutes, files and records are automatically self-destructed.
              </p>
            </div>

            {/* Upload Area & Preview Grid */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800/80">
              <ImageDropzone
                onFilesSelected={handleFilesSelected}
                currentCount={selectedFiles.length}
                maxCount={10}
              />

              <ImagePreviewGrid
                files={selectedFiles}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
                onSubmit={handleSubmitUpload}
                isUploading={isUploading}
              />
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-left space-y-1">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-brand-500" />
                  <span>Max 10 Images</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select and preview up to 10 images with single-click remove buttons.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-left space-y-1">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Link & QR Code</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant scannable QR Code and share link with live countdown timer.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-left space-y-1">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span>Auto-Delete in 10m</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cloudflare R2 files and PostgreSQL data self-destruct after 600s.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
