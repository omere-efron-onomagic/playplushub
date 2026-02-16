import type { Request, Response, NextFunction } from 'express';

// Player-facing validators

export function validateMode1SubmitBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  
  const b = req.body as Record<string, unknown>;
  
  if (!Number.isInteger(b.stage) || (b.stage as number) < 1) {
    return res.status(400).json({ message: 'stage must be a positive integer' });
  }
  
  if (!Number.isInteger(b.puzzleIndex) || (b.puzzleIndex as number) < 1) {
    return res.status(400).json({ message: 'puzzleIndex must be a positive integer' });
  }
  
  if (typeof b.guess !== 'string' || !b.guess.trim()) {
    return res.status(400).json({ message: 'guess is required' });
  }
  
  return next();
}

export function validateMode2SubmitBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  
  const b = req.body as Record<string, unknown>;
  
  if (!Number.isInteger(b.stage) || (b.stage as number) < 1) {
    return res.status(400).json({ message: 'stage must be a positive integer' });
  }
  
  if (!Number.isInteger(b.roundIndex) || (b.roundIndex as number) < 0) {
    return res.status(400).json({ message: 'roundIndex must be a non-negative integer' });
  }
  
  if (typeof b.leftEmoji !== 'string' || !b.leftEmoji.trim()) {
    return res.status(400).json({ message: 'leftEmoji is required' });
  }
  
  if (typeof b.rightEmoji !== 'string' || !b.rightEmoji.trim()) {
    return res.status(400).json({ message: 'rightEmoji is required' });
  }
  
  return next();
}

export function validateHintBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  
  const b = req.body as Record<string, unknown>;
  
  if (b.mode !== 'mode1' && b.mode !== 'mode2') {
    return res.status(400).json({ message: 'mode must be "mode1" or "mode2"' });
  }
  
  if (!Number.isInteger(b.stage) || (b.stage as number) < 1) {
    return res.status(400).json({ message: 'stage must be a positive integer' });
  }
  
  if (typeof b.watchRewarded !== 'boolean') {
    return res.status(400).json({ message: 'watchRewarded must be a boolean' });
  }
  
  // puzzleIndex and roundIndex are optional
  if (b.puzzleIndex !== undefined && (!Number.isInteger(b.puzzleIndex) || (b.puzzleIndex as number) < 1)) {
    return res.status(400).json({ message: 'puzzleIndex must be a positive integer if provided' });
  }
  
  if (b.roundIndex !== undefined && (!Number.isInteger(b.roundIndex) || (b.roundIndex as number) < 0)) {
    return res.status(400).json({ message: 'roundIndex must be a non-negative integer if provided' });
  }
  
  return next();
}

export function validateContinueLivesBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  
  const b = req.body as Record<string, unknown>;
  
  if (b.mode !== 'mode2') {
    return res.status(400).json({ message: 'mode must be "mode2"' });
  }
  
  if (!Number.isInteger(b.stage) || (b.stage as number) < 1) {
    return res.status(400).json({ message: 'stage must be a positive integer' });
  }
  
  if (!Number.isInteger(b.roundIndex) || (b.roundIndex as number) < 0) {
    return res.status(400).json({ message: 'roundIndex must be a non-negative integer' });
  }
  
  if (typeof b.watchRewarded !== 'boolean') {
    return res.status(400).json({ message: 'watchRewarded must be a boolean' });
  }
  
  return next();
}

export function validateStageCompleteBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  
  const b = req.body as Record<string, unknown>;
  
  if (b.mode !== 'mode1' && b.mode !== 'mode2') {
    return res.status(400).json({ message: 'mode must be "mode1" or "mode2"' });
  }
  
  if (!Number.isInteger(b.stage) || (b.stage as number) < 1) {
    return res.status(400).json({ message: 'stage must be a positive integer' });
  }
  
  return next();
}

// Admin validators

export function validateUpsertPuzzleBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  
  const b = req.body as Record<string, unknown>;
  
  if (!Number.isInteger(b.index) || (b.index as number) < 1) {
    return res.status(400).json({ message: 'index must be a positive integer' });
  }
  
  if (typeof b.category !== 'string' || !b.category.trim()) {
    return res.status(400).json({ message: 'category is required' });
  }
  
  if (typeof b.leftEmoji !== 'string' || !b.leftEmoji.trim()) {
    return res.status(400).json({ message: 'leftEmoji is required' });
  }
  
  if (typeof b.rightEmoji !== 'string' || !b.rightEmoji.trim()) {
    return res.status(400).json({ message: 'rightEmoji is required' });
  }
  
  if (typeof b.title !== 'string' || !b.title.trim()) {
    return res.status(400).json({ message: 'title is required' });
  }
  
  return next();
}

export function validateBatchUpsertPuzzlesBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  
  const b = req.body as { puzzles?: unknown };
  
  if (!Array.isArray(b.puzzles)) {
    return res.status(400).json({ message: 'puzzles must be an array' });
  }
  
  for (let i = 0; i < b.puzzles.length; i++) {
    const p = b.puzzles[i] as Record<string, unknown>;
    
    if (!Number.isInteger(p.index) || (p.index as number) < 1) {
      return res.status(400).json({ message: `puzzles[${i}].index must be a positive integer` });
    }
    
    if (typeof p.category !== 'string' || !p.category.trim()) {
      return res.status(400).json({ message: `puzzles[${i}].category is required` });
    }
    
    if (typeof p.leftEmoji !== 'string' || !p.leftEmoji.trim()) {
      return res.status(400).json({ message: `puzzles[${i}].leftEmoji is required` });
    }
    
    if (typeof p.rightEmoji !== 'string' || !p.rightEmoji.trim()) {
      return res.status(400).json({ message: `puzzles[${i}].rightEmoji is required` });
    }
    
    if (typeof p.title !== 'string' || !p.title.trim()) {
      return res.status(400).json({ message: `puzzles[${i}].title is required` });
    }
  }
  
  return next();
}

export function validateUpsertHintBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  
  const b = req.body as Record<string, unknown>;
  
  if (b.mode !== 'mode1' && b.mode !== 'mode2') {
    return res.status(400).json({ message: 'mode must be "mode1" or "mode2"' });
  }
  
  if (!Number.isInteger(b.stage) || (b.stage as number) < 1) {
    return res.status(400).json({ message: 'stage must be a positive integer' });
  }
  
  if (typeof b.hintText !== 'string' || !b.hintText.trim()) {
    return res.status(400).json({ message: 'hintText is required' });
  }
  
  return next();
}
