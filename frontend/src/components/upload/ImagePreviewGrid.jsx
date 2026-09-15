import React from 'react';
import { X, FileImage, Trash2, ArrowRight } from 'lucide-react';

export function ImagePreviewGrid({ files, onRemoveFile, onClearAll, onSubmit, isUploading }) {
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
          <span className="font-display font-bold text-base text-slate-800 dark:text-slate-200">
            Selected Images ({files.length}/10)
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Click 'X' to remove any image
          </span>
        </div>

        <button
          onClick={onClearAll}
          type="button"
          className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove All</span>
        </button>
      </div>

      {/* Grid of Preview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {files.map((item, index) => {
          const previewUrl = URL.createObjectURL(item);
          return (
            <div
              key={`${item.name}-${index}`}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <img
                src={previewUrl}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={() => URL.revokeObjectURL(previewUrl)}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Individual Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
                type="button"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-200 focus:outline-none"
                title="Remove this image"
              >
                <X className="w-4 h-4" />
              </button>

              {/* File details at bottom */}
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <p className="text-[11px] font-medium text-white truncate drop-shadow">
                  {item.name}
                </p>
                <p className="text-[9px] text-slate-300 font-mono">
                  {formatFileSize(item.size)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Link CTA Button */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isUploading}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-600 hover:from-brand-600 hover:to-emerald-700 text-white font-display font-bold text-base shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          <span>Generate 10-Min Link ({files.length} {files.length === 1 ? 'Image' : 'Images'})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
