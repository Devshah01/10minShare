import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Image as ImageIcon } from 'lucide-react';
import { getSecureUrl, downloadSingleFile } from '../../utils/downloadHelper';

export function LightboxModal({ file, onClose }) {
  if (!file) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    downloadSingleFile(file);
  };

  const rawUrl = file.downloadUrl || file.url || file.src;
  const secureImgUrl = getSecureUrl(rawUrl) || rawUrl;

  const modalContent = (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md p-3 sm:p-6 animate-fade-in select-none"
    >
      {/* Top Bar Controls */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full flex items-center justify-between text-white z-[10000] pb-2 border-b border-white/10 shrink-0"
      >
        <div className="flex items-center gap-2 max-w-[70%] sm:max-w-[80%]">
          <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-white shadow-lg truncate flex items-center gap-2">
            <ImageIcon className="w-4 h-4 shrink-0 text-white/80" />
            <span className="truncate">{file.name || 'Image Preview'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleDownload}
            type="button"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer shadow-md"
            title="Download image to local device"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={onClose}
            type="button"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer shadow-md"
            title="Close preview"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Full-Screen Center Image Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full flex-1 flex items-center justify-center p-1 sm:p-3 overflow-hidden"
      >
        <img
          src={secureImgUrl}
          alt={file.name || 'Image Preview'}
          className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl transition-transform duration-200"
        />
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
