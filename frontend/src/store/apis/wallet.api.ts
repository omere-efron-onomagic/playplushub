import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from './baseQuery';

type RewardCoinsPayload = {
  gameId: string;
  rewardCoins: number;
};

type RewardCoinsResponse = {
  gameId: string;
  earnedCoins: number;
  coins: number;
};

export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: apiBaseQuery,
  endpoints: (builder) => ({
    rewardCoins: builder.mutation<RewardCoinsResponse, RewardCoinsPayload>({
      query: (body) => ({
        url: '/wallet/reward',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useRewardCoinsMutation } = walletApi;
