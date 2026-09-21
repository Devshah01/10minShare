const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  /**
   * Create a new share with parallel concurrent image uploads (Worker pool of 3 streams)
   */
  async createShare(files, onProgress) {
    if (!files || files.length === 0) {
      throw new Error('Please select at least one image.');
    }

    // Step 1: Initialize parallel upload session
    const initRes = await fetch(`${API_BASE_URL}/shares/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const initData = await initRes.json();
    if (!initRes.ok || !initData.success) {
      throw new Error(initData.message || 'Failed to initialize share session.');
    }
    const shortCode = initData.data.shortCode;

    // Track byte-level progress across all concurrent streams
    const fileCount = files.length;
    const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0) || 1;
    const loadedBytes = new Array(fileCount).fill(0);
    const activeXHRs = new Set();
    let isAborted = false;

    const updateAggregateProgress = () => {
      if (!onProgress || isAborted) return;
      const totalLoaded = loadedBytes.reduce((a, b) => a + b, 0);
      const percent = Math.min(99, Math.round((totalLoaded / totalBytes) * 100));
      onProgress(percent);
    };

    // Concurrency Worker Pool (Up to 3 simultaneous uploads)
    const CONCURRENCY = Math.min(3, fileCount);
    let nextIndex = 0;

    const uploadSingleFile = (file, index) => {
      return new Promise((resolve, reject) => {
        if (isAborted) return reject(new Error('Upload cancelled'));

        const formData = new FormData();
        formData.append('image', file);

        const xhr = new XMLHttpRequest();
        activeXHRs.add(xhr);
        xhr.open('POST', `${API_BASE_URL}/shares/${shortCode}/files`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && !isAborted) {
            loadedBytes[index] = event.loaded;
            updateAggregateProgress();
          }
        };

        xhr.onload = () => {
          activeXHRs.delete(xhr);
          if (xhr.status >= 200 && xhr.status < 300) {
            loadedBytes[index] = file.size; // Ensure 100% counted for this file
            updateAggregateProgress();
            resolve();
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              reject(new Error(errData.message || `Failed to upload image ${file.name}`));
            } catch (e) {
              reject(new Error(`Failed to upload image ${file.name}`));
            }
          }
        };

        xhr.onerror = () => {
          activeXHRs.delete(xhr);
          reject(new Error(`Network error while uploading ${file.name}`));
        };

        xhr.onabort = () => {
          activeXHRs.delete(xhr);
          reject(new Error('Upload aborted'));
        };

        xhr.send(formData);
      });
    };

    // Worker process pulling files off the queue
    const worker = async () => {
      while (nextIndex < fileCount) {
        if (isAborted) break;
        const currentIndex = nextIndex++;
        const currentFile = files[currentIndex];
        await uploadSingleFile(currentFile, currentIndex);
      }
    };

    try {
      // Launch parallel worker streams
      const workers = Array.from({ length: CONCURRENCY }, () => worker());
      await Promise.all(workers);

      // Step 3: Complete share session and activate 10-minute countdown
      const completeRes = await fetch(`${API_BASE_URL}/shares/${shortCode}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const completeData = await completeRes.json();

      if (!completeRes.ok || !completeData.success) {
        throw new Error(completeData.message || 'Failed to finalize share session.');
      }

      if (onProgress) onProgress(100);

      return completeData;
    } catch (err) {
      isAborted = true;
      activeXHRs.forEach((xhr) => xhr.abort());
      activeXHRs.clear();
      throw err;
    }
  },

  /**
   * Get share details and file list by short code
   */
  async getShare(shortCode) {
    const res = await fetch(`${API_BASE_URL}/shares/${shortCode}`);
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 410) {
        return { expired: true, message: data.message };
      }
      throw new Error(data.message || 'Share session not found.');
    }
    return data.data;
  },

  /**
   * Delete a share manually
   */
  async deleteShare(shortCode) {
    const res = await fetch(`${API_BASE_URL}/shares/${shortCode}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
