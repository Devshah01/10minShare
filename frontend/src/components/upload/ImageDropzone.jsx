import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Plus, Info } from 'lucide-react';

export function ImageDropzone({ onFilesSelected, currentCount = 0, maxCount = 10 }) {
  const fileInputRef = useRef(null);

  const isFull = currentCount >= maxCount;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFull) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="w-full">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isFull && fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed transition-all duration-300 ${
          isFull
            ? 'border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 cursor-not-allowed'
            : 'border-brand-500/40 dark:border-brand-500/30 hover:border-brand-500 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-brand-500/5 dark:hover:bg-brand-500/10 shadow-lg hover:shadow-brand-500/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={isFull}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100">
              {isFull ? "Maximum 10 Images Reached" : "Drop your images here, or browse"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Supports JPG, PNG, WEBP, GIF, SVG (Up to 10MB per file)
            </p>
          </div>

          {/* Indicator Badge: Max 10 images */}
          <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
            <span>Image Limit Indicator:</span>
            <span className={`font-mono font-bold ${isFull ? 'text-rose-500' : 'text-brand-500'}`}>
              {currentCount} / {maxCount} images
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
