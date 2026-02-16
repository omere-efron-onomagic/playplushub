import { getSupabaseClient } from '../config/supabase.js';
import { logger } from '../logger/logger.js';
import type { QuizmoQuestionInternal, QuizmoStageSummary } from '../types/quizmo.types.js';

const STAGES_TABLE = 'quizmo_stages';
const QUESTIONS_TABLE = 'quizmo_questions';

type StageRow = {
  stage_id: string;
  title: string;
  updated_at: string;
};

type QuestionRow = {
  stage_id: string;
  level_index: number;
  image_url: string;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer_index: number;
};

function toStageSummary(row: StageRow, questionCount: number): QuizmoStageSummary {
  return {
    stageId: row.stage_id,
    title: row.title,
    totalQuestions: questionCount,
  };
}

function toQuestion(row: QuestionRow): QuizmoQuestionInternal {
  return {
    levelIndex: row.level_index,
    imageUrl: row.image_url,
    question: row.question,
    options: [row.option_1, row.option_2, row.option_3, row.option_4] as [string, string, string, string],
    correctAnswerIndex: row.correct_answer_index,
  };
}

function toQuestionRow(stageId: string, q: QuizmoQuestionInternal): QuestionRow {
  return {
    stage_id: stageId,
    level_index: q.levelIndex,
    image_url: q.imageUrl,
    question: q.question,
    option_1: q.options[0],
    option_2: q.options[1],
    option_3: q.options[2],
    option_4: q.options[3],
    correct_answer_index: q.correctAnswerIndex,
  };
}

export async function supabaseGetQuizmoStages(): Promise<QuizmoStageSummary[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data: stages, error: stagesError } = await client
    .from(STAGES_TABLE)
    .select('*')
    .order('stage_id', { ascending: true });

  if (stagesError) {
    logger.error('supabase_get_quizmo_stages failed', { err: stagesError });
    throw stagesError;
  }

  const { data: counts, error: countsError } = await client
    .from(QUESTIONS_TABLE)
    .select('stage_id')
    .order('stage_id', { ascending: true });

  if (countsError) {
    logger.error('supabase_get_quizmo_question_counts failed', { err: countsError });
    throw countsError;
  }

  const countMap = new Map<string, number>();
  for (const row of (counts ?? []) as { stage_id: string }[]) {
    countMap.set(row.stage_id, (countMap.get(row.stage_id) ?? 0) + 1);
  }

  return (stages ?? []).map((row: StageRow) => toStageSummary(row, countMap.get(row.stage_id) ?? 0));
}

export async function supabaseGetQuizmoQuestionsByStage(stageId: string): Promise<QuizmoQuestionInternal[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from(QUESTIONS_TABLE)
    .select('*')
    .eq('stage_id', stageId)
    .order('level_index', { ascending: true });

  if (error) {
    logger.error('supabase_get_quizmo_questions failed', { err: error, stageId });
    throw error;
  }

  return (data ?? []).map((r: QuestionRow) => toQuestion(r));
}

export async function supabaseUpsertQuizmoStage(stageId: string, title: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not available');

  const { error } = await client
    .from(STAGES_TABLE)
    .upsert({ stage_id: stageId, title, updated_at: new Date().toISOString() }, { onConflict: 'stage_id' });

  if (error) {
    logger.error('supabase_upsert_quizmo_stage failed', { err: error, stageId });
    throw error;
  }
}

export async function supabaseUpsertQuizmoQuestions(
  stageId: string,
  questions: QuizmoQuestionInternal[]
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not available');

  const { error: deleteError } = await client.from(QUESTIONS_TABLE).delete().eq('stage_id', stageId);

  if (deleteError) {
    logger.error('supabase_delete_quizmo_questions failed', { err: deleteError, stageId });
    throw deleteError;
  }

  if (questions.length === 0) return;

  const rows = questions.map((q) => toQuestionRow(stageId, q));
  const { error: insertError } = await client.from(QUESTIONS_TABLE).insert(rows);

  if (insertError) {
    logger.error('supabase_insert_quizmo_questions failed', { err: insertError, stageId });
    throw insertError;
  }
}

export async function supabaseDeleteQuizmoStage(stageId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not available');

  const { error } = await client.from(STAGES_TABLE).delete().eq('stage_id', stageId);

  if (error) {
    logger.error('supabase_delete_quizmo_stage failed', { err: error, stageId });
    throw error;
  }
}

export async function supabaseDeleteQuizmoQuestion(stageId: string, levelIndex: number): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not available');

  const { error } = await client
    .from(QUESTIONS_TABLE)
    .delete()
    .eq('stage_id', stageId)
    .eq('level_index', levelIndex);

  if (error) {
    logger.error('supabase_delete_quizmo_question failed', { err: error, stageId, levelIndex });
    throw error;
  }
}
