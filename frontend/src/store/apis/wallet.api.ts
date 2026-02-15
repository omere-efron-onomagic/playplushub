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

type StartSessionPayload = { gameId: string };

type StartSessionResponse = {
  sessionId: string;
  sessionToken: string;
  coins: number;
  coinCost: number;
};

type ClaimPayload = {
  sessionToken: string;
  outcome: { levelsCompleted: number; totalLevels: number; won: boolean };
};

type ClaimResponse = {
  earnedCoins: number;
  coins: number;
  signupPromptCount?: number;
  signupRequired?: boolean;
};

export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: apiBaseQuery,
  endpoints: (builder) => ({
    rewardCoins: builder.mutation<RewardCoinsResponse, RewardCoinsPayload>({
      query: (body) => ({ url: '/wallet/reward', method: 'POST', body }),
    }),
    startGameSession: builder.mutation<StartSessionResponse, StartSessionPayload>({
      query: (body) => ({ url: '/wallet/session/start', method: 'POST', body }),
    }),
    claimGameSessionReward: builder.mutation<ClaimResponse, ClaimPayload>({
      query: (body) => ({ url: '/wallet/session/claim', method: 'POST', body }),
    }),
  }),
});

export const { useRewardCoinsMutation, useStartGameSessionMutation, useClaimGameSessionRewardMutation } = walletApi;
