import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { VITE_API_URL } from '@/consts/consts';
import type { RootState } from '@/store';

const adminBaseQuery = fetchBaseQuery({
  baseUrl: VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const secret = (getState() as RootState).admin?.secret ?? '';
    if (secret) {
      headers.set('x-admin-secret', secret);
    }
    return headers;
  },
});

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

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: adminBaseQuery,
  tagTypes: ['AdminGames', 'AdminLevels', 'GameLevels', 'GameRounds'],
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
  }),
});

export const {
  useGetAdminGamesQuery,
  useCreateGameMutation,
  usePatchGameMutation,
  useUpsertLevelsMutation,
  useUploadImageMutation,
  useCreateRoundMutation,
} = adminApi;
