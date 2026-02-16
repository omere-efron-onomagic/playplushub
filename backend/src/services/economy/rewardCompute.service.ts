import type { LinkFourOutcome } from '../../types/economy.types.js';
import { getGameCatalogEntry } from './gameCatalog.service.js';

/** Server-authoritative reward computation from game rules and outcome. */
export async function computeRewardFromOutcome(
  gameId: string,
  outcome: LinkFourOutcome,
  _roundId?: string,
): Promise<{ earnedCoins: number; valid: boolean }> {
  const entry = await getGameCatalogEntry(gameId);
  if (!entry) return { earnedCoins: 0, valid: false };

  if (!outcome.won) return { earnedCoins: 0, valid: true };

  const levelsRequired = entry.levelsPerRound ?? entry.totalLevels ?? outcome.totalLevels;
  if (
    outcome.levelsCompleted !== levelsRequired ||
    outcome.levelsCompleted < 1 ||
    levelsRequired < 1
  ) {
    return { earnedCoins: 0, valid: false };
  }

  return { earnedCoins: entry.rewardCoins, valid: true };
}
