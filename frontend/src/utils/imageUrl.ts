import { VITE_API_URL } from '@/consts/consts';

/**
 * Resolve image URL from API. Relative paths (e.g. /uploads/...) are prefixed with API base.
 */
export function toImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = (VITE_API_URL ?? '').replace(/\/$/, '');
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}
