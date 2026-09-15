import React, { useState, useRef } from 'react';
import { UploadCloud, Plus, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export function ImageDropzone3D({ 
  onFilesSelected, 
  files = [], 
  onRemoveFile, 
  onClearAll, 
  onSubmit, 
  isUploading,
  maxCount = 10 
}) {
  const fileInputRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Swipe gesture refs
  const dragStartX = useRef(null);

  const isFull = files.length >= maxCount;

  // Generate image preview items
  const fileItems = files.map((file, idx) => ({
    type: 'image',
    file,
    url: URL.createObjectURL(file),
    name: file.name,
    index: idx,
  }));

  // Append Blank "Add Image" Card at the end if not full
  const allCards = isFull 
    ? fileItems 
    : [...fileItems, { type: 'add_card', index: fileItems.length }];

  const totalCards = allCards.length;

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
      e.target.value = '';
    }
  };

  // Swipe gesture handlers (touch and mouse)
  const handleTouchStart = (e) => {
    dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchEnd = (e) => {
    if (dragStartX.current === null) return;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diffX = endX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        // Swiped Left -> Next Card
        setActiveIndex((prev) => (prev + 1) % totalCards);
      } else {
        // Swiped Right -> Prev Card
        setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
      }
    }
  };

  const handleCardClick = (cardIdx, isAddCard) => {
    if (cardIdx === activeIndex) {
      if (isAddCard && !isFull) {
        fileInputRef.current?.click();
      }
    } else {
      setActiveIndex(cardIdx);
    }
  };

  // Get card data for slots: 0=left, 1=center, 2=right
  const getCardData = (slot) => {
    if (totalCards === 1) {
      // Only 1 card total
      const card = allCards[0];
      return { card, isCenter: slot === 1, index: 0 };
    }

    const idx = (activeIndex + (slot - 1) + totalCards) % totalCards;
    return {
      card: allCards[idx],
      index: idx,
    };
  };

  const leftCardData = getCardData(0);
  const centerCardData = getCardData(1);
  const rightCardData = getCardData(2);

  // Helper to render card content inside 3D frame
  const renderCardContent = (cardData, isCenter) => {
    const card = cardData.card;
    if (!card) return null;

    if (card.type === 'add_card') {
      return (
        <div className="w-full h-full p-4 sm:p-5 flex flex-col items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
            <div className="w-14 h-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-md">
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <p className="font-display font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                Add Image
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[180px] mx-auto leading-tight">
                JPG, PNG, WEBP, GIF, SVG (Up to 50MB)
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Image Card
    return (
      <div className="w-full h-full flex flex-col justify-between p-4 relative">
        {/* Delete Badge on Active Center Card */}
        {isCenter && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFile(card.index);
              if (activeIndex >= files.length - 1 && activeIndex > 0) {
                setActiveIndex(activeIndex - 1);
              }
            }}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all shadow-md active:scale-95"
            title="Remove image"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}

        {/* Image Preview Container */}
        <div className="flex-1 w-full overflow-hidden rounded-3xl relative">
          <img
            src={card.url}
            alt={card.name}
            className="w-full h-full object-cover rounded-3xl shadow-sm"
          />
        </div>

        {/* Bottom Left Info Badge Pill (No + button on image) */}
        <div className="flex items-center justify-start mt-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-extrabold text-zinc-900 dark:text-white shadow-md truncate max-w-[200px] flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <span className="truncate">{card.name}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 py-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={isFull}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 3D Cards Perspective Container with Touch/Mouse Swipe */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        className="relative w-full max-w-[320px] sm:max-w-[420px] h-[280px] sm:h-[320px] flex items-center justify-center perspective-[1000px] select-none touch-pan-y cursor-grab active:cursor-grabbing"
      >
        {/* LEFT CARD (Background 3D) */}
        {totalCards > 1 && (
          <div
            onClick={() => handleCardClick(leftCardData.index, leftCardData.card?.type === 'add_card')}
            className="absolute w-[220px] sm:w-[260px] h-[220px] sm:h-[260px] rounded-[2.2rem] bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl transition-all duration-500 ease-out cursor-pointer overflow-hidden aspect-square"
            style={{
              transform: 'translateX(-35%) scale(0.88) rotateY(12deg) rotateZ(-4deg)',
              zIndex: 10,
              opacity: 0.85,
              filter: 'brightness(0.96)',
            }}
          >
            {renderCardContent(leftCardData, false)}
          </div>
        )}

        {/* RIGHT CARD (Background 3D) */}
        {totalCards > 1 && (
          <div
            onClick={() => handleCardClick(rightCardData.index, rightCardData.card?.type === 'add_card')}
            className="absolute w-[220px] sm:w-[260px] h-[220px] sm:h-[260px] rounded-[2.2rem] bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl transition-all duration-500 ease-out cursor-pointer overflow-hidden aspect-square"
            style={{
              transform: 'translateX(35%) scale(0.88) rotateY(-12deg) rotateZ(4deg)',
              zIndex: 10,
              opacity: 0.85,
              filter: 'brightness(0.96)',
            }}
          >
            {renderCardContent(rightCardData, false)}
          </div>
        )}

        {/* CENTER CARD (Foreground 3D Active) */}
        <div
          onClick={() => handleCardClick(centerCardData.index, centerCardData.card?.type === 'add_card')}
          className="absolute w-[250px] sm:w-[290px] h-[250px] sm:h-[290px] rounded-[2.5rem] bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border-2 border-zinc-200/90 dark:border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out z-20 overflow-hidden cursor-pointer hover:scale-[1.02] aspect-square"
          style={{
            transform: 'translateX(0) scale(1) rotateY(0deg)',
          }}
        >
          {renderCardContent(centerCardData, true)}
        </div>
      </div>

      {/* Swipe Tip & Navigation Strip */}
      <div className="w-full max-w-md space-y-4 animate-fade-in">
        {/* Active Navigation Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards)}
              className="p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
              title="Previous image"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white">
              {activeIndex + 1} of {totalCards}
            </span>

            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % totalCards)}
              className="p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
              title="Next image"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {files.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              Remove All
            </button>
          )}
        </div>

        {/* Thumbnail Strip */}
        {files.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-2xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 shadow-sm scrollbar-none">
            {fileItems.map((p, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-14 h-14 shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  idx === activeIndex
                    ? 'border-zinc-900 dark:border-white scale-105 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}

            {!isFull && (
              <div
                onClick={() => {
                  setActiveIndex(fileItems.length);
                }}
                className={`w-14 h-14 shrink-0 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer ${
                  activeIndex === fileItems.length ? 'border-zinc-900 dark:border-white scale-105' : ''
                }`}
                title="Add Image Card"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate 10-Min Link Action Button (Without "(X Images)") */}
      {files.length > 0 && (
        <button
          onClick={onSubmit}
          disabled={isUploading}
          className="w-full max-w-md py-4 px-6 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-display font-extrabold text-sm sm:text-base tracking-tight flex items-center justify-center gap-3 shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <span>Uploading & Generating Link...</span>
          ) : (
            <>
              <span>Generate 10-Min Link</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
