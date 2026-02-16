import type { Request, Response } from 'express';
import {
  upsertCinemojiPuzzle,
  deleteCinemojiPuzzle,
  upsertCinemojiHint,
  deleteCinemojiHint,
  batchUpsertCinemojiPuzzles,
} from '../services/cinemojiAdmin.service.js';
import type { CinemojiPuzzle, CinemojiMode } from '../types/cinemoji.types.js';
import { logger } from '../logger/logger.js';

/** POST /admin/cinemoji/puzzles - upsert single puzzle */
export async function adminUpsertPuzzle(req: Request, res: Response) {
  try {
    const body = req.body as CinemojiPuzzle;
    const puzzle = await upsertCinemojiPuzzle(body);
    return res.status(200).json(puzzle);
  } catch (error) {
    logger.error('adminUpsertPuzzle failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}

/** POST /admin/cinemoji/puzzles/batch - batch upsert puzzles */
export async function adminBatchUpsertPuzzles(req: Request, res: Response) {
  try {
    const { puzzles } = req.body as { puzzles: CinemojiPuzzle[] };
    const result = await batchUpsertCinemojiPuzzles(puzzles);
    return res.status(200).json({ puzzles: result });
  } catch (error) {
    logger.error('adminBatchUpsertPuzzles failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}

/** DELETE /admin/cinemoji/puzzles/:index - delete puzzle */
export async function adminDeletePuzzle(req: Request, res: Response) {
  try {
    const index = parseInt(Array.isArray(req.params.index) ? req.params.index[0]! : req.params.index!, 10);
    if (!Number.isInteger(index) || index < 1) {
      return res.status(400).json({ message: 'index must be a positive integer' });
    }
    await deleteCinemojiPuzzle(index);
    return res.status(204).send();
  } catch (error) {
    logger.error('adminDeletePuzzle failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}

/** POST /admin/cinemoji/hints - upsert hint */
export async function adminUpsertHint(req: Request, res: Response) {
  try {
    const { mode, stage, hintText } = req.body as {
      mode: CinemojiMode;
      stage: number;
      hintText: string;
    };
    await upsertCinemojiHint(mode, stage, hintText);
    return res.status(200).json({ mode, stage, hintText });
  } catch (error) {
    logger.error('adminUpsertHint failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}

/** DELETE /admin/cinemoji/hints - delete hint */
export async function adminDeleteHint(req: Request, res: Response) {
  try {
    const { mode, stage } = req.query as { mode?: string; stage?: string };
    
    if (mode !== 'mode1' && mode !== 'mode2') {
      return res.status(400).json({ message: 'mode must be "mode1" or "mode2"' });
    }
    
    const stageNum = parseInt(stage ?? '', 10);
    if (!Number.isInteger(stageNum) || stageNum < 1) {
      return res.status(400).json({ message: 'stage must be a positive integer' });
    }
    
    await deleteCinemojiHint(mode as CinemojiMode, stageNum);
    return res.status(204).send();
  } catch (error) {
    logger.error('adminDeleteHint failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}
