import React from 'react';
import { Download, Eye } from 'lucide-react';
import { getSecureUrl, downloadSingleFile } from '../../utils/downloadHelper';

export function ImageGallery({ files, onSelectImage }) {
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSingleDownload = (e, file) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    downloadSingleFile(file);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {files.map((file) => {
        const secureImgUrl = getSecureUrl(file.downloadUrl);
        return (
          <div
            key={file.id}
            className="group relative rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Image Thumbnail Container */}
            <div
              onClick={() => onSelectImage({ ...file, downloadUrl: secureImgUrl })}
              className="relative aspect-video w-full overflow-hidden bg-zinc-900 cursor-pointer"
            >
              <img
                src={secureImgUrl}
                alt={file.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Hover overlay with zoom icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white">
                  <Eye className="w-6 h-6 stroke-[2.5]" />
                </span>
              </div>
            </div>

            {/* Details & Individual Download CTA */}
            <div className="p-4 flex items-center justify-between gap-2 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <button
                onClick={(e) => handleSingleDownload(e, file)}
                type="button"
                className="px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-extrabold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
                title="Download image to local device"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Download</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
