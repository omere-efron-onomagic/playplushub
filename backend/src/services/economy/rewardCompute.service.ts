import type { LinkFourOutcome } from '../../types/economy.types.js';
import { getGameCatalogEntry } from './gameCatalog.service.js';

/** Server-authoritative reward computation from game rules and outcome. */
export function computeRewardFromOutcome(
  gameId: string,
  outcome: LinkFourOutcome,
): { earnedCoins: number; valid: boolean } {
  const entry = getGameCatalogEntry(gameId);
  if (!entry) return { earnedCoins: 0, valid: false };

  if (!outcome.won) return { earnedCoins: 0, valid: true };

  const totalLevels = entry.totalLevels ?? outcome.totalLevels;
  if (
    outcome.levelsCompleted !== totalLevels ||
    outcome.levelsCompleted < 1 ||
    totalLevels < 1
  ) {
    return { earnedCoins: 0, valid: false };
  }

  return { earnedCoins: entry.rewardCoins, valid: true };
}
