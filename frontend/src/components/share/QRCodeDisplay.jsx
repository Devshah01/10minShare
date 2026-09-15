import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download } from 'lucide-react';

export function QRCodeDisplay({ shareUrl }) {
  const qrRef = useRef(null);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, 25, 25, 250, 250);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = '10minshare-qrcode.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
      <div ref={qrRef} className="p-3 bg-white rounded-xl shadow-md border border-slate-100">
        <QRCodeSVG
          value={shareUrl}
          size={160}
          bgColor="#ffffff"
          fgColor="#070a0f"
          level="H"
          includeMargin={false}
        />
      </div>

      <button
        onClick={downloadQR}
        type="button"
        className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-500 flex items-center gap-1 font-medium transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Save QR Image</span>
      </button>
    </div>
  );
}
