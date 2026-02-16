import path from 'node:path';

const backendRoot = process.cwd();

function resolveDirFromEnv(envValue: string | undefined, fallback: string): string {
  const value = envValue?.trim();
  if (!value) {
    return fallback;
  }
  return path.isAbsolute(value) ? value : path.resolve(backendRoot, value);
}

const defaultDataDir = path.resolve(backendRoot, 'src/data');
const defaultUploadsDir = path.resolve(backendRoot, 'uploads');

export const dataDir = resolveDirFromEnv(process.env.DATA_DIR, defaultDataDir);
export const uploadsDir = resolveDirFromEnv(process.env.UPLOADS_DIR, defaultUploadsDir);

export function resolveDataFilePath(fileName: string): string {
  return path.join(dataDir, fileName);
}
