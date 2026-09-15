import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Download, ChevronLeft, ChevronRight, Image as ImageIcon, Eye, HardDrive } from 'lucide-react';

export function ImageViewer3D({ files = [], onSelectImage }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const totalCards = files.length;

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

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getSecureUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') && !url.includes('localhost')) {
      return url.replace('http://', 'https://');
    }
    return url;
  };

  const handleSingleDownload = (e, file) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetUrl = getSecureUrl(file.downloadUrl);
    const downloadUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}download=true`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = file.name || 'image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hardware-accelerated 3D transforms directly applied to DOM nodes
  const apply3DTransforms = useCallback((v) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    
    const radiusX = isMobile ? 115 : 190;
    const radiusZ = isMobile ? 120 : 170;
    const angleStep = isMobile ? 26 : 32;

    files.forEach((file, i) => {
      const cardKey = `img-${file.id || i}`;
      const el = cardRefs.current[cardKey];
      if (!el) return;

      let delta = i - v;
      if (totalCards >= 3) {
        const half = totalCards / 2;
        while (delta > half) delta -= totalCards;
        while (delta < -half) delta += totalCards;
      }

      const absDelta = Math.abs(delta);

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

      el.style.transform = `translate3d(${translateX.toFixed(2)}px, 0px, ${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(0)}%)`;
      el.style.zIndex = zIndex;
      el.style.pointerEvents = absDelta < 0.3 ? 'auto' : (opacity < 0.2 ? 'none' : 'auto');
    });
  }, [files, totalCards]);

  useEffect(() => {
    if (activeIndex >= totalCards && totalCards > 0) {
      const newIdx = Math.max(0, totalCards - 1);
      setActiveIndex(newIdx);
      virtualIndexRef.current = newIdx;
    }
    apply3DTransforms(virtualIndexRef.current);
  }, [totalCards, activeIndex, apply3DTransforms]);

  // Frame-Rate Independent Physics Loop
  const updatePhysics = useCallback(() => {
    if (isDragging.current) return;

    const now = performance.now();
    const rawDt = (now - (lastFrameTime.current || now)) / 16.666;
    const dt = Math.min(2, Math.max(0.5, rawDt));
    lastFrameTime.current = now;

    let currentV = virtualIndexRef.current;
    let target = targetIndexRef.current;
    let v = velocity.current;

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

  const handlePointerDown = (e) => {
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

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
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

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

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

  const handleCardClick = (cardIdx, file) => {
    if (Math.abs(virtualIndexRef.current - dragStartVirtualIndex.current) > 0.15) {
      return;
    }

    let delta = cardIdx - virtualIndexRef.current;
    if (totalCards >= 3) {
      const half = totalCards / 2;
      while (delta > half) delta -= totalCards;
      while (delta < -half) delta += totalCards;
    }

    if (Math.abs(delta) < 0.3) {
      // Clicked active center image -> Open Lightbox modal
      onSelectImage({ ...file, downloadUrl: getSecureUrl(file.downloadUrl) });
    } else {
      // Clicked side card -> Rotate wheel to center it
      animateToCard(cardIdx);
    }
  };

  const activeFile = files[activeIndex] || files[0];

  return (
    <div className="w-full max-w-full overflow-x-clip flex flex-col items-center gap-4 sm:gap-6 py-2 sm:py-4">
      
      {/* 3D Spinning Wheel Perspective Container */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative w-full max-w-full h-[250px] sm:h-[310px] flex items-center justify-center select-none touch-pan-y cursor-grab active:cursor-grabbing overflow-x-clip sm:overflow-visible py-2"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        {files.map((file, i) => {
          const cardKey = `img-${file.id || i}`;
          const isCenter = i === activeIndex;
          const secureImgUrl = getSecureUrl(file.downloadUrl);

          return (
            <div
              key={cardKey}
              ref={(el) => { cardRefs.current[cardKey] = el; }}
              onClick={() => handleCardClick(i, file)}
              className="group absolute w-[200px] sm:w-[270px] h-[200px] sm:h-[270px] rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border-2 border-zinc-200/90 dark:border-zinc-800/90 shadow-xl cursor-pointer overflow-hidden aspect-square transition-shadow duration-300"
              style={{ willChange: 'transform, opacity, filter', backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full flex flex-col justify-between p-3 sm:p-4 relative select-none">
                
                {/* Download Badge Button (Replaces X remove icon) */}
                <button
                  onClick={(e) => handleSingleDownload(e, file)}
                  type="button"
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all shadow-md active:scale-95 hover:scale-110 cursor-pointer"
                  title="Download image"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </button>

                {/* Image Preview Container */}
                <div className="flex-1 w-full overflow-hidden rounded-2xl sm:rounded-3xl relative bg-zinc-900">
                  <img
                    src={secureImgUrl}
                    alt={file.name}
                    draggable={false}
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl shadow-sm pointer-events-none group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Eye Overlay on hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2.5 rounded-full bg-white/25 backdrop-blur-md text-white">
                      <Eye className="w-5 h-5 stroke-[2.5]" />
                    </span>
                  </div>
                </div>

                {/* Bottom Info Badge Pill */}
                <div className="flex items-center justify-start mt-1.5 sm:mt-2">
                  <div className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/80 text-[11px] sm:text-xs font-extrabold text-zinc-900 dark:text-white shadow-md truncate max-w-[170px] sm:max-w-[200px] flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-zinc-500" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono font-normal">({formatFileSize(file.size)})</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls & Active Image Actions */}
      <div className="w-full max-w-md space-y-3 sm:space-y-4 px-2">
        {/* Navigation Bar */}
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

          {activeFile && (
            <button
              onClick={(e) => handleSingleDownload(e, activeFile)}
              className="text-xs font-extrabold text-zinc-900 dark:text-white hover:underline flex items-center gap-1 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              Download Active
            </button>
          )}
        </div>

        {/* Thumbnail Strip */}
        {files.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-2xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 shadow-sm scrollbar-none">
            {files.map((file, idx) => {
              const secureUrl = getSecureUrl(file.downloadUrl);
              return (
                <div
                  key={file.id || idx}
                  onClick={() => animateToCard(idx)}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    idx === activeIndex
                      ? 'border-zinc-900 dark:border-white scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={secureUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
