import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  
  // activeIndex tracks the current integer target card
  const [activeIndex, setActiveIndex] = useState(0);
  
  // virtualIndex tracks the continuous float position for smooth 3D wheel rendering
  const [virtualIndex, setVirtualIndex] = useState(0);
  const virtualIndexRef = useRef(0);
  virtualIndexRef.current = virtualIndex;

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

  // Sync virtualIndex when totalCards changes or activeIndex changes programmatically
  const targetIndexRef = useRef(activeIndex);
  targetIndexRef.current = activeIndex;

  // Physics & Animation state refs
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartVirtualIndex = useRef(0);
  const lastPointerX = useRef(0);
  const lastPointerTime = useRef(0);
  const velocity = useRef(0);
  const animFrameId = useRef(null);

  // Clamp or normalize activeIndex when cards count changes
  useEffect(() => {
    if (activeIndex >= totalCards) {
      const newIdx = Math.max(0, totalCards - 1);
      setActiveIndex(newIdx);
    }
  }, [totalCards, activeIndex]);

  // Main Physics Animation Loop for inertia and spring snap
  const updatePhysics = useCallback(() => {
    if (isDragging.current) return;

    let currentV = virtualIndexRef.current;
    let target = targetIndexRef.current;
    let v = velocity.current;

    // Apply friction to momentum velocity
    v *= 0.88;
    velocity.current = v;

    if (Math.abs(v) > 0.001) {
      // Coasting with momentum
      currentV += v;
      
      // Calculate closest target index while coasting
      let closestTarget = Math.round(currentV);
      if (totalCards >= 3) {
        closestTarget = ((closestTarget % totalCards) + totalCards) % totalCards;
      } else {
        closestTarget = Math.max(0, Math.min(totalCards - 1, closestTarget));
      }
      setActiveIndex(closestTarget);
    } else {
      // Spring snapping towards targetIndex
      velocity.current = 0;
      
      let diff = target - currentV;

      // Handle shortest circular distance for wrapping when totalCards >= 3
      if (totalCards >= 3) {
        const half = totalCards / 2;
        if (diff > half) diff -= totalCards;
        if (diff < -half) diff += totalCards;
      }

      if (Math.abs(diff) < 0.001) {
        currentV = target;
      } else {
        // Smooth exponential spring dampening (0.18 factor for responsive, silky feel)
        currentV += diff * 0.18;
      }
    }

    setVirtualIndex(currentV);

    // Keep loop running if still moving
    if (Math.abs(velocity.current) > 0.001 || Math.abs(target - currentV) >= 0.001) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    } else {
      animFrameId.current = null;
    }
  }, [totalCards]);

  const startPhysicsLoop = useCallback(() => {
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    }
  }, [updatePhysics]);

  // Start physics loop whenever target index changes
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
    // Only handle primary button
    if (e.button !== undefined && e.button !== 0) return;
    
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartVirtualIndex.current = virtualIndexRef.current;
    lastPointerX.current = e.clientX;
    lastPointerTime.current = performance.now();
    velocity.current = 0;

    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;

    const currentX = e.clientX;
    const now = performance.now();
    const dt = Math.max(1, now - lastPointerTime.current);
    const dx = currentX - lastPointerX.current;

    // Calculate drag velocity (cards per ms)
    // 220px drag distance = 1 full card shift
    const SWIPE_SENSITIVITY = 220;
    const instantVelocity = -(dx / SWIPE_SENSITIVITY) / (dt / 16.6); // normalized to 60fps frame delta
    velocity.current = velocity.current * 0.4 + instantVelocity * 0.6; // smooth velocity filter

    lastPointerX.current = currentX;
    lastPointerTime.current = now;

    const totalDragX = currentX - dragStartX.current;
    let newVirtual = dragStartVirtualIndex.current - (totalDragX / SWIPE_SENSITIVITY);

    setVirtualIndex(newVirtual);

    // Update activeIndex to nearest card while dragging
    let rounded = Math.round(newVirtual);
    if (totalCards >= 3) {
      rounded = ((rounded % totalCards) + totalCards) % totalCards;
    } else {
      rounded = Math.max(0, Math.min(totalCards - 1, rounded));
    }
    setActiveIndex(rounded);
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Determine snap target based on current virtual index + velocity boost
    let projectedVirtual = virtualIndexRef.current + velocity.current * 8;
    let snapTarget = Math.round(projectedVirtual);

    if (totalCards >= 3) {
      snapTarget = ((snapTarget % totalCards) + totalCards) % totalCards;
    } else {
      snapTarget = Math.max(0, Math.min(totalCards - 1, snapTarget));
    }

    setActiveIndex(snapTarget);
    startPhysicsLoop();
  };

  // Wheel Scroll Interaction (Trackpad & Mouse Scroll)
  const handleWheel = (e) => {
    const delta = e.deltaX || e.deltaY;
    if (Math.abs(delta) < 4) return;

    const scrollSensitivity = 0.0025;
    let newV = virtualIndexRef.current + delta * scrollSensitivity;

    velocity.current = delta * scrollSensitivity * 0.5;
    setVirtualIndex(newV);

    let nearest = Math.round(newV);
    if (totalCards >= 3) {
      nearest = ((nearest % totalCards) + totalCards) % totalCards;
    } else {
      nearest = Math.max(0, Math.min(totalCards - 1, nearest));
    }
    setActiveIndex(nearest);
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

  const handleCardClick = (cardIdx, isAddCard, delta) => {
    // If user was dragging significantly, ignore click to prevent accidental triggers
    if (Math.abs(virtualIndexRef.current - dragStartVirtualIndex.current) > 0.15) {
      return;
    }

    if (Math.abs(delta) < 0.3) {
      // Clicked center active card
      if (isAddCard && !isFull) {
        fileInputRef.current?.click();
      }
    } else {
      // Clicked side card -> rotate wheel to bring it to center
      animateToCard(cardIdx);
    }
  };

  // Helper to compute 3D transform for a card given its relative index delta on the wheel
  const compute3DTransform = (delta) => {
    const absDelta = Math.abs(delta);
    
    // Cylindrical wheel angle (34 degrees step per card)
    const angleDeg = delta * 34;
    const angleRad = (angleDeg * Math.PI) / 180;
    
    // 3D positioning
    const translateX = Math.sin(angleRad) * 250; // horizontal arc displacement
    const translateZ = (Math.cos(angleRad) - 1) * 180; // depth arc displacement (pushes background cards into screen)
    const rotateY = -angleDeg * 0.8; // card face rotation along wheel curve
    const rotateZ = -delta * 2.2; // subtle aesthetic tilt
    
    // Scale & Visual falloff
    const scale = Math.max(0.65, 1 - absDelta * 0.12);
    const opacity = Math.max(0, 1 - Math.pow(absDelta / 2.3, 1.8));
    const brightness = Math.max(50, 100 - absDelta * 22);
    const zIndex = Math.round(1000 - absDelta * 100);

    return {
      style: {
        transform: `perspective(1000px) translateX(${translateX.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
        opacity: opacity.toFixed(3),
        filter: `brightness(${brightness.toFixed(0)}%)`,
        zIndex,
        pointerEvents: opacity < 0.15 ? 'none' : 'auto',
      },
      isCenter: absDelta < 0.3,
    };
  };

  // Render card content inside 3D frame
  const renderCardContent = (card, isCenter) => {
    if (!card) return null;

    if (card.type === 'add_card') {
      return (
        <div className="w-full h-full p-4 sm:p-5 flex flex-col items-center justify-center select-none">
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/60 p-4 transition-colors hover:border-zinc-500 dark:hover:border-zinc-400">
            <div className="w-14 h-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
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
      <div className="w-full h-full flex flex-col justify-between p-4 relative select-none">
        {/* Delete Badge on Active Center Card */}
        {isCenter && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFile(card.index);
              if (activeIndex >= files.length - 1 && activeIndex > 0) {
                animateToCard(activeIndex - 1);
              }
            }}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all shadow-md active:scale-95 hover:scale-110"
            title="Remove image"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}

        {/* Image Preview Container */}
        <div className="flex-1 w-full overflow-hidden rounded-3xl relative bg-zinc-100 dark:bg-zinc-800">
          <img
            src={card.url}
            alt={card.name}
            draggable={false}
            className="w-full h-full object-cover rounded-3xl shadow-sm pointer-events-none"
          />
        </div>

        {/* Bottom Info Badge Pill */}
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

      {/* 3D Spinning Wheel Perspective Container */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative w-full max-w-[340px] sm:max-w-[460px] h-[280px] sm:h-[320px] flex items-center justify-center select-none touch-pan-y cursor-grab active:cursor-grabbing overflow-visible"
        style={{ perspective: '1000px' }}
      >
        {/* Render cards dynamically on the 3D spinning wheel */}
        {allCards.map((card, i) => {
          // Calculate delta relative to virtualIndex
          let delta = i - virtualIndex;

          // Wrap delta for circular 3D wheel loop if totalCards >= 3
          if (totalCards >= 3) {
            const half = totalCards / 2;
            while (delta > half) delta -= totalCards;
            while (delta < -half) delta += totalCards;
          }

          // Skip rendering cards that are far behind in 3D wheel space for performance
          if (Math.abs(delta) > 2.8) return null;

          const { style, isCenter } = compute3DTransform(delta);

          return (
            <div
              key={card.type === 'add_card' ? 'add_card' : `img-${card.index}-${card.name}`}
              onClick={() => handleCardClick(card.index, card.type === 'add_card', delta)}
              className={`group absolute w-[240px] sm:w-[280px] h-[240px] sm:h-[280px] rounded-[2.5rem] bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border-2 ${
                isCenter 
                  ? 'border-zinc-300 dark:border-zinc-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]' 
                  : 'border-zinc-200/80 dark:border-zinc-800 shadow-xl'
              } transition-shadow duration-300 cursor-pointer overflow-hidden aspect-square`}
              style={style}
            >
              {renderCardContent(card, isCenter)}
            </div>
          );
        })}
      </div>

      {/* Navigation Strip & Controls */}
      <div className="w-full max-w-md space-y-4 animate-fade-in">
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
                  animateToCard(fileItems.length);
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

      {/* Generate 10-Min Link Action Button */}
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
