import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from './baseQuery';
import type { Game } from '@/types/game.type';
import { toImageUrl } from '@/utils/imageUrl';

export type ApiGame = {
  gameId: string;
  slug: string;
  title: string;
  category: string;
  coverImageUrl: string;
  coinCost: number;
  rewardCoins: number;
  totalLevels?: number;
  totalRounds?: number;
  levelsPerRound?: number;
  enabled: boolean;
  updatedAt: string;
  rating?: number;
  players?: string;
  isHot?: boolean;
  isPick?: boolean;
};

export type LinkFourLevel = {
  gameId: string;
  roundId?: string;
  level: number;
  answer: string;
  images: [string, string, string, string];
  extraLetters: string;
  enabled: boolean;
};

export type GameRound = {
  roundId: string;
  levels: LinkFourLevel[];
};

function toGame(api: ApiGame): Game {
  return {
    id: api.gameId,
    title: api.title,
    category: api.category as Game['category'],
    image: toImageUrl(api.coverImageUrl),
    coinCost: api.coinCost,
    rewardCoins: api.rewardCoins,
    rating: api.rating ?? 0,
    players: api.players ?? '0',
    isHot: api.isHot ?? false,
    isPick: api.isPick ?? false,
    totalRounds: api.totalRounds,
    levelsPerRound: api.levelsPerRound,
  };
}

export const gamesApi = createApi({
  reducerPath: 'gamesApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Games', 'GameLevels', 'GameRounds'],
  endpoints: (builder) => ({
    getGames: builder.query<Game[], void>({
      query: () => '/games',
      transformResponse: (res: { games: ApiGame[] }) =>
        (res.games ?? []).map(toGame),
      providesTags: ['Games'],
    }),
    getGame: builder.query<Game | null, string>({
      query: (gameId) => `/games/${gameId}`,
      transformResponse: (res: ApiGame | null) => (res ? toGame(res) : null),
    }),
    getGameLevels: builder.query<LinkFourLevel[], string>({
      query: (gameId) => `/games/${gameId}/levels`,
      transformResponse: (res: { levels: LinkFourLevel[] }) =>
        res.levels ?? [],
      providesTags: (_res, _err, gameId) => [{ type: 'GameLevels', id: gameId }],
    }),
    getGameRounds: builder.query<GameRound[], string>({
      query: (gameId) => `/games/${gameId}/rounds`,
      transformResponse: (res: { rounds: GameRound[] }) => res.rounds ?? [],
      providesTags: (_res, _err, gameId) => [{ type: 'GameRounds', id: gameId }],
    }),
    getRoundLevels: builder.query<LinkFourLevel[], { gameId: string; roundId: string }>({
      query: ({ gameId, roundId }) =>
        `/games/${gameId}/rounds/${roundId}/levels`,
      transformResponse: (res: { levels: LinkFourLevel[] }) => res.levels ?? [],
      providesTags: (_res, _err, { gameId }) => [
        { type: 'GameLevels', id: gameId },
        { type: 'GameRounds', id: gameId },
      ],
    }),
    getGameProgress: builder.query<string[], string>({
      query: (gameId) => `/games/${gameId}/progress`,
      transformResponse: (res: { completedRoundIds: string[] }) =>
        res.completedRoundIds ?? [],
      providesTags: (_res, _err, gameId) => [{ type: 'GameRounds', id: gameId }],
    }),
  }),
});

export const {
  useGetGamesQuery,
  useGetGameQuery,
  useGetGameLevelsQuery,
  useGetGameRoundsQuery,
  useGetRoundLevelsQuery,
  useGetGameProgressQuery,
} = gamesApi;
