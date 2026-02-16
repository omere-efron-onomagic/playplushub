/** API base URL. In prod, falls back to Render backend if env is missing (e.g. Vercel build before env set). */
export const VITE_API_URL =
  (import.meta.env.VITE_API_URL as string)?.trim() ||
  (import.meta.env.PROD ? 'https://playplushub.onrender.com' : 'http://localhost:3000');
export const POKE_API_URL = `https://pokeapi.co/api/v2`;
