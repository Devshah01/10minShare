import { pool } from '../config/db.config.js';
import { logger } from '../utils/logger.js';
import { storageService } from './storage.service.js';

// In-memory DB fallback if PostgreSQL is not connected yet
const inMemoryShares = new Map();

export const shareService = {
  /**
   * Create a new share record with file references
   */
  async createShare(shortCode, files) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const shareRes = await client.query(
          `INSERT INTO shares (short_code, expires_at)
           VALUES ($1, $2)
           RETURNING id, short_code, created_at, expires_at`,
          [shortCode, expiresAt]
        );
        const share = shareRes.rows[0];

        const fileRecords = [];
        for (const file of files) {
          const fileRes = await client.query(
            `INSERT INTO share_files (share_id, file_key, original_name, file_size, mime_type)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, file_key, original_name, file_size, mime_type`,
            [share.id, file.fileKey, file.originalName, file.fileSize, file.mimeType]
          );
          fileRecords.push(fileRes.rows[0]);
        }

        await client.query('COMMIT');
        return { ...share, files: fileRecords };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (dbErr) {
      logger.warn('Database error or unconfigured DB connection. Using in-memory store fallback:', dbErr.message);
      
      const shareId = `mem-${Date.now()}`;
      const fileRecords = files.map((file, idx) => ({
        id: `file-${Date.now()}-${idx}`,
        file_key: file.fileKey,
        original_name: file.originalName,
        file_size: file.fileSize,
        mime_type: file.mimeType,
      }));

      const shareData = {
        id: shareId,
        short_code: shortCode,
        created_at: new Date(),
        expires_at: expiresAt,
        is_expired: false,
        files: fileRecords,
      };

      inMemoryShares.set(shortCode, shareData);
      return shareData;
    }
  },

  /**
   * Fetch share metadata and files by shortCode
   */
  async getShareByCode(shortCode) {
    let share = null;
    let files = [];

    try {
      const shareRes = await pool.query(
        `SELECT id, short_code, created_at, expires_at, is_expired
         FROM shares WHERE short_code = $1`,
        [shortCode]
      );
      
      if (shareRes.rows.length > 0) {
        share = shareRes.rows[0];
        const filesRes = await pool.query(
          `SELECT id, file_key, original_name, file_size, mime_type
           FROM share_files WHERE share_id = $1`,
          [share.id]
        );
        files = filesRes.rows;
      }
    } catch (err) {
      if (inMemoryShares.has(shortCode)) {
        const item = inMemoryShares.get(shortCode);
        share = {
          id: item.id,
          short_code: item.short_code,
          created_at: item.created_at,
          expires_at: item.expires_at,
          is_expired: item.is_expired,
        };
        files = item.files;
      }
    }

    if (!share) return null;

    // Check 10-minute expiration
    const now = new Date();
    if (new Date(share.expires_at) <= now || share.is_expired) {
      // Trigger automatic background cleanup for this expired share
      await this.deleteShare(share.id, shortCode, files.map(f => f.file_key));
      return { expired: true };
    }

    const remainingSeconds = Math.max(0, Math.floor((new Date(share.expires_at) - now) / 1000));

    return {
      ...share,
      remainingSeconds,
      files,
    };
  },

  /**
   * Delete a share and its associated files
   */
  async deleteShare(shareId, shortCode, fileKeys = []) {
    // Delete files from R2
    if (fileKeys.length > 0) {
      await storageService.deleteFiles(fileKeys);
    }

    // Clear in-memory cache
    if (shortCode) inMemoryShares.delete(shortCode);

    try {
      if (shareId && !String(shareId).startsWith('mem-')) {
        await pool.query('DELETE FROM shares WHERE id = $1', [shareId]);
      }
    } catch (err) {
      logger.error('Failed to delete share record from DB:', err.message);
    }
  },

  /**
   * Purge all shares that have passed the 10-minute threshold
   */
  async purgeExpiredShares() {
    const now = new Date();

    // Clean in-memory store
    for (const [code, item] of inMemoryShares.entries()) {
      if (new Date(item.expires_at) <= now) {
        logger.info(`Purging expired in-memory share: ${code}`);
        const fileKeys = item.files.map(f => f.file_key);
        await storageService.deleteFiles(fileKeys);
        inMemoryShares.delete(code);
      }
    }

    // Clean database store
    try {
      const expiredRes = await pool.query(
        `SELECT s.id, s.short_code, array_agg(sf.file_key) as file_keys
         FROM shares s
         LEFT JOIN share_files sf ON s.id = sf.share_id
         WHERE s.expires_at <= NOW() OR s.is_expired = TRUE
         GROUP BY s.id, s.short_code`
      );

      for (const row of expiredRes.rows) {
        logger.info(`Purging expired DB share: ${row.short_code}`);
        const fileKeys = (row.file_keys || []).filter(Boolean);
        await storageService.deleteFiles(fileKeys);
        await pool.query('DELETE FROM shares WHERE id = $1', [row.id]);
      }
    } catch (err) {
      // Quiet warning if DB is unconfigured
    }
  },
};
