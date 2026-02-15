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
};

export type GameCatalogEntry = {
  gameId: string;
  coinCost: number;
  rewardCoins: number;
  /** For level-based games (e.g. Link Four). Total levels to complete for full reward. */
  totalLevels?: number;
};

export type GameSessionPayload = {
  sessionId: string;
  userId: string;
  gameId: string;
  exp: number;
};

export type LinkFourOutcome = {
  levelsCompleted: number;
  totalLevels: number;
  won: boolean;
};
