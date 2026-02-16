import 'dotenv/config';
import { getSupabaseClient } from '../config/supabase.js';
import {
  fileGetCinemojiPuzzles,
  fileGetCinemojiHints,
} from '../repositories/cinemojiFile.repository.js';

const DRY_RUN = process.argv.includes('--dry-run');

type PuzzleRow = {
  puzzle_index: number;
  category: string;
  left_emoji: string;
  right_emoji: string;
  title: string;
};

type HintRow = {
  mode: string;
  stage: number;
  hint_text: string;
};

async function main() {
  const client = getSupabaseClient();
  if (!client) {
    console.error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  if (DRY_RUN) console.log('[DRY RUN] No changes will be written.\n');

  const [puzzles, hints] = await Promise.all([
    fileGetCinemojiPuzzles(),
    fileGetCinemojiHints(),
  ]);

  console.log(`Puzzles: ${puzzles.length}, Mode1 hints: ${hints.mode1.size}, Mode2 hints: ${hints.mode2.size}`);

  if (puzzles.length < 40) {
    console.error('Expected at least 40 puzzles from Cinemoji/TheGame.txt');
    process.exit(1);
  }

  const puzzleRows: PuzzleRow[] = puzzles.slice(0, 40).map((p) => ({
    puzzle_index: p.index,
    category: p.category,
    left_emoji: p.leftEmoji,
    right_emoji: p.rightEmoji,
    title: p.title,
  }));

  const hintRows: HintRow[] = [];
  for (const [stage, text] of hints.mode1) {
    hintRows.push({ mode: 'mode1', stage, hint_text: text });
  }
  for (const [stage, text] of hints.mode2) {
    hintRows.push({ mode: 'mode2', stage, hint_text: text });
  }

  if (!DRY_RUN) {
    const { error: puzzlesErr } = await client
      .from('cinemoji_puzzles')
      .upsert(puzzleRows, { onConflict: 'puzzle_index', ignoreDuplicates: false });
    if (puzzlesErr) {
      console.error('Cinemoji puzzles upsert failed:', puzzlesErr);
      process.exit(1);
    }
    console.log('Cinemoji puzzles migrated.');

    const { error: hintsErr } = await client
      .from('cinemoji_stage_hints')
      .upsert(hintRows, { onConflict: 'mode,stage', ignoreDuplicates: false });
    if (hintsErr) {
      console.error('Cinemoji hints upsert failed:', hintsErr);
      process.exit(1);
    }
    console.log('Cinemoji hints migrated.');
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
