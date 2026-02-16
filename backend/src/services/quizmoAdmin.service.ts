import { getSupabaseClient, getContentStoreDriver } from '../config/supabase.js';
import { logger } from '../logger/logger.js';
import type { QuizmoQuestionInternal } from '../types/quizmo.types.js';
import {
  supabaseGetQuizmoStages,
  supabaseGetQuizmoQuestionsByStage,
  supabaseUpsertQuizmoStage,
  supabaseUpsertQuizmoQuestions,
  supabaseDeleteQuizmoStage,
  supabaseDeleteQuizmoQuestion,
} from '../repositories/quizmoSupabase.repository.js';

function useSupabase(): boolean {
  const driver = getContentStoreDriver();
  return driver === 'supabase' || driver === 'dual';
}

export type QuizmoStageWithQuestions = {
  stageId: string;
  title: string;
  questions: QuizmoQuestionInternal[];
};

/**
 * List all stages with their questions (admin view).
 */
export async function listAllQuizmoStages(): Promise<QuizmoStageWithQuestions[]> {
  if (!useSupabase()) {
    throw new Error('Quizmo admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  const summaries = await supabaseGetQuizmoStages();
  const stages: QuizmoStageWithQuestions[] = [];

  for (const summary of summaries) {
    const questions = await supabaseGetQuizmoQuestionsByStage(summary.stageId);
    stages.push({
      stageId: summary.stageId,
      title: summary.title,
      questions: questions ?? [],
    });
  }

  return stages;
}

/**
 * Get a single stage with questions.
 */
export async function getQuizmoStageWithQuestions(stageId: string): Promise<QuizmoStageWithQuestions | null> {
  if (!useSupabase()) {
    throw new Error('Quizmo admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  const summaries = await supabaseGetQuizmoStages();
  const summary = summaries.find((s) => s.stageId === stageId);
  if (!summary) return null;

  const questions = await supabaseGetQuizmoQuestionsByStage(stageId);
  return {
    stageId: summary.stageId,
    title: summary.title,
    questions: questions ?? [],
  };
}

/**
 * Create or update a stage (upsert).
 */
export async function upsertQuizmoStage(stageId: string, title: string): Promise<void> {
  if (!useSupabase()) {
    throw new Error('Quizmo admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  await supabaseUpsertQuizmoStage(stageId, title);
  logger.info('quizmo_stage upserted', { stageId, title });
}

/**
 * Upsert questions for a stage (replaces all questions for the stage).
 */
export async function upsertQuizmoStageQuestions(
  stageId: string,
  questions: QuizmoQuestionInternal[]
): Promise<void> {
  if (!useSupabase()) {
    throw new Error('Quizmo admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  await supabaseUpsertQuizmoQuestions(stageId, questions);
  logger.info('quizmo_questions upserted', { stageId, count: questions.length });
}

/**
 * Delete a stage and all its questions.
 */
export async function deleteQuizmoStage(stageId: string): Promise<void> {
  if (!useSupabase()) {
    throw new Error('Quizmo admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  await supabaseDeleteQuizmoStage(stageId);
  logger.info('quizmo_stage deleted', { stageId });
}

/**
 * Delete a single question from a stage.
 */
export async function deleteQuizmoQuestion(stageId: string, levelIndex: number): Promise<void> {
  if (!useSupabase()) {
    throw new Error('Quizmo admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  await supabaseDeleteQuizmoQuestion(stageId, levelIndex);
  logger.info('quizmo_question deleted', { stageId, levelIndex });
}
