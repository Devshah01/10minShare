const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  /**
   * Create a new share with uploaded image files
   */
  async createShare(files, onProgress) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/shares`);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.message || 'Failed to upload images.'));
          }
        } catch (err) {
          reject(new Error('Invalid response from server.'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload.'));
      xhr.send(formData);
    });
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
