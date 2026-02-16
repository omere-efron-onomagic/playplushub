export type EconomyTransactionKind = 'spend' | 'reward';

export type EconomyTransaction = {
  txId: string;
  userId: string;
  kind: EconomyTransactionKind;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  gameId: string;
  sessionId: string;
  createdAt: string;
  /** Set for guest transactions; userId holds guest id when present. */
  guestId?: string;
};

export type GameCatalogEntry = {
  gameId: string;
  coinCost: number;
  rewardCoins: number;
  /** For level-based games. Total levels to complete for full reward. */
  totalLevels?: number;
  /** For round-based games. Levels per round. */
  levelsPerRound?: number;
  totalRounds?: number;
};

export type GameSessionPayload = {
  sessionId: string;
  userId: string;
  gameId: string;
  exp: number;
  /** For round-based games. Required when game has totalRounds. */
  roundId?: string;
  /** When true, userId holds the guest ID; claim requires X-Guest-Token. */
  isGuest?: boolean;
};

export type LinkFourOutcome = {
  levelsCompleted: number;
  totalLevels: number;
  won: boolean;
};
