import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { logger } from '../logger/logger.js';
import { uploadsDir } from '../config/storagePaths.js';
import { isSupabaseConfigured } from '../config/supabase.js';

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    mkdir(uploadsDir, { recursive: true })
      .then(() => cb(null, uploadsDir))
      .catch((err: unknown) => {
        logger.error('upload dir creation failed', { err });
        cb(err instanceof Error ? err : new Error(String(err)), '');
      });
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = sanitizeFilename(
      path.basename(file.originalname, path.extname(file.originalname)),
    );
    const name = `${base}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const memoryStorage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error(`invalid file type: ${file.mimetype}`));
  }
  cb(null, true);
};

/** Use memory storage when Supabase is configured (for Storage upload), else disk. */
export const uploadMiddleware = multer({
  storage: isSupabaseConfigured() ? memoryStorage : diskStorage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

/** Resolve full filesystem path for uploads dir (used for static serve when not using Supabase). */
export function getUploadsDir(): string {
  return uploadsDir;
}
