import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../logger/logger.js';

export type ContentStoreDriver = 'json' | 'supabase' | 'dual';

const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
const storageBucket =
  (process.env.SUPABASE_STORAGE_BUCKET ?? 'game-assets').trim();

const driverRaw = (process.env.CONTENT_STORE_DRIVER ?? 'json').trim().toLowerCase();
const contentStoreDriver: ContentStoreDriver =
  driverRaw === 'supabase'
    ? 'supabase'
    : driverRaw === 'dual'
      ? 'dual'
      : 'json';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client for DB + Storage. Returns null when Supabase is not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    logger.info('supabase_client_init', { url: supabaseUrl });
  }
  return supabaseClient;
}

export function getStorageBucket(): string {
  return storageBucket;
}

export function getContentStoreDriver(): ContentStoreDriver {
  return contentStoreDriver;
}

export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseServiceKey;
}
