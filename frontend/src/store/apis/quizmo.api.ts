import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from './baseQuery';

export type QuizmoStage = {
  stageId: string;
  title: string;
  totalQuestions: number;
};

export type QuizmoQuestion = {
  levelIndex: number;
  imageUrl: string;
  question: string;
  options: [string, string, string, string];
};

type CompleteAnswerPayload = {
  levelIndex: number;
  answerIndex: number | null;
};

export const quizmoApi = createApi({
  reducerPath: 'quizmoApi',
  baseQuery: apiBaseQuery,
  endpoints: (builder) => ({
    getQuizmoStages: builder.query<{ stages: QuizmoStage[] }, void>({
      query: () => '/quizmo/stages',
    }),
    getQuizmoStageQuestions: builder.query<
      { stageId: string; questions: QuizmoQuestion[]; timerSeconds: number },
      string
    >({
      query: (stageId) => `/quizmo/stages/${stageId}/questions`,
    }),
    submitQuizmoAnswer: builder.mutation<
      { correct: boolean; correctAnswerIndex: number },
      { stageId: string; levelIndex: number; answerIndex: number }
    >({
      query: ({ stageId, levelIndex, answerIndex }) => ({
        url: `/quizmo/stages/${stageId}/questions/${levelIndex}/submit`,
        method: 'POST',
        body: { answerIndex },
      }),
    }),
    completeQuizmoStage: builder.mutation<
      {
        stageId: string;
        correctCount: number;
        totalQuestions: number;
        coinsEarned: number;
        coins: number;
        formula: string;
        signupPromptCount?: number;
        signupRequired?: boolean;
      },
      { stageId: string; sessionToken: string; answers: CompleteAnswerPayload[] }
    >({
      query: ({ stageId, sessionToken, answers }) => ({
        url: `/quizmo/stages/${stageId}/complete`,
        method: 'POST',
        body: { stageId, sessionToken, answers },
      }),
    }),
  }),
});

export const {
  useGetQuizmoStagesQuery,
  useGetQuizmoStageQuestionsQuery,
  useSubmitQuizmoAnswerMutation,
  useCompleteQuizmoStageMutation,
} = quizmoApi;
