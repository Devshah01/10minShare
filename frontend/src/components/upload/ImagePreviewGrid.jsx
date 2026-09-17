import React, { useMemo, useEffect } from 'react';
import { X, Trash2, ArrowRight } from 'lucide-react';

export function ImagePreviewGrid({ files = [], onRemoveFile, onClearAll, onSubmit, isUploading }) {
  const fileItems = useMemo(() => {
    return files.map((file, idx) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      index: idx,
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      fileItems.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [fileItems]);

  if (!files || files.length === 0) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Selected Images ({files.length}/10)
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            Click 'X' to remove any image
          </span>
        </div>

        <button
          onClick={onClearAll}
          type="button"
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove All</span>
        </button>
      </div>

      {/* Grid of Preview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {fileItems.map((item) => {
          return (
            <div
              key={`${item.name}-${item.index}`}
              className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Individual Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(item.index);
                }}
                type="button"
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-zinc-900/90 hover:bg-black text-white flex items-center justify-center border border-zinc-700 focus:outline-none transition-transform"
                title="Remove this image"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* File details at bottom */}
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <p className="text-[11px] font-medium text-white truncate drop-shadow">
                  {item.name}
                </p>
                <p className="text-[9px] text-zinc-400 font-mono">
                  {formatFileSize(item.size)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Link CTA Button - Monochrome */}
      <div className="pt-3 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isUploading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-display font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>Generate 10-Min Link ({files.length} {files.length === 1 ? 'Image' : 'Images'})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
