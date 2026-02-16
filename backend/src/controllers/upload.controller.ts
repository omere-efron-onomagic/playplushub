import type { Request, Response } from 'express';
import { logger } from '../logger/logger.js';

/** POST /admin/uploads/images - single image upload. Field name: image */
export async function uploadImage(req: Request, res: Response) {
  try {
    const file = (req as Request & { file?: { filename: string } }).file;
    if (!file || !file.filename) {
      return res.status(400).json({ message: 'no file uploaded; use field name "image"' });
    }
    const publicPath = `/uploads/${file.filename}`;
    logger.info('image uploaded', {
      filename: file.filename,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(201).json({ url: publicPath });
  } catch (error) {
    logger.error('uploadImage failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}
