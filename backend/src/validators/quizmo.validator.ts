import type { NextFunction, Request, Response } from 'express';
import { logger, redactSensitive } from '../logger/logger.js';

function reject(req: Request, res: Response, message: string): Response {
  logger.warn('quizmo validation failed', {
    requestId: req.requestId,
    message,
    payload: redactSensitive((req.body as Record<string, unknown>) ?? {}),
    params: redactSensitive(req.params as Record<string, unknown>),
  });
  return res.status(400).json({ message });
}

export function validateStageIdParam(req: Request, res: Response, next: NextFunction) {
  const stageId = req.params.stageId;
  if (!stageId || typeof stageId !== 'string' || !stageId.trim()) {
    return reject(req, res, 'stageId is required');
  }
  return next();
}

export function validateSubmitAnswerBody(req: Request, res: Response, next: NextFunction) {
  const levelIndex = Number(req.params.levelIndex);
  if (!Number.isInteger(levelIndex) || levelIndex < 1) {
    return reject(req, res, 'levelIndex must be a positive integer');
  }

  if (!req.body || typeof req.body !== 'object') {
    return reject(req, res, 'body is required');
  }
  const { answerIndex } = req.body as { answerIndex?: unknown };
  if (!Number.isInteger(answerIndex) || (answerIndex as number) < 0 || (answerIndex as number) > 3) {
    return reject(req, res, 'answerIndex must be an integer between 0 and 3');
  }
  return next();
}

export function validateCompleteStageBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return reject(req, res, 'body is required');
  }

  const { sessionToken, stageId, answers } = req.body as {
    sessionToken?: unknown;
    stageId?: unknown;
    answers?: unknown;
  };

  if (typeof sessionToken !== 'string' || !sessionToken.trim()) {
    return reject(req, res, 'sessionToken is required');
  }
  if (typeof stageId !== 'string' || !stageId.trim()) {
    return reject(req, res, 'stageId is required');
  }
  if (!Array.isArray(answers)) {
    return reject(req, res, 'answers must be an array');
  }
  for (const answer of answers) {
    if (!answer || typeof answer !== 'object') {
      return reject(req, res, 'each answer must be an object');
    }
    const item = answer as Record<string, unknown>;
    if (!Number.isInteger(item.levelIndex) || (item.levelIndex as number) < 1) {
      return reject(req, res, 'answer.levelIndex must be a positive integer');
    }
    if (
      item.answerIndex !== null &&
      (!Number.isInteger(item.answerIndex) ||
        (item.answerIndex as number) < 0 ||
        (item.answerIndex as number) > 3)
    ) {
      return reject(req, res, 'answer.answerIndex must be null or integer between 0 and 3');
    }
  }

  return next();
}

// Admin validators

export function validateUpsertStageBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return reject(req, res, 'body is required');
  }

  const { stageId, title } = req.body as { stageId?: unknown; title?: unknown };

  if (typeof stageId !== 'string' || !stageId.trim()) {
    return reject(req, res, 'stageId is required');
  }
  if (typeof title !== 'string' || !title.trim()) {
    return reject(req, res, 'title is required');
  }

  return next();
}

export function validateUpsertQuestionsBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return reject(req, res, 'body is required');
  }

  const { questions } = req.body as { questions?: unknown };

  if (!Array.isArray(questions)) {
    return reject(req, res, 'questions must be an array');
  }

  for (const question of questions) {
    if (!question || typeof question !== 'object') {
      return reject(req, res, 'each question must be an object');
    }
    const q = question as Record<string, unknown>;

    if (!Number.isInteger(q.levelIndex) || (q.levelIndex as number) < 1) {
      return reject(req, res, 'question.levelIndex must be a positive integer');
    }
    if (typeof q.imageUrl !== 'string' || !q.imageUrl.trim()) {
      return reject(req, res, 'question.imageUrl is required');
    }
    if (typeof q.question !== 'string' || !q.question.trim()) {
      return reject(req, res, 'question.question is required');
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      return reject(req, res, 'question.options must be an array of 4 strings');
    }
    if (!q.options.every((opt) => typeof opt === 'string' && String(opt).trim())) {
      return reject(req, res, 'each option must be a non-empty string');
    }
    if (
      !Number.isInteger(q.correctAnswerIndex) ||
      (q.correctAnswerIndex as number) < 0 ||
      (q.correctAnswerIndex as number) > 3
    ) {
      return reject(req, res, 'question.correctAnswerIndex must be an integer between 0 and 3');
    }
  }

  return next();
}
