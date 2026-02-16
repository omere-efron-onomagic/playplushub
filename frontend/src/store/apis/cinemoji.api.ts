import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from './baseQuery';

export type CinemojiPuzzle = {
  index: number;
  category: string;
  leftEmoji: string;
  rightEmoji: string;
  title: string;
};

export type CinemojiMode1Stage = {
  stage: number;
  hint: string;
  puzzles: CinemojiPuzzle[];
};

export type CinemojiMode2Round = {
  roundIndex: number;
  title: string;
  leftEmoji: string;
  rightEmoji: string;
  leftChoices: string[];
  rightChoices: string[];
};

export type CinemojiMode2Stage = {
  stage: number;
  hint: string;
  rounds: CinemojiMode2Round[];
};

export type CinemojiContentResponse = {
  mode1Stages: CinemojiMode1Stage[];
  mode2Stages: CinemojiMode2Stage[];
};

type Mode1SubmitPayload = {
  stage: number;
  puzzleIndex: number;
  guess: string;
};

type Mode2SubmitPayload = {
  stage: number;
  roundIndex: number;
  leftEmoji: string;
  rightEmoji: string;
};

type HintPayload = {
  mode: 'mode1' | 'mode2';
  stage: number;
  watchRewarded: boolean;
};

type ContinueLivesPayload = {
  watchRewarded: boolean;
};

export const cinemojiApi = createApi({
  reducerPath: 'cinemojiApi',
  baseQuery: apiBaseQuery,
  endpoints: (builder) => ({
    getCinemojiContent: builder.query<CinemojiContentResponse, void>({
      query: () => '/cinemoji/content',
    }),
    submitMode1Guess: builder.mutation<
      { correct: boolean; title: string; adPlaceholder: string },
      Mode1SubmitPayload
    >({
      query: (body) => ({ url: '/cinemoji/mode1/submit', method: 'POST', body }),
    }),
    submitMode2Match: builder.mutation<
      { correct: boolean; title: string; adPlaceholder: string },
      Mode2SubmitPayload
    >({
      query: (body) => ({ url: '/cinemoji/mode2/submit', method: 'POST', body }),
    }),
    requestHint: builder.mutation<
      { granted: boolean; message?: string; rewardedPlaceholder?: string; hint?: string },
      HintPayload
    >({
      query: (body) => ({ url: '/cinemoji/hint', method: 'POST', body }),
    }),
    continueMode2Lives: builder.mutation<
      { granted: boolean; rewardedPlaceholder?: string; extraLives?: number; restartRequired: boolean },
      ContinueLivesPayload
    >({
      query: (body) => ({ url: '/cinemoji/mode2/lives/continue', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetCinemojiContentQuery,
  useSubmitMode1GuessMutation,
  useSubmitMode2MatchMutation,
  useRequestHintMutation,
  useContinueMode2LivesMutation,
} = cinemojiApi;
