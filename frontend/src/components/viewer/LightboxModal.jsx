import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
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

  const secureImgUrl = getSecureUrl(file.downloadUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
        <div className="text-sm font-medium truncate max-w-xs sm:max-w-md">
          {file.name}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            type="button"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Download image to local device"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            type="button"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="max-w-5xl max-h-[85vh] p-2 flex items-center justify-center">
        <img
          src={secureImgUrl}
          alt={file.name}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
}
