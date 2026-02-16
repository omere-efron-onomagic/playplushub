import { Router } from 'express';
import {
  completeQuizmoStage,
  getQuizmoStageQuestions,
  listQuizmoStages,
  submitQuizmoAnswer,
} from '../controllers/quizmo.controller.js';
import { requireAuthOrGuest } from '../middleware/auth.middleware.js';
import {
  validateCompleteStageBody,
  validateStageIdParam,
  validateSubmitAnswerBody,
} from '../validators/quizmo.validator.js';

export const quizmoRouter = Router();

quizmoRouter.get('/stages', listQuizmoStages);
quizmoRouter.get('/stages/:stageId/questions', validateStageIdParam, getQuizmoStageQuestions);
quizmoRouter.post('/stages/:stageId/questions/:levelIndex/submit', validateStageIdParam, validateSubmitAnswerBody, submitQuizmoAnswer);
quizmoRouter.post('/stages/:stageId/complete', requireAuthOrGuest, validateStageIdParam, validateCompleteStageBody, completeQuizmoStage);
