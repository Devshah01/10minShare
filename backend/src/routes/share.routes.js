import express from 'express';
import { shareController } from '../controllers/share.controller.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Health Check (Lightweight keep-alive, no DB query)
router.get('/health', shareController.getHealth);

// Optional DB Diagnostic Health Check (Manual testing only)
router.get('/health/db', shareController.getDatabaseHealth);

// Upload images & create 10-minute share session
router.post('/shares', uploadRateLimiter, uploadMiddleware, shareController.createShare);

// Fetch share metadata by short code
router.get('/shares/:shortCode', shareController.getShare);

// Stream file byte content
router.get('/shares/:shortCode/files/:fileId', shareController.getFile);

// Delete share session manually
router.delete('/shares/:shortCode', shareController.deleteShare);

export default router;
