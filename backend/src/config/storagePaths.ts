import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Use file location for reliable paths on Render (process.cwd() can differ at runtime). */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendSrc = path.resolve(__dirname, '..');
const backendRoot = path.resolve(backendSrc, '..');

function resolveDirFromEnv(envValue: string | undefined, fallback: string): string {
  const value = envValue?.trim();
  if (!value) {
    return fallback;
  }
  return path.isAbsolute(value) ? value : path.resolve(backendRoot, value);
}

const defaultDataDir = path.join(backendSrc, 'data');
const defaultUploadsDir = path.resolve(backendRoot, 'uploads');

export const dataDir = resolveDirFromEnv(process.env.DATA_DIR, defaultDataDir);
export const uploadsDir = resolveDirFromEnv(process.env.UPLOADS_DIR, defaultUploadsDir);

export function resolveDataFilePath(fileName: string): string {
  return path.join(dataDir, fileName);
}
