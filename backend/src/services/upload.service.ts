import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { logger } from '../logger/logger.js';
import { uploadsDir } from '../config/storagePaths.js';

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
}

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (err) {
      logger.error('upload dir creation failed', { err });
      cb(err as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = sanitizeFilename(path.basename(file.originalname, path.extname(file.originalname)));
    const name = `${base}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error(`invalid file type: ${file.mimetype}`));
  }
  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

/** Resolve full filesystem path for uploads dir. */
export function getUploadsDir(): string {
  return uploadsDir;
}
