import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../logger/logger.js';
import type { QuizmoQuestion, QuizmoQuestionInternal, QuizmoStageSummary } from '../types/quizmo.types.js';

type StageMeta = {
  title: string;
};

type StageCache = {
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
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);


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

function toPublicAssetUrl(quizmoRoot: string, assetPath: string): string {
  const relativeAssetPath = path.relative(quizmoRoot, assetPath);
  const encoded = relativeAssetPath
    .split(path.sep)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/quizmo-assets/${encoded}`;
}

async function resolveImageFromLevelFolders(levelParentDir: string, levelIndex: number): Promise<string | null> {
  let levelEntries;
  try {
    levelEntries = await readdir(levelParentDir, { withFileTypes: true });
  } catch {
    return null;
  }
  const levelFolderPattern = new RegExp(`^Level\\s*${levelIndex}(\\b|\\s|-)`, 'i');
  const levelRootFolders = levelEntries
    .filter((entry) => entry.isDirectory() && levelFolderPattern.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  for (const levelRootFolderName of levelRootFolders) {
    const levelRootFolderPath = path.resolve(levelParentDir, levelRootFolderName);
    let nestedEntries;
    try {
      nestedEntries = await readdir(levelRootFolderPath, { withFileTypes: true });
    } catch {
      continue;
    }

    const preferredNestedPattern = new RegExp(`^Level\\s*${levelIndex}\\b`, 'i');
    const nestedLevelFolders = nestedEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => Number(preferredNestedPattern.test(b)) - Number(preferredNestedPattern.test(a)));

    for (const nestedLevelFolderName of nestedLevelFolders) {
      const nestedLevelFolderPath = path.resolve(levelRootFolderPath, nestedLevelFolderName);
      let nestedLevelFiles;
      try {
        nestedLevelFiles = await readdir(nestedLevelFolderPath, { withFileTypes: true });
      } catch {
        continue;
      }

      const imageFile = nestedLevelFiles.find(
        (entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()),
      );
      if (imageFile) {
        return path.resolve(nestedLevelFolderPath, imageFile.name);
      }
    }
  }

  return null;
}

async function resolveLevelImagePath(
  quizmoRoot: string,
  stageDir: string,
  levelIndex: number,
): Promise<string | null> {
  // Primary: current content layout where level images sit under stage folder (e.g. stage-1-pop-culture/Level X...).
  const fromStageDir = await resolveImageFromLevelFolders(stageDir, levelIndex);
  if (fromStageDir) return fromStageDir;

  // Fallback: legacy layout where images were under Quizmo/stage1/Level X...
  const stage1Dir = path.resolve(quizmoRoot, 'stage1');
  return resolveImageFromLevelFolders(stage1Dir, levelIndex);
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

async function loadStages(): Promise<StageCache[]> {
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
      const localImagePath = await resolveLevelImagePath(quizmoRoot, stageDir, level.levelIndex);
      const resolvedImageUrl = localImagePath
        ? toPublicAssetUrl(quizmoRoot, localImagePath)
        : questionJson.imageUrl;

      questions.push({
        levelIndex: level.levelIndex,
        imageUrl: resolvedImageUrl,
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
      title: stageMeta?.title?.trim() || stageFolderName,
      questions,
    });
  }

  return stages;
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
  answers: Array<{ levelIndex: number; answerIndex: number | null }>,
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
