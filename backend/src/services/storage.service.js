import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/r2.config.js';
import { config } from '../config/env.config.js';
import { logger } from '../utils/logger.js';

// In-memory dev storage fallback if R2 credentials are not set
const memoryStorage = new Map();

export const storageService = {
  /**
   * Upload a file buffer to Cloudflare R2
   */
  async uploadFile(fileKey, buffer, mimeType) {
    const isMock = !config.r2.accessKeyId || (typeof config.r2.accessKeyId === 'string' && config.r2.accessKeyId.includes('mock'));
    if (isMock) {
      logger.warn(`R2 Access Key missing. Using in-memory fallback for key: ${fileKey}`);
      memoryStorage.set(fileKey, { buffer, mimeType });
      return fileKey;
    }

    const command = new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);
    return fileKey;
  },

  /**
   * Retrieve file buffer/stream from Cloudflare R2
   */
  async getFile(fileKey) {
    if (memoryStorage.has(fileKey)) {
      const item = memoryStorage.get(fileKey);
      return { body: item.buffer, contentType: item.mimeType };
    }

    const command = new GetObjectCommand({
      Bucket: config.r2.bucketName,
      Key: fileKey,
    });

    const response = await s3Client.send(command);
    return {
      body: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
    };
  },

  /**
   * Delete multiple files from Cloudflare R2
   */
  async deleteFiles(fileKeys) {
    if (!fileKeys || fileKeys.length === 0) return;

    // Clean memory storage
    fileKeys.forEach(key => memoryStorage.delete(key));

    const isMock = !config.r2.accessKeyId || (typeof config.r2.accessKeyId === 'string' && config.r2.accessKeyId.includes('mock'));
    if (isMock) {
      return;
    }

    try {
      const objects = fileKeys.map(key => ({ Key: key }));
      const command = new DeleteObjectsCommand({
        Bucket: config.r2.bucketName,
        Delete: { Objects: objects },
      });
      await s3Client.send(command);
      logger.info(`Deleted ${fileKeys.length} files from R2 bucket`);
    } catch (err) {
      logger.error('Failed to batch delete files from R2:', err);
    }
  },
};
