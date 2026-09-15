import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
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
    <div className="min-h-screen flex flex-col justify-between bg-zinc-200/80 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* Header */}
      <Header onLogoClick={handleNewShare} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Error Alert Toast */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm flex items-center justify-between animate-fade-in max-w-xl mx-auto w-full">
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
          <div className="space-y-8 max-w-2xl mx-auto w-full">
            {/* Hero Text */}
            <div className="text-center space-y-3">
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-zinc-900 dark:text-white tracking-tight">
                Share Photos Safely.<br />
                <span className="font-light text-zinc-500 dark:text-zinc-400">Gone in 10 Minutes.</span>
              </h1>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto font-sans">
                Upload up to 10 images. Get a link or QR code. Automatically self-destructs after 10 minutes.
              </p>
            </div>

            {/* Upload Area & Preview Grid */}
            <div className="max-w-[280px] sm:max-w-[320px] mx-auto w-full rounded-[2.25rem] p-3.5 sm:p-4 space-y-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-xl shadow-zinc-300/70 dark:shadow-zinc-900/90">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-md hover:shadow-lg shadow-zinc-200/70 dark:shadow-zinc-900/70 transition-all duration-200 text-left space-y-1">
                <div className="flex items-center gap-2 font-display font-bold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>Max 10 Images</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Preview and delete individual images before sharing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-md hover:shadow-lg shadow-zinc-200/70 dark:shadow-zinc-900/70 transition-all duration-200 text-left space-y-1">
                <div className="flex items-center gap-2 font-display font-bold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>Link & QR Code</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Instant scannable QR Code and share link with live timer.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-md hover:shadow-lg shadow-zinc-200/70 dark:shadow-zinc-900/70 transition-all duration-200 text-left space-y-1">
                <div className="flex items-center gap-2 font-display font-bold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>Auto-Delete in 10m</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Everything is permanently deleted after 10 minutes.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
