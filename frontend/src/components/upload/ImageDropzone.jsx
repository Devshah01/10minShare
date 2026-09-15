import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

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
    <div className="w-full flex justify-center">
      {/* Upload Box - Rounded Square */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isFull && fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-3xl w-full max-w-sm sm:max-w-md aspect-square p-6 sm:p-8 flex flex-col items-center justify-center text-center border-2 border-dashed transition-all duration-200 ${
          isFull
            ? 'border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 cursor-not-allowed'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50'
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
          <div className="w-14 h-14 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
              {isFull ? "Maximum 10 Images Reached" : "Drop your images here, or browse"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              Supports JPG, PNG, WEBP, GIF, SVG (Up to 10MB per file)
            </p>
          </div>

          {/* Indicator Badge: Max 10 images */}
          <div className="mt-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-800">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span>Images Selected:</span>
            <span className={`font-mono font-bold ${isFull ? 'text-rose-500' : 'text-zinc-900 dark:text-white'}`}>
              {currentCount} / {maxCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
