import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { VITE_API_URL } from '@/consts/consts';

/** MVP: no admin secret required. */
const adminBaseQuery = fetchBaseQuery({ baseUrl: VITE_API_URL });

export type ApiGame = {
  gameId: string;
  slug: string;
  title: string;
  category: string;
  coverImageUrl: string;
  coinCost: number;
  rewardCoins: number;
  totalLevels?: number;
  enabled: boolean;
  updatedAt: string;
  rating?: number;
  players?: string;
  isHot?: boolean;
  isPick?: boolean;
};

export type CreateGameBody = {
  gameId: string;
  slug: string;
  title: string;
  category: string;
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

export type PatchGameBody = Partial<CreateGameBody>;

export type LinkFourLevel = {
  gameId: string;
  roundId?: string;
  level: number;
  answer: string;
  images: [string, string, string, string];
  extraLetters: string;
  enabled: boolean;
};

export type UpsertLevelItem = {
  roundId: string;
  level: number;
  answer: string;
  images: [string, string, string, string];
  extraLetters: string;
  enabled?: boolean;
};

export type CreateRoundLevel = {
  answer: string;
  images: [string, string, string, string];
};

export type CinemojiPuzzle = {
  index: number;
  category: string;
  leftEmoji: string;
  rightEmoji: string;
  title: string;
};

export type CinemojiHint = {
  mode: 'mode1' | 'mode2';
  stage: number;
  hintText: string;
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: adminBaseQuery,
  tagTypes: ['AdminGames', 'AdminLevels', 'GameLevels', 'GameRounds', 'CinemojiPuzzles', 'CinemojiHints'],
  endpoints: (builder) => ({
    getAdminGames: builder.query<ApiGame[], void>({
      query: () => '/admin/games',
      transformResponse: (res: { games: ApiGame[] }) => res.games ?? [],
      providesTags: ['AdminGames'],
    }),
    createGame: builder.mutation<ApiGame, CreateGameBody>({
      query: (body) => ({ url: '/admin/games', method: 'POST', body }),
      invalidatesTags: ['AdminGames'],
    }),
    patchGame: builder.mutation<ApiGame, { gameId: string; body: PatchGameBody }>({
      query: ({ gameId, body }) => ({
        url: `/admin/games/${gameId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminGames'],
    }),
    upsertLevels: builder.mutation<
      { levels: LinkFourLevel[] },
      { gameId: string; levels: UpsertLevelItem[] }
    >({
      query: ({ gameId, levels }) => ({
        url: `/admin/games/${gameId}/levels`,
        method: 'POST',
        body: { levels },
      }),
      invalidatesTags: (_, __, { gameId }) => [
        'AdminLevels',
        { type: 'GameLevels', id: gameId },
      ],
    }),
    uploadImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/admin/uploads/images',
        method: 'POST',
        body: formData,
      }),
    }),
    createRound: builder.mutation<
      { levels: LinkFourLevel[] },
      { gameId: string; roundId: string; levels: CreateRoundLevel[] }
    >({
      query: ({ gameId, roundId, levels }) => ({
        url: `/admin/games/${gameId}/rounds`,
        method: 'POST',
        body: { roundId, levels },
      }),
      invalidatesTags: (_, __, { gameId }) => [
        'AdminLevels',
        { type: 'GameLevels', id: gameId },
        { type: 'GameRounds', id: gameId },
      ],
    }),
    // Cinemoji admin endpoints
    upsertCinemojiPuzzle: builder.mutation<CinemojiPuzzle, CinemojiPuzzle>({
      query: (puzzle) => ({
        url: '/admin/cinemoji/puzzles',
        method: 'POST',
        body: puzzle,
      }),
      invalidatesTags: ['CinemojiPuzzles'],
    }),
    batchUpsertCinemojiPuzzles: builder.mutation<{ puzzles: CinemojiPuzzle[] }, CinemojiPuzzle[]>({
      query: (puzzles) => ({
        url: '/admin/cinemoji/puzzles/batch',
        method: 'POST',
        body: { puzzles },
      }),
      invalidatesTags: ['CinemojiPuzzles'],
    }),
    deleteCinemojiPuzzle: builder.mutation<void, number>({
      query: (index) => ({
        url: `/admin/cinemoji/puzzles/${index}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CinemojiPuzzles'],
    }),
    upsertCinemojiHint: builder.mutation<CinemojiHint, CinemojiHint>({
      query: (hint) => ({
        url: '/admin/cinemoji/hints',
        method: 'POST',
        body: hint,
      }),
      invalidatesTags: ['CinemojiHints'],
    }),
    deleteCinemojiHint: builder.mutation<void, { mode: 'mode1' | 'mode2'; stage: number }>({
      query: ({ mode, stage }) => ({
        url: `/admin/cinemoji/hints?mode=${mode}&stage=${stage}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CinemojiHints'],
    }),
  }),
});

export const {
  useGetAdminGamesQuery,
  useCreateGameMutation,
  usePatchGameMutation,
  useUpsertLevelsMutation,
  useUploadImageMutation,
  useCreateRoundMutation,
  useUpsertCinemojiPuzzleMutation,
  useBatchUpsertCinemojiPuzzlesMutation,
  useDeleteCinemojiPuzzleMutation,
  useUpsertCinemojiHintMutation,
  useDeleteCinemojiHintMutation,
} = adminApi;
