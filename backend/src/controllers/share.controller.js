import { shareService } from '../services/share.service.js';
import { storageService } from '../services/storage.service.js';
import { generateShortCode } from '../utils/codeGenerator.js';
import { logger } from '../utils/logger.js';
import { Readable } from 'stream';

export const shareController = {
  /**
   * Upload up to 10 images and generate a 10-minute share link
   */
  async createShare(req, res, next) {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please upload at least 1 image.',
        });
      }

      if (files.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum limit is 10 images per share session.',
        });
      }

      const shortCode = generateShortCode(8);
      logger.info(`Creating new 10-minute share [${shortCode}] with ${files.length} images`);

      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = file.originalname.split('.').pop() || 'png';
        const fileKey = `shares/${shortCode}/${Date.now()}-${i}.${fileExtension}`;

        await storageService.uploadFile(fileKey, file.buffer, file.mimetype);

        uploadedFiles.push({
          fileKey,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        });
      }

      const shareRecord = await shareService.createShare(shortCode, uploadedFiles);

      return res.status(201).json({
        success: true,
        data: {
          shortCode: shareRecord.short_code,
          expiresAt: shareRecord.expires_at,
          remainingSeconds: 600, // 10 minutes (600 seconds)
          totalImages: files.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fetch share details & file metadata by shortCode
   */
  async getShare(req, res, next) {
    try {
      const { shortCode } = req.params;
      if (!shortCode) {
        return res.status(400).json({ success: false, message: 'Short code is required.' });
      }

      const result = await shareService.getShareByCode(shortCode);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Share session not found.',
        });
      }

      if (result.expired) {
        return res.status(410).json({
          success: false,
          expired: true,
          message: 'This 10-minute share link has expired and all files have been permanently deleted.',
        });
      }

      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const filesWithUrls = result.files.map(f => ({
        id: f.id,
        name: f.original_name,
        size: parseInt(f.file_size, 10),
        mimeType: f.mime_type,
        downloadUrl: `${baseUrl}/api/shares/${shortCode}/files/${f.id}`,
      }));

      return res.json({
        success: true,
        data: {
          shortCode: result.short_code,
          createdAt: result.created_at,
          expiresAt: result.expires_at,
          remainingSeconds: result.remainingSeconds,
          files: filesWithUrls,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Stream / download an individual file from Cloudflare R2
   */
  async getFile(req, res, next) {
    try {
      const { shortCode, fileId } = req.params;
      const result = await shareService.getShareByCode(shortCode);

      if (!result || result.expired) {
        return res.status(410).send('Link expired or deleted.');
      }

      const targetFile = result.files.find(f => f.id === fileId || f.file_key.endsWith(fileId));
      if (!targetFile) {
        return res.status(404).send('File not found.');
      }

      const fileData = await storageService.getFile(targetFile.file_key);

      const isDownload = req.query.download === 'true' || req.query.disposition === 'attachment';
      const dispositionType = isDownload ? 'attachment' : 'attachment';

      res.setHeader('Content-Type', fileData.contentType || targetFile.mime_type);
      res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(targetFile.original_name)}"`);
      if (fileData.contentLength) {
        res.setHeader('Content-Length', fileData.contentLength);
      }

      if (Buffer.isBuffer(fileData.body)) {
        return res.send(fileData.body);
      } else if (fileData.body instanceof Readable) {
        return fileData.body.pipe(res);
      } else if (fileData.body && typeof fileData.body.pipe === 'function') {
        return fileData.body.pipe(res);
      } else {
        // Fallback for AWS SDK v3 Web Stream
        const byteArray = await fileData.body.transformToByteArray();
        return res.send(Buffer.from(byteArray));
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a share manually before expiration
   */
  async deleteShare(req, res, next) {
    try {
      const { shortCode } = req.params;
      const result = await shareService.getShareByCode(shortCode);

      if (!result || result.expired) {
        return res.json({ success: true, message: 'Share already expired or removed.' });
      }

      const fileKeys = result.files.map(f => f.file_key);
      await shareService.deleteShare(result.id, shortCode, fileKeys);

      return res.json({
        success: true,
        message: 'Share session and files permanently deleted.',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Health check endpoint
   */
  getHealth(req, res) {
    res.json({
      status: 'UP',
      service: '10minshare-api',
      timestamp: new Date().toISOString(),
    });
  },
};
