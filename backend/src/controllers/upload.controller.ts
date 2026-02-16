import type { Request, Response } from 'express';
import { logger } from '../logger/logger.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import { uploadToSupabaseStorage } from '../services/uploadSupabase.service.js';

type MulterFile = { filename?: string; buffer?: Buffer; mimetype?: string; originalname?: string };

/** POST /admin/uploads/images - single image upload. Field name: image */
export async function uploadImage(req: Request, res: Response) {
  try {
    const file = (req as Request & { file?: MulterFile }).file;
    if (!file) {
      return res.status(400).json({ message: 'no file uploaded; use field name "image"' });
    }
    if (isSupabaseConfigured() && file.buffer) {
      const publicUrl = await uploadToSupabaseStorage(
        file.buffer,
        file.originalname ?? 'image.jpg',
        file.mimetype ?? 'image/jpeg',
      );
      if (!publicUrl) {
        return res.status(500).json({ message: 'storage upload failed' });
      }
      logger.info('image uploaded to Supabase Storage', {
        requestId: (req as Request & { requestId?: string }).requestId,
      });
      return res.status(201).json({ url: publicUrl });
    }
    if (!file.filename) {
      return res.status(400).json({ message: 'no file uploaded; use field name "image"' });
    }
    const publicPath = `/uploads/${file.filename}`;
    logger.info('image uploaded', {
      filename: file.filename,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(201).json({ url: publicPath });
  } catch (error) {
    logger.error('uploadImage failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}
