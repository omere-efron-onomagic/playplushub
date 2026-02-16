/**
 * Game catalog and Link Four level types for admin-managed content.
 */

export type GameCategory =
  | 'Puzzle'
  | 'Simulation'
  | 'Adventure'
  | 'Racing'
  | 'Trivia'
  | 'Action';

/** Persisted game catalog entry (source of truth). */
export type GameCatalogEntryDto = {
  gameId: string;
  slug: string;
  title: string;
  category: GameCategory;
  coverImageUrl: string;
  coinCost: number;
  rewardCoins: number;
  totalLevels?: number;
  /** For round-based games: total rounds; each round has levelsPerRound levels. */
  totalRounds?: number;
  levelsPerRound?: number;
  enabled: boolean;
  updatedAt: string;
  /** Optional display metadata (rating, players, badges). */
  rating?: number;
  players?: string;
  isHot?: boolean;
  isPick?: boolean;
};

/** Link Four level definition (persisted). */
export type LinkFourLevelDto = {
  gameId: string;
  /** Required for round-based games. Fallback: round-{ceil(level/2)}. */
  roundId?: string;
  level: number;
  answer: string;
  images: [string, string, string, string];
  extraLetters: string;
  enabled: boolean;
};

/** Round metadata (derived from levels). */
export type GameRoundDto = {
  roundId: string;
  gameId: string;
  levelIds: number[];
  levels: LinkFourLevelDto[];
};

/** Create game request body (admin). */
export type CreateGameBody = {
  gameId: string;
  slug: string;
  title: string;
  category: GameCategory;
  coverImageUrl: string;
  coinCost: number;
  rewardCoins: number;
  totalLevels?: number;
  enabled?: boolean;
  rating?: number;
  players?: string;
  isHot?: boolean;
  isPick?: boolean;
};

/** Patch game request body (admin). */
export type PatchGameBody = Partial<
  Pick<
    GameCatalogEntryDto,
    | 'slug'
    | 'title'
    | 'category'
    | 'coverImageUrl'
    | 'coinCost'
    | 'rewardCoins'
    | 'totalLevels'
    | 'enabled'
    | 'rating'
    | 'players'
    | 'isHot'
    | 'isPick'
  >
>;

/** Create/Replace levels request body (admin). */
export type UpsertLevelsBody = {
  levels: Array<{
    roundId: string;
    level: number;
    answer: string;
    images: [string, string, string, string];
    extraLetters: string;
    enabled?: boolean;
  }>;
};

/** Create round request body (admin, upload-first UX). extraLetters auto-generated. */
export type CreateRoundBody = {
  roundId: string;
  levels: Array<{
    answer: string;
    images: [string, string, string, string];
  }>;
};
