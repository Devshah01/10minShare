import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { UploadCloud, Plus, X, ChevronLeft, ChevronRight, Image as ImageIcon, Eye } from 'lucide-react';
import { LightboxModal } from '../viewer/LightboxModal';

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
  const [previewFile, setPreviewFile] = useState(null);
  
  // activeIndex tracks the current integer target card
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const isFull = files.length >= maxCount;

  // Memoize blob URLs so images are NEVER re-decoded during 3D wheel rotation
  const fileItems = useMemo(() => {
    return files.map((file, idx) => ({
      type: 'image',
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      index: idx,
    }));
  }, [files]);

  // Clean up object URLs on unmount or when files change
  useEffect(() => {
    return () => {
      fileItems.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [fileItems]);

  // Append Blank "Add Image" Card at the end if not full
  const allCards = useMemo(() => {
    return isFull 
      ? fileItems 
      : [...fileItems, { type: 'add_card', index: fileItems.length }];
  }, [fileItems, isFull]);

  const totalCards = allCards.length;

  // Direct DOM manipulation refs for 120 FPS zero-lag animations
  const cardRefs = useRef({});
  const virtualIndexRef = useRef(0);
  const targetIndexRef = useRef(activeIndex);
  targetIndexRef.current = activeIndex;

  // Physics & Animation state refs
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartVirtualIndex = useRef(0);
  const lastPointerX = useRef(0);
  const lastPointerTime = useRef(0);
  const lastFrameTime = useRef(0);
  const velocity = useRef(0);
  const animFrameId = useRef(null);

  // Hardware-accelerated 3D transforms directly applied to DOM nodes
  const apply3DTransforms = useCallback((v) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    
    // Responsive 3D wheel radius offsets
    const radiusX = isMobile ? 115 : 190;
    const radiusZ = isMobile ? 120 : 170;
    const angleStep = isMobile ? 26 : 32;

    allCards.forEach((card, i) => {
      const cardKey = card.type === 'add_card' ? 'add_card' : `img-${card.index}-${card.name}`;
      const el = cardRefs.current[cardKey];
      if (!el) return;

      let delta = i - v;
      if (totalCards >= 3) {
        const half = totalCards / 2;
        while (delta > half) delta -= totalCards;
        while (delta < -half) delta += totalCards;
      }

      const absDelta = Math.abs(delta);

      // Hide cards far out of view bounds
      if (absDelta > 2.5) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }

      const angleDeg = delta * angleStep;
      const angleRad = (angleDeg * Math.PI) / 180;

      const translateX = Math.sin(angleRad) * radiusX;
      const translateZ = (Math.cos(angleRad) - 1) * radiusZ;
      const rotateY = -angleDeg * 0.75;
      const rotateZ = -delta * 1.8;

      const scale = Math.max(0.65, 1 - absDelta * 0.11);
      const opacity = Math.max(0, 1 - Math.pow(absDelta / 2.2, 1.8));
      const brightness = Math.max(55, 100 - absDelta * 22);
      const zIndex = Math.round(1000 - absDelta * 100);

      // GPU hardware acceleration
      el.style.transform = `translate3d(${translateX.toFixed(2)}px, 0px, ${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(0)}%)`;
      el.style.zIndex = zIndex;
      el.style.pointerEvents = absDelta < 0.3 ? 'auto' : (opacity < 0.2 ? 'none' : 'auto');
    });
  }, [allCards, totalCards]);

  // Sync virtualIndex and update DOM synchronously before paint whenever card count changes
  useLayoutEffect(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }

    let targetIdx = activeIndex;
    if (totalCards <= 1) {
      targetIdx = 0;
    } else if (activeIndex >= totalCards) {
      targetIdx = Math.max(0, totalCards - 1);
    }

    setActiveIndex(targetIdx);
    virtualIndexRef.current = targetIdx;
    targetIndexRef.current = targetIdx;
    velocity.current = 0;

    apply3DTransforms(targetIdx);
  }, [totalCards, files.length, apply3DTransforms]);

  // Frame-Rate Independent Physics Loop (60Hz / 90Hz / 120Hz / 144Hz Smoothness)
  const updatePhysics = useCallback(() => {
    if (isDragging.current) return;

    const now = performance.now();
    const rawDt = (now - (lastFrameTime.current || now)) / 16.666;
    const dt = Math.min(2, Math.max(0.5, rawDt)); // Clamp frame delta
    lastFrameTime.current = now;

    let currentV = virtualIndexRef.current;
    let target = targetIndexRef.current;
    let v = velocity.current;

    // Frame-rate independent friction dampening
    v *= Math.pow(0.85, dt);
    velocity.current = v;

    if (Math.abs(v) > 0.0005) {
      currentV += v * dt;
      
      let closestTarget = Math.round(currentV);
      if (totalCards >= 3) {
        closestTarget = ((closestTarget % totalCards) + totalCards) % totalCards;
      } else {
        closestTarget = Math.max(0, Math.min(totalCards - 1, closestTarget));
      }

      if (closestTarget !== activeIndexRef.current) {
        setActiveIndex(closestTarget);
      }
    } else {
      velocity.current = 0;
      
      let diff = target - currentV;
      if (totalCards >= 3) {
        const half = totalCards / 2;
        if (diff > half) diff -= totalCards;
        if (diff < -half) diff += totalCards;
      }

      if (Math.abs(diff) < 0.001) {
        currentV = target;
      } else {
        // Frame-rate independent spring interpolation
        currentV += diff * (1 - Math.pow(1 - 0.22, dt));
      }
    }

    virtualIndexRef.current = currentV;
    apply3DTransforms(currentV);

    if (Math.abs(velocity.current) > 0.0005 || Math.abs(target - currentV) >= 0.001) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    } else {
      animFrameId.current = null;
    }
  }, [totalCards, apply3DTransforms]);

  const startPhysicsLoop = useCallback(() => {
    lastFrameTime.current = performance.now();
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    }
  }, [updatePhysics]);

  // Animate to card by target index
  const animateToCard = (targetIdx) => {
    let normalized = targetIdx;
    if (totalCards >= 3) {
      normalized = ((targetIdx % totalCards) + totalCards) % totalCards;
    } else {
      normalized = Math.max(0, Math.min(totalCards - 1, targetIdx));
    }
    setActiveIndex(normalized);
    velocity.current = 0;
    startPhysicsLoop();
  };

  // Pointer Drag Handlers (Unified Touch & Mouse)
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    
    isDragging.current = true;
    dragStartX.current = e.clientX;
    // Always snapshot the CURRENT virtualIndex so drag-distance check is accurate
    dragStartVirtualIndex.current = virtualIndexRef.current;
    lastPointerX.current = e.clientX;
    lastPointerTime.current = performance.now();
    velocity.current = 0;

    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;

    const currentX = e.clientX;
    const now = performance.now();
    const dt = Math.max(1, now - lastPointerTime.current);
    const dx = currentX - lastPointerX.current;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const SWIPE_SENSITIVITY = isMobile ? 160 : 210;

    const instantVelocity = -(dx / SWIPE_SENSITIVITY) / (dt / 16.6);
    velocity.current = velocity.current * 0.3 + instantVelocity * 0.7;

    lastPointerX.current = currentX;
    lastPointerTime.current = now;

    const totalDragX = currentX - dragStartX.current;
    let newVirtual = dragStartVirtualIndex.current - (totalDragX / SWIPE_SENSITIVITY);

    virtualIndexRef.current = newVirtual;
    apply3DTransforms(newVirtual);

    // Update activeIndex indicator during drag
    let rounded = Math.round(newVirtual);
    if (totalCards >= 3) {
      rounded = ((rounded % totalCards) + totalCards) % totalCards;
    } else {
      rounded = Math.max(0, Math.min(totalCards - 1, rounded));
    }
    if (rounded !== activeIndexRef.current) {
      setActiveIndex(rounded);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    let projectedVirtual = virtualIndexRef.current + velocity.current * 5;
    let snapTarget = Math.round(projectedVirtual);

    if (totalCards >= 3) {
      snapTarget = ((snapTarget % totalCards) + totalCards) % totalCards;
    } else {
      snapTarget = Math.max(0, Math.min(totalCards - 1, snapTarget));
    }

    setActiveIndex(snapTarget);
    startPhysicsLoop();
  };

  // Wheel Scroll Interaction
  const handleWheel = (e) => {
    const delta = e.deltaX || e.deltaY;
    if (Math.abs(delta) < 4) return;

    const scrollSensitivity = 0.002;
    let newV = virtualIndexRef.current + delta * scrollSensitivity;

    velocity.current = delta * scrollSensitivity * 0.4;
    virtualIndexRef.current = newV;
    apply3DTransforms(newV);

    let nearest = Math.round(newV);
    if (totalCards >= 3) {
      nearest = ((nearest % totalCards) + totalCards) % totalCards;
    } else {
      nearest = Math.max(0, Math.min(totalCards - 1, nearest));
    }
    if (nearest !== activeIndexRef.current) {
      setActiveIndex(nearest);
    }
    startPhysicsLoop();
  };

  // Dropzone file drop handlers
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

  const handleCardClick = (cardIdx, isAddCard, card) => {
    // Use pointer X travel distance to distinguish a tap from a drag swipe.
    // dragStartX is always set on pointerDown, so this works reliably on
    // both mouse (laptop/desktop) and touch (mobile/tablet).
    const pointerTravelX = Math.abs((lastPointerX.current || dragStartX.current) - dragStartX.current);
    if (pointerTravelX > 8) {
      // User was dragging, not clicking — ignore
      return;
    }

    let delta = cardIdx - virtualIndexRef.current;
    if (totalCards >= 3) {
      const half = totalCards / 2;
      while (delta > half) delta -= totalCards;
      while (delta < -half) delta += totalCards;
    }

    if (Math.abs(delta) < 0.3) {
      if (isAddCard && !isFull) {
        fileInputRef.current?.click();
      } else if (!isAddCard && card && card.url) {
        setPreviewFile({ name: card.name, url: card.url, downloadUrl: card.url });
      }
    } else {
      animateToCard(cardIdx);
    }
  };

  // Render card content inside 3D frame
  const renderCardContent = (card, isCenter) => {
    if (!card) return null;

    if (card.type === 'add_card') {
      return (
        <div className="w-full h-full p-3 sm:p-5 flex flex-col items-center justify-center select-none">
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-3 text-center rounded-2xl sm:rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/60 p-3 sm:p-4 transition-colors hover:border-zinc-500 dark:hover:border-zinc-400">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="font-display font-extrabold text-xs sm:text-base text-zinc-900 dark:text-white">
                Add Image
              </p>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[160px] sm:max-w-[180px] mx-auto leading-tight">
                JPG, PNG, WEBP, GIF, SVG (Up to 50MB)
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Image Card - Takes 100% full area edge-to-edge
    return (
      <div className="w-full h-full relative select-none overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
        {/* Full area image preview */}
        <img
          src={card.url}
          alt={card.name}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Hover overlay with eye icon */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
          <span className="p-2.5 rounded-full bg-white/25 backdrop-blur-md text-white shadow-lg flex items-center gap-1.5 font-bold text-xs">
            <Eye className="w-4 h-4 stroke-[2.5]" />
            <span>Click to Preview</span>
          </span>
        </div>

        {/* Top Control Bar: Eye (Preview) & X (Delete) */}
        <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-30 flex items-center justify-between pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewFile({ name: card.name, url: card.url, downloadUrl: card.url });
            }}
            type="button"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-lg active:scale-95 hover:scale-105 pointer-events-auto cursor-pointer"
            title="Preview image"
          >
            <Eye className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFile(card.index);
              const remaining = files.length - 1;
              const nextIdx = Math.max(0, Math.min(activeIndex, remaining - 1));
              animateToCard(nextIdx);
            }}
            type="button"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-lg active:scale-95 hover:scale-105 pointer-events-auto cursor-pointer"
            title="Remove image"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Bottom Info Badge Overlay */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-30 max-w-[85%] flex items-center justify-start pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-full bg-black/60 dark:bg-black/70 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-bold text-white shadow-lg truncate flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 shrink-0 text-white/80" />
            <span className="truncate">{card.name}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-clip flex flex-col items-center gap-4 sm:gap-6 py-2 sm:py-4">
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

      {/* 3D Spinning Wheel Perspective Container */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative w-full max-w-full h-[250px] sm:h-[310px] flex items-center justify-center select-none touch-pan-y cursor-grab active:cursor-grabbing overflow-x-clip sm:overflow-visible py-2"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        {/* Render cards dynamically on the 3D spinning wheel */}
        {allCards.map((card, i) => {
          const cardKey = card.type === 'add_card' ? 'add_card' : `img-${card.index}-${card.name}`;
          const isCenter = i === activeIndex;

          return (
            <div
              key={cardKey}
              ref={(el) => { cardRefs.current[cardKey] = el; }}
              onClick={(e) => {
                e.stopPropagation();
                if (card.type === 'add_card' && !isFull) {
                  fileInputRef.current?.click();
                } else {
                  handleCardClick(card.index, card.type === 'add_card', card);
                }
              }}
              className={`group absolute w-[200px] sm:w-[270px] h-[200px] sm:h-[270px] rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border-2 border-zinc-200/90 dark:border-zinc-800/90 shadow-xl cursor-pointer overflow-hidden aspect-square transition-shadow duration-300`}
              style={{ willChange: 'transform, opacity, filter', backfaceVisibility: 'hidden' }}
            >
              {renderCardContent(card, isCenter)}
            </div>
          );
        })}
      </div>

      {/* Navigation Strip & Controls */}
      <div className="w-full max-w-md space-y-3 sm:space-y-4 px-2">
        {/* Active Navigation Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => animateToCard(activeIndex - 1)}
              className="p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
              title="Previous image"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white">
              {activeIndex + 1} of {totalCards}
            </span>

            <button
              onClick={() => animateToCard(activeIndex + 1)}
              className="p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
              title="Next image"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {files.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 active:scale-95"
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
                onClick={() => animateToCard(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
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
                  animateToCard(fileItems.length);
                }}
                className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer ${
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

      {/* Generate 10-Min Link Action Button */}
      {files.length > 0 && (
        <button
          onClick={onSubmit}
          disabled={isUploading}
          className="w-full max-w-md py-3.5 sm:py-4 px-6 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-display font-extrabold text-sm sm:text-base tracking-tight flex items-center justify-center gap-3 shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Full-screen Lightbox Preview Modal for draft uploaded images */}
      {previewFile && (
        <LightboxModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
