import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../logger/logger.js';
import type { QuizmoQuestionInternal } from '../types/quizmo.types.js';

type StageMeta = {
  title: string;
};

export type StageCache = {
  stageId: string;
  title: string;
  questions: QuizmoQuestionInternal[];
};

const QUIZMO_ROOT_CANDIDATES = ['QUIZMO', 'Quizmo'].map((folderName) =>
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), `../../../${folderName}`),
);
const STAGE_PREFIX = 'stage-';
const LEVEL_PREFIX = 'level-';
const QUESTION_FILE = 'question.json';
const STAGE_META_FILE = 'stage.json';

function parseLevelIndex(levelFolderName: string): number | null {
  if (!levelFolderName.startsWith(LEVEL_PREFIX)) {
    return null;
  }
  const raw = levelFolderName.slice(LEVEL_PREFIX.length);
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function parseStageId(stageFolderName: string): string | null {
  if (!stageFolderName.startsWith(STAGE_PREFIX)) {
    return null;
  }
  return stageFolderName;
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn('quizmo failed to parse json file', { filePath, err: error });
    return null;
  }
}

function isValidQuestion(payload: unknown): payload is {
  imageUrl: string;
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
} {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  if (typeof p.imageUrl !== 'string' || !p.imageUrl.trim()) return false;
  if (typeof p.question !== 'string' || !p.question.trim()) return false;
  if (!Array.isArray(p.options) || p.options.length !== 4) return false;
  if (!p.options.every((opt) => typeof opt === 'string' && opt.trim())) return false;
  if (!Number.isInteger(p.correctAnswerIndex)) return false;
  const idx = p.correctAnswerIndex as number;
  return idx >= 0 && idx < 4;
}

export async function fileGetQuizmoStages(): Promise<StageCache[]> {
  let quizmoRoot = QUIZMO_ROOT_CANDIDATES[0];
  for (const candidate of QUIZMO_ROOT_CANDIDATES) {
    try {
      await access(candidate);
      quizmoRoot = candidate;
      break;
    } catch {
      // continue checking
    }
  }

  let stageEntries;
  try {
    stageEntries = await readdir(quizmoRoot, { withFileTypes: true });
  } catch (error) {
    logger.error('quizmo root folder is missing or unreadable', {
      rootsTried: QUIZMO_ROOT_CANDIDATES,
      err: error,
    });
    return [];
  }
  const stageFolders = stageEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => parseStageId(name) !== null)
    .sort();

  const stages: StageCache[] = [];

  for (const stageFolderName of stageFolders) {
    const stageId = parseStageId(stageFolderName);
    if (!stageId) continue;
    const stageDir = path.resolve(quizmoRoot, stageFolderName);
    const metaPath = path.resolve(stageDir, STAGE_META_FILE);
    const stageMeta = await readJsonFile<StageMeta>(metaPath);

    const levelEntries = await readdir(stageDir, { withFileTypes: true });
    const levelFolders = levelEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .map((name) => ({ name, levelIndex: parseLevelIndex(name) }))
      .filter((item): item is { name: string; levelIndex: number } => item.levelIndex !== null)
      .sort((a, b) => a.levelIndex - b.levelIndex);

    const questions: QuizmoQuestionInternal[] = [];
    for (const level of levelFolders) {
      const questionPath = path.resolve(stageDir, level.name, QUESTION_FILE);
      const questionJson = await readJsonFile<unknown>(questionPath);
      if (!isValidQuestion(questionJson)) {
        logger.warn('quizmo invalid question payload, skipping level', {
          stageId,
          levelIndex: level.levelIndex,
          questionPath,
        });
        continue;
      }

      questions.push({
        levelIndex: level.levelIndex,
        imageUrl: questionJson.imageUrl,
        question: questionJson.question,
        options: questionJson.options,
        correctAnswerIndex: questionJson.correctAnswerIndex,
      });
    }

    if (questions.length === 0) {
      logger.warn('quizmo stage has no valid questions, skipping stage', { stageId });
      continue;
    }

    stages.push({
      stageId,
      title: stageMeta?.title?.trim() ?? stageFolderName,
      questions,
    });
  }

  return stages;
}

export async function fileGetQuizmoQuestionsByStage(stageId: string): Promise<QuizmoQuestionInternal[] | null> {
  const stages = await fileGetQuizmoStages();
  const stage = stages.find((entry) => entry.stageId === stageId);
  return stage ? stage.questions : null;
}
