import { VITE_API_URL } from '@/consts/consts';

const DEV_ORIGIN = 'http://localhost:3000';

/**
 * Resolve image URL. Relative paths use API base when set.
 * In dev (empty base), full localhost:3000 URLs are converted to relative for same-origin proxy.
 */
export function toImageUrl(url: string): string {
  if (!url) return '';
  const base = (VITE_API_URL ?? '').replace(/\/$/, '');
  // Dev proxy: convert localhost:3000 URLs to relative for same-origin loading
  if (!base && url.startsWith(DEV_ORIGIN)) {
    return url.slice(DEV_ORIGIN.length) || '/';
  }
  // Production: convert our API base URLs to relative when same-host
  if (base && url.startsWith(base)) {
    return url.slice(base.length) || '/';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}
