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
      {/* Upload Box - Slightly decreased compact rounded square */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isFull && fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-3xl w-full aspect-square p-4 sm:p-5 flex flex-col items-center justify-center text-center border-2 border-dashed transition-all duration-200 ${
          isFull
            ? 'border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 cursor-not-allowed'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 bg-zinc-200/50 dark:bg-zinc-950/50 hover:bg-zinc-300/40 dark:hover:bg-zinc-900/50'
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

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
            <UploadCloud className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-tight">
              {isFull ? "Maximum 10 Images Reached" : "Drop images, or browse"}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[200px] mx-auto leading-normal">
              JPG, PNG, WEBP, GIF, SVG (Up to 10MB)
            </p>
          </div>

          {/* Indicator Badge: Max 10 images */}
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-200/80 dark:bg-zinc-900 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-800">
            <ImageIcon className="w-3 h-3 text-zinc-500" />
            <span>Selected:</span>
            <span className={`font-mono font-bold ${isFull ? 'text-rose-500' : 'text-zinc-900 dark:text-white'}`}>
              {currentCount} / {maxCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
