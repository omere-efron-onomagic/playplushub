import type { GameCatalogEntry } from '../../types/economy.types.js';
import { getGameById } from '../gameStore.service.js';

/**
 * Economy-compatible catalog lookup. Reads from persisted game store.
 * Returns null for unknown or disabled games.
 */
export async function getGameCatalogEntry(gameId: string): Promise<GameCatalogEntry | null> {
  const entry = await getGameById(gameId);
  if (!entry) return null;
  return {
    gameId: entry.gameId,
    coinCost: entry.coinCost,
    rewardCoins: entry.rewardCoins,
    totalLevels: entry.totalLevels,
    levelsPerRound: entry.levelsPerRound,
    totalRounds: entry.totalRounds,
  };
}
