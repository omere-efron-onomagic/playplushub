import path from 'node:path';
import { getSupabaseClient, getStorageBucket } from '../config/supabase.js';
import { logger } from '../logger/logger.js';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
}

/**
 * Upload image buffer to Supabase Storage. Returns public URL or null on failure.
 */
export async function uploadToSupabaseStorage(
  buffer: Buffer,
  originalName: string,
  contentType: string,
): Promise<string | null> {
  const client = getSupabaseClient();
  const bucket = getStorageBucket();
  if (!client || !bucket) return null;
  const ext = path.extname(originalName) || '.jpg';
  const base = sanitizeFilename(
    path.basename(originalName, path.extname(originalName)),
  );
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const storagePath = `images/${base}-${suffix}${ext}`;
  const { data, error } = await client.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType,
      upsert: false,
    });
  if (error) {
    logger.error('supabase storage upload failed', {
      err: error,
      path: storagePath,
    });
    return null;
  }
  const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}
