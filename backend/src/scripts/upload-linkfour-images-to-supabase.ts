import 'dotenv/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStorageBucket, getSupabaseClient } from '../config/supabase.js';
import { resolveDataFilePath } from '../config/storagePaths.js';
import type { LinkFourLevelDto } from '../types/game.types.js';

const DRY_RUN = process.argv.includes('--dry-run');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const scriptsDir = path.dirname(currentFile);
  const backendSrcDir = path.resolve(scriptsDir, '..');
  const backendDir = path.resolve(backendSrcDir, '..');
  return path.resolve(backendDir, '..');
}

function parseLevelFromFolderName(folderName: string): number | null {
  const match = folderName.match(/level\s*(\d+)/i);
  if (!match?.[1]) return null;
  const level = Number(match[1]);
  if (!Number.isInteger(level) || level < 1) return null;
  return level;
}

async function listLevelFolders(linkFourDir: string): Promise<Map<number, string>> {
  const entries = await readdir(linkFourDir, { withFileTypes: true });
  const byLevel = new Map<number, string>();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const level = parseLevelFromFolderName(entry.name);
    if (!level) continue;
    byLevel.set(level, path.join(linkFourDir, entry.name));
  }
  return byLevel;
}

async function listImageFiles(folderPath: string): Promise<string[]> {
  const entries = await readdir(folderPath, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((name) => path.join(folderPath, name));
  return files;
}

function toDbRows(levels: LinkFourLevelDto[]) {
  return levels.map((l) => ({
    game_id: l.gameId,
    round_id: l.roundId ?? null,
    level: l.level,
    answer: l.answer,
    images: l.images,
    extra_letters: l.extraLetters,
    enabled: l.enabled,
  }));
}

async function uploadImage(
  level: number,
  imageIndex: number,
  localPath: string,
  bucket: string,
): Promise<string> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not available');

  const buffer = await readFile(localPath);
  const ext = path.extname(localPath).toLowerCase() || '.jpg';
  const cleanExt = IMAGE_EXTENSIONS.has(ext) ? ext : '.jpg';
  const contentType =
    cleanExt === '.png'
      ? 'image/png'
      : cleanExt === '.webp'
        ? 'image/webp'
        : 'image/jpeg';
  const storagePath = `images/linkfour/level-${level}-${imageIndex + 1}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}${cleanExt}`;

  if (DRY_RUN) {
    return `https://dry-run.local/${storagePath}`;
  }

  const { data, error } = await client.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });
  if (error) {
    throw new Error(`upload failed for ${localPath}: ${error.message}`);
  }
  const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

async function main() {
  const client = getSupabaseClient();
  const bucket = getStorageBucket();
  if (!client || !bucket) {
    console.error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const projectRoot = getProjectRoot();
  const linkFourDir = path.join(projectRoot, 'linkFour');
  const levelsPath = resolveDataFilePath('link_four_levels.json');

  const levelsRaw = await readFile(levelsPath, 'utf-8');
  const levelsParsed = JSON.parse(levelsRaw) as unknown;
  const levels = (Array.isArray(levelsParsed) ? levelsParsed : []) as LinkFourLevelDto[];
  if (levels.length === 0) {
    console.error('No Link Four levels found in link_four_levels.json');
    process.exit(1);
  }

  const levelFolders = await listLevelFolders(linkFourDir);
  if (levelFolders.size === 0) {
    console.error(`No level folders found in ${linkFourDir}`);
    process.exit(1);
  }

  const updated: LinkFourLevelDto[] = [];
  for (const level of levels) {
    const folder = levelFolders.get(level.level);
    if (!folder) {
      console.error(`Missing source folder for level ${level.level}`);
      process.exit(1);
    }
    const imageFiles = await listImageFiles(folder);
    if (imageFiles.length < 4) {
      console.error(`Level ${level.level} has ${imageFiles.length} image(s), expected at least 4`);
      process.exit(1);
    }

    const uploadedUrls: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      const imageFile = imageFiles[i];
      if (!imageFile) {
        console.error(`Missing image ${i + 1} for level ${level.level}`);
        process.exit(1);
      }
      const url = await uploadImage(level.level, i, imageFile, bucket);
      uploadedUrls.push(url);
      console.log(`[level ${level.level}] uploaded image ${i + 1}: ${path.basename(imageFile)}`);
    }

    updated.push({
      ...level,
      images: uploadedUrls as [string, string, string, string],
    });
  }

  if (DRY_RUN) {
    console.log('Dry run complete. No DB/JSON updates were written.');
    return;
  }

  await writeFile(levelsPath, `${JSON.stringify(updated, null, 2)}\n`, 'utf-8');
  const { error } = await client
    .from('link_four_levels')
    .upsert(toDbRows(updated), { onConflict: 'game_id,level', ignoreDuplicates: false });
  if (error) {
    console.error('Failed to upsert link_four_levels:', error.message);
    process.exit(1);
  }

  console.log(`Updated ${updated.length} levels with uploaded image URLs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
