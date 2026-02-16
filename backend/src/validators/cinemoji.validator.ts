import type { NextFunction, Request, Response } from 'express';
import { logger, redactSensitive } from '../logger/logger.js';

function reject(
  req: Request,
  res: Response,
  message: string,
  extra?: Record<string, unknown>,
): Response {
  logger.warn('cinemoji validation failed', {
    requestId: req.requestId,
    message,
    payload: redactSensitive((req.body as Record<string, unknown>) ?? {}),
    ...extra,
  });
  return res.status(400).json({ message });
}

export function validateMode1SubmitBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return reject(req, res, 'body is required');
  }

  const { stage, puzzleIndex, guess } = req.body as {
    stage?: unknown;
    puzzleIndex?: unknown;
    guess?: unknown;
  };

  if (!Number.isInteger(stage) || (stage as number) < 1 || (stage as number) > 4) {
    return reject(req, res, 'stage must be an integer between 1 and 4');
  }
  if (!Number.isInteger(puzzleIndex) || (puzzleIndex as number) < 1 || (puzzleIndex as number) > 10) {
    return reject(req, res, 'puzzleIndex must be an integer between 1 and 10');
  }
  if (typeof guess !== 'string' || !guess.trim()) {
    return reject(req, res, 'guess is required');
  }

  return next();
}

export function validateMode2SubmitBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return reject(req, res, 'body is required');
  }

  const { stage, roundIndex, leftEmoji, rightEmoji } = req.body as {
    stage?: unknown;
    roundIndex?: unknown;
    leftEmoji?: unknown;
    rightEmoji?: unknown;
  };

  if (!Number.isInteger(stage) || (stage as number) < 1 || (stage as number) > 8) {
    return reject(req, res, 'stage must be an integer between 1 and 8');
  }
  if (!Number.isInteger(roundIndex) || (roundIndex as number) < 1 || (roundIndex as number) > 5) {
    return reject(req, res, 'roundIndex must be an integer between 1 and 5');
  }
  if (typeof leftEmoji !== 'string' || !leftEmoji.trim()) {
    return reject(req, res, 'leftEmoji is required');
  }
  if (typeof rightEmoji !== 'string' || !rightEmoji.trim()) {
    return reject(req, res, 'rightEmoji is required');
  }

  return next();
}

export function validateHintBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return reject(req, res, 'body is required');
  }

  const { mode, stage, watchRewarded } = req.body as {
    mode?: unknown;
    stage?: unknown;
    watchRewarded?: unknown;
  };

  if (mode !== 'mode1' && mode !== 'mode2') {
    return reject(req, res, 'mode must be mode1 or mode2');
  }

  const maxStage = mode === 'mode1' ? 4 : 8;
  if (!Number.isInteger(stage) || (stage as number) < 1 || (stage as number) > maxStage) {
    return reject(req, res, `stage must be an integer between 1 and ${maxStage}`);
  }

  if (typeof watchRewarded !== 'boolean') {
    return reject(req, res, 'watchRewarded must be boolean');
  }

  return next();
}

export function validateContinueLivesBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return reject(req, res, 'body is required');
  }

  const { mode, stage, roundIndex, watchRewarded } = req.body as {
    mode?: unknown;
    stage?: unknown;
    roundIndex?: unknown;
    watchRewarded?: unknown;
  };
  if (mode !== 'mode2') {
    return reject(req, res, 'mode must be mode2');
  }
  if (!Number.isInteger(stage) || (stage as number) < 1 || (stage as number) > 8) {
    return reject(req, res, 'stage must be an integer between 1 and 8');
  }
  if (!Number.isInteger(roundIndex) || (roundIndex as number) < 1 || (roundIndex as number) > 5) {
    return reject(req, res, 'roundIndex must be an integer between 1 and 5');
  }
  if (typeof watchRewarded !== 'boolean') {
    return reject(req, res, 'watchRewarded must be boolean');
  }
  return next();
}

export function validateStageCompleteBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return reject(req, res, 'body is required');
  }

  const { mode, stage } = req.body as { mode?: unknown; stage?: unknown };
  if (mode !== 'mode1' && mode !== 'mode2') {
    return reject(req, res, 'mode must be mode1 or mode2');
  }
  const maxStage = mode === 'mode1' ? 4 : 8;
  if (!Number.isInteger(stage) || (stage as number) < 1 || (stage as number) > maxStage) {
    return reject(req, res, `stage must be an integer between 1 and ${maxStage}`);
  }

  return next();
}
