import React from 'react';
import { Download, Eye, HardDrive } from 'lucide-react';

export function ImageGallery({ files, onSelectImage }) {
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {files.map((file) => (
        <div
          key={file.id}
          className="group relative rounded-2xl overflow-hidden glass-card hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 flex flex-col"
        >
          {/* Image Thumbnail Container */}
          <div
            onClick={() => onSelectImage(file)}
            className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
          >
            <img
              src={file.downloadUrl}
              alt={file.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white">
                <Eye className="w-6 h-6" />
              </span>
            </div>
          </div>

          {/* Details & Individual Download CTA */}
          <div className="p-3.5 flex items-center justify-between gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {file.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {formatFileSize(file.size)}
              </p>
            </div>

            <a
              href={file.downloadUrl}
              download={file.name}
              className="px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500 text-brand-600 dark:text-brand-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              title="Download image"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
