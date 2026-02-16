import 'dotenv/config';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getSupabaseClient, getStorageBucket } from '../config/supabase.js';
import { resolveDataFilePath } from '../config/storagePaths.js';
import { uploadsDir } from '../config/storagePaths.js';
import type { LinkFourLevelDto } from '../types/game.types.js';

const DRY_RUN = process.argv.includes('--dry-run');
const UPDATE_JSON = process.argv.includes('--update-json');

const UPLOAD_PREFIX = '/uploads/';

async function main() {
  const client = getSupabaseClient();
  const bucket = getStorageBucket();
  if (!client || !bucket) {
    console.error('Supabase not configured.');
    process.exit(1);
  }
  if (DRY_RUN) console.log('[DRY RUN] No changes will be written.\n');

  const levelsPath = resolveDataFilePath('link_four_levels.json');
  let levels: LinkFourLevelDto[];
  try {
    const content = await readFile(levelsPath, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    levels = Array.isArray(parsed) ? (parsed as LinkFourLevelDto[]) : [];
  } catch (err) {
    console.error('Failed to read link_four_levels.json:', err);
    process.exit(1);
  }

  const urlToLocalPath = new Map<string, string>();
  for (const l of levels) {
    for (const url of l.images) {
      if (url.startsWith(UPLOAD_PREFIX)) {
        const filename = url.slice(UPLOAD_PREFIX.length);
        const localPath = path.join(uploadsDir, filename);
        urlToLocalPath.set(url, localPath);
      }
    }
  }
  const uniqueUrls = [...new Set(urlToLocalPath.keys())];
  console.log(`Found ${uniqueUrls.length} local upload URLs to migrate.`);

  const urlToPublicUrl = new Map<string, string>();
  for (const url of uniqueUrls) {
    const localPath = urlToLocalPath.get(url)!;
    let buffer: Buffer;
    try {
      buffer = await readFile(localPath);
    } catch (_err) {
      console.warn(`Skip (file not found): ${localPath}`);
      continue;
    }
    const filename = path.basename(localPath);
    const ext = path.extname(filename) || '.jpg';
    const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
    const storagePath = `images/${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    if (DRY_RUN) {
      console.log(`Would upload: ${filename} -> ${storagePath}`);
      urlToPublicUrl.set(url, `https://placeholder/${storagePath}`);
      continue;
    }
    const { data, error } = await client.storage.from(bucket).upload(storagePath, buffer, {
      contentType: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg',
      upsert: false,
    });
    if (error) {
      console.error(`Upload failed for ${filename}:`, error);
      continue;
    }
    const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
    urlToPublicUrl.set(url, urlData.publicUrl);
    console.log(`Uploaded: ${filename} -> ${urlData.publicUrl}`);
  }

  const remap = (img: string) => urlToPublicUrl.get(img) ?? img;
  const updatedLevels = levels.map((l) => ({
    ...l,
    images: l.images.map(remap) as [string, string, string, string],
  }));
  const changed = updatedLevels.some((l, i) =>
    l.images.some((img, j) => img !== levels[i]?.images[j]),
  );
  if (!changed) {
    console.log('No URL changes needed.');
    return;
  }
  if (DRY_RUN) {
    console.log('Would update level image URLs in Supabase.');
    return;
  }

  const rows = updatedLevels.map((l) => ({
    game_id: l.gameId,
    round_id: l.roundId ?? null,
    level: l.level,
    answer: l.answer,
    images: l.images,
    extra_letters: l.extraLetters,
    enabled: l.enabled,
  }));
  const { error } = await client
    .from('link_four_levels')
    .upsert(rows, { onConflict: 'game_id,level', ignoreDuplicates: false });
  if (error) {
    console.error('Level upsert failed:', error);
    process.exit(1);
  }
  console.log('Levels updated with new image URLs.');
  if (UPDATE_JSON) {
    await writeFile(
      levelsPath,
      JSON.stringify(updatedLevels, null, 2),
      'utf-8',
    );
    console.log('Updated link_four_levels.json with new URLs.');
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
