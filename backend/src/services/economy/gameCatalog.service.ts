import type { GameCatalogEntry } from '../../types/economy.types.js';

/** Authoritative server-side game catalog (coin cost + reward rules). */
const GAME_CATALOG: GameCatalogEntry[] = [
  { gameId: '1', coinCost: 2, rewardCoins: 20, totalLevels: 2 },
  { gameId: '2', coinCost: 3, rewardCoins: 30 },
  { gameId: '3', coinCost: 5, rewardCoins: 50 },
  { gameId: '4', coinCost: 1, rewardCoins: 10 },
  { gameId: '5', coinCost: 4, rewardCoins: 40 },
  { gameId: '6', coinCost: 2, rewardCoins: 20 },
  { gameId: '7', coinCost: 3, rewardCoins: 30 },
  { gameId: '8', coinCost: 2, rewardCoins: 20 },
  { gameId: '9', coinCost: 5, rewardCoins: 50 },
  { gameId: '10', coinCost: 3, rewardCoins: 30 },
  { gameId: '11', coinCost: 4, rewardCoins: 40 },
  { gameId: '12', coinCost: 1, rewardCoins: 10 },
];

export function getGameCatalogEntry(gameId: string): GameCatalogEntry | null {
  return GAME_CATALOG.find((e) => e.gameId === gameId) ?? null;
}
