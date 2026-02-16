import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { getSupabaseClient } from '../config/supabase.js';
import { resolveDataFilePath } from '../config/storagePaths.js';
import type { GameCatalogEntryDto, LinkFourLevelDto } from '../types/game.types.js';

const DRY_RUN = process.argv.includes('--dry-run');

type DbGameRow = {
  game_id: string;
  slug: string;
  title: string;
  category: string;
  cover_image_url: string;
  coin_cost: number;
  reward_coins: number;
  total_levels?: number;
  total_rounds?: number;
  levels_per_round?: number;
  enabled: boolean;
  updated_at: string;
  rating?: number;
  players?: string;
  is_hot?: boolean;
  is_pick?: boolean;
};

type DbLevelRow = {
  game_id: string;
  round_id: string | null;
  level: number;
  answer: string;
  images: string[];
  extra_letters: string;
  enabled: boolean;
};

function gameToRow(g: GameCatalogEntryDto): DbGameRow {
  return {
    game_id: g.gameId,
    slug: g.slug,
    title: g.title,
    category: g.category,
    cover_image_url: g.coverImageUrl,
    coin_cost: g.coinCost,
    reward_coins: g.rewardCoins,
    total_levels: g.totalLevels,
    total_rounds: g.totalRounds,
    levels_per_round: g.levelsPerRound,
    enabled: g.enabled,
    updated_at: g.updatedAt,
    rating: g.rating,
    players: g.players,
    is_hot: g.isHot,
    is_pick: g.isPick,
  };
}

function levelToRow(l: LinkFourLevelDto): DbLevelRow {
  return {
    game_id: l.gameId,
    round_id: l.roundId ?? null,
    level: l.level,
    answer: l.answer,
    images: [...l.images],
    extra_letters: l.extraLetters,
    enabled: l.enabled,
  };
}

async function main() {
  const client = getSupabaseClient();
  if (!client) {
    console.error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  if (DRY_RUN) console.log('[DRY RUN] No changes will be written.\n');

  const catalogPath = resolveDataFilePath('games_catalog.json');
  const levelsPath = resolveDataFilePath('link_four_levels.json');

  let games: GameCatalogEntryDto[];
  try {
    const content = await readFile(catalogPath, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    games = Array.isArray(parsed) ? (parsed as GameCatalogEntryDto[]) : [];
  } catch (err) {
    console.error('Failed to read games_catalog.json:', err);
    process.exit(1);
  }

  let levels: LinkFourLevelDto[];
  try {
    const content = await readFile(levelsPath, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    levels = Array.isArray(parsed) ? (parsed as LinkFourLevelDto[]) : [];
  } catch (err) {
    console.error('Failed to read link_four_levels.json:', err);
    process.exit(1);
  }

  console.log(`Games: ${games.length}, Levels: ${levels.length}`);

  if (!DRY_RUN) {
    const { error: gamesErr } = await client
      .from('games')
      .upsert(games.map(gameToRow), { onConflict: 'game_id', ignoreDuplicates: false });
    if (gamesErr) {
      console.error('Games upsert failed:', gamesErr);
      process.exit(1);
    }
    console.log('Games migrated.');

    const { error: delErr } = await client.from('link_four_levels').delete().neq('level', -9999);
    if (delErr) {
      console.error('Levels clear failed:', delErr);
      process.exit(1);
    }
    if (levels.length > 0) {
      const { error: levelsErr } = await client
        .from('link_four_levels')
        .insert(levels.map(levelToRow));
      if (levelsErr) {
        console.error('Levels insert failed:', levelsErr);
        process.exit(1);
      }
    }
    console.log('Levels migrated.');
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
