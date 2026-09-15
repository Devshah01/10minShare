import multer from 'multer';
import { config } from '../config/env.config.js';

// Memory storage to handle file buffers before uploading to Cloudflare R2
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow common image MIME types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed.'), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMB * 1024 * 1024, // 10MB per file
    files: config.maxImagesPerShare, // Max 10 images
  },
  fileFilter,
}).array('images', config.maxImagesPerShare);
