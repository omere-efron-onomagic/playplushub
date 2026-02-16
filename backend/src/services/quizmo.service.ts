import { logger } from '../logger/logger.js';
import type { QuizmoQuestion, QuizmoStageSummary } from '../types/quizmo.types.js';
import { getContentStoreDriver, isSupabaseConfigured } from '../config/supabase.js';
import { fileGetQuizmoStages, type StageCache } from '../repositories/quizmoFile.repository.js';
import {
  supabaseGetQuizmoStages,
  supabaseGetQuizmoQuestionsByStage,
  supabaseUpsertQuizmoStage,
  supabaseUpsertQuizmoQuestions,
} from '../repositories/quizmoSupabase.repository.js';

function useSupabase(): boolean {
  const driver = getContentStoreDriver();
  return (driver === 'supabase' || driver === 'dual') && isSupabaseConfigured();
}

async function loadStages(): Promise<StageCache[]> {
  const driver = getContentStoreDriver();

  if (useSupabase() && driver === 'supabase') {
    const summaries = await supabaseGetQuizmoStages();
    const stages: StageCache[] = [];
    for (const summary of summaries) {
      const questions = await supabaseGetQuizmoQuestionsByStage(summary.stageId);
      if (questions && questions.length > 0) {
        stages.push({
          stageId: summary.stageId,
          title: summary.title,
          questions,
        });
      }
    }
    return stages;
  }

  if (useSupabase() && driver === 'dual') {
    try {
      const summaries = await supabaseGetQuizmoStages();
      if (summaries.length > 0) {
        const stages: StageCache[] = [];
        for (const summary of summaries) {
          const questions = await supabaseGetQuizmoQuestionsByStage(summary.stageId);
          if (questions && questions.length > 0) {
            stages.push({
              stageId: summary.stageId,
              title: summary.title,
              questions,
            });
          }
        }
        if (stages.length > 0) return stages;
      }
    } catch (err) {
      logger.warn('quizmo supabase read failed, falling back to files', { err });
    }
  }

  return fileGetQuizmoStages();
}

async function ensureCache(): Promise<StageCache[]> {
  return loadStages();
}

export async function getQuizmoStages(): Promise<QuizmoStageSummary[]> {
  const stages = await ensureCache();
  return stages.map((stage) => ({
    stageId: stage.stageId,
    title: stage.title,
    totalQuestions: stage.questions.length,
  }));
}

export async function getQuizmoQuestionsByStage(stageId: string): Promise<QuizmoQuestion[] | null> {
  const stages = await ensureCache();
  const stage = stages.find((entry) => entry.stageId === stageId);
  if (!stage) return null;
  return stage.questions.map(({ correctAnswerIndex: _ignore, ...publicQuestion }) => publicQuestion);
}

export async function validateQuizmoAnswer(
  stageId: string,
  levelIndex: number,
  answerIndex: number,
): Promise<{ correct: boolean; correctAnswerIndex: number } | null> {
  const stages = await ensureCache();
  const stage = stages.find((entry) => entry.stageId === stageId);
  if (!stage) return null;
  const question = stage.questions.find((entry) => entry.levelIndex === levelIndex);
  if (!question) return null;
  return {
    correct: question.correctAnswerIndex === answerIndex,
    correctAnswerIndex: question.correctAnswerIndex,
  };
}

export async function computeQuizmoScore(
  stageId: string,
  answers: { levelIndex: number; answerIndex: number | null }[],
): Promise<{ totalQuestions: number; correctCount: number } | null> {
  const stages = await ensureCache();
  const stage = stages.find((entry) => entry.stageId === stageId);
  if (!stage) return null;

  const answerMap = new Map<number, number | null>();
  for (const answer of answers) {
    answerMap.set(answer.levelIndex, answer.answerIndex);
  }

  let correctCount = 0;
  for (const question of stage.questions) {
    const answerIndex = answerMap.get(question.levelIndex);
    if (answerIndex === question.correctAnswerIndex) {
      correctCount += 1;
    }
  }

  return {
    totalQuestions: stage.questions.length,
    correctCount,
  };
}

export async function reloadQuizmoContent(): Promise<void> {
  await loadStages();
}

/**
 * Syncs QUIZMO filesystem content to Supabase.
 * Called at startup when CONTENT_STORE_DRIVER is 'supabase' or 'dual'.
 */
export async function syncQuizmoJsonToSupabase(): Promise<{
  synced: boolean;
  stagesCount: number;
  questionsCount: number;
}> {
  const driver = getContentStoreDriver();
  if ((driver !== 'supabase' && driver !== 'dual') || !isSupabaseConfigured()) {
    return { synced: false, stagesCount: 0, questionsCount: 0 };
  }

  const fileStages = await fileGetQuizmoStages();
  if (fileStages.length === 0) {
    return { synced: false, stagesCount: 0, questionsCount: 0 };
  }

  let totalQuestions = 0;
  for (const stage of fileStages) {
    await supabaseUpsertQuizmoStage(stage.stageId, stage.title);
    await supabaseUpsertQuizmoQuestions(stage.stageId, stage.questions);
    totalQuestions += stage.questions.length;
  }

  logger.info('quizmo content synced to supabase', {
    stagesCount: fileStages.length,
    questionsCount: totalQuestions,
  });

  return { synced: true, stagesCount: fileStages.length, questionsCount: totalQuestions };
}
