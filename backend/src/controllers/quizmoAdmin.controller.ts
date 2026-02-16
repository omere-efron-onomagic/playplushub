import type { Request, Response } from 'express';
import {
  listAllQuizmoStages,
  getQuizmoStageWithQuestions,
  upsertQuizmoStage,
  upsertQuizmoStageQuestions,
  deleteQuizmoStage,
  deleteQuizmoQuestion,
} from '../services/quizmoAdmin.service.js';
import type { QuizmoQuestionInternal } from '../types/quizmo.types.js';
import { logger } from '../logger/logger.js';

/** GET /admin/quizmo/stages - list all stages with questions */
export async function adminListQuizmoStages(req: Request, res: Response) {
  try {
    const stages = await listAllQuizmoStages();
    return res.status(200).json({ stages });
  } catch (error) {
    logger.error('adminListQuizmoStages failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}

/** GET /admin/quizmo/stages/:stageId - get single stage with questions */
export async function adminGetQuizmoStage(req: Request, res: Response) {
  try {
    const stageId = Array.isArray(req.params.stageId) ? req.params.stageId[0] : req.params.stageId;
    if (!stageId) {
      return res.status(400).json({ message: 'stageId is required' });
    }
    const stage = await getQuizmoStageWithQuestions(stageId);
    if (!stage) {
      return res.status(404).json({ message: 'stage not found' });
    }
    return res.status(200).json(stage);
  } catch (error) {
    logger.error('adminGetQuizmoStage failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}

/** POST /admin/quizmo/stages - create or update stage */
export async function adminUpsertQuizmoStage(req: Request, res: Response) {
  try {
    const { stageId, title } = req.body as { stageId: string; title: string };
    await upsertQuizmoStage(stageId, title);
    return res.status(200).json({ stageId, title });
  } catch (error) {
    logger.error('adminUpsertQuizmoStage failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}

/** POST /admin/quizmo/stages/:stageId/questions - upsert questions for a stage */
export async function adminUpsertQuizmoQuestions(req: Request, res: Response) {
  try {
    const stageId = Array.isArray(req.params.stageId) ? req.params.stageId[0] : req.params.stageId;
    if (!stageId) {
      return res.status(400).json({ message: 'stageId is required' });
    }
    const { questions } = req.body as { questions: QuizmoQuestionInternal[] };
    await upsertQuizmoStageQuestions(stageId, questions);
    return res.status(200).json({ stageId, count: questions.length });
  } catch (error) {
    logger.error('adminUpsertQuizmoQuestions failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}

/** DELETE /admin/quizmo/stages/:stageId - delete stage and all questions */
export async function adminDeleteQuizmoStage(req: Request, res: Response) {
  try {
    const stageId = Array.isArray(req.params.stageId) ? req.params.stageId[0] : req.params.stageId;
    if (!stageId) {
      return res.status(400).json({ message: 'stageId is required' });
    }
    await deleteQuizmoStage(stageId);
    return res.status(204).send();
  } catch (error) {
    logger.error('adminDeleteQuizmoStage failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}

/** DELETE /admin/quizmo/stages/:stageId/questions/:levelIndex - delete single question */
export async function adminDeleteQuizmoQuestion(req: Request, res: Response) {
  try {
    const stageId = Array.isArray(req.params.stageId) ? req.params.stageId[0] : req.params.stageId;
    const levelIndexRaw = Array.isArray(req.params.levelIndex) ? req.params.levelIndex[0] : req.params.levelIndex;

    if (!stageId || !levelIndexRaw) {
      return res.status(400).json({ message: 'stageId and levelIndex are required' });
    }

    const levelIndex = parseInt(levelIndexRaw, 10);

    if (!Number.isInteger(levelIndex) || levelIndex < 1) {
      return res.status(400).json({ message: 'levelIndex must be a positive integer' });
    }

    await deleteQuizmoQuestion(stageId, levelIndex);
    return res.status(204).send();
  } catch (error) {
    logger.error('adminDeleteQuizmoQuestion failed', {
      err: error,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}
