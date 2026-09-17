export const getSecureUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return url.replace('http://', 'https://');
  }
  return url;
};

export const downloadSingleFile = async (file) => {
  if (!file) return;

  const rawUrl = file.downloadUrl || file.url;
  if (!rawUrl) return;

  const targetUrl = getSecureUrl(rawUrl);
  const fileName = file.name || 'image.png';

  try {
    // Silent Blob fetch (avoids opening blank black-screen tabs on mobile browsers)
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error('Fetch failed');

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory blob URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (err) {
    // Fallback if CORS or fetch fails: use hidden iframe to avoid target="_blank" black flash
    const downloadUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}download=true`;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 5000);
  }
};
