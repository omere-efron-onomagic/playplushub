import type { Request, Response } from 'express';
import {
  appendTransaction,
  tryClaim,
  verifyGameSessionToken,
} from '../services/economy/index.js';
import { addCoinsToGuest, findGuestById } from '../services/guestStore.service.js';
import { logger } from '../logger/logger.js';
import { addCoinsToUser, findUserById } from '../services/userStore.service.js';
import {
  computeQuizmoScore,
  getQuizmoQuestionsByStage,
  getQuizmoStages,
  validateQuizmoAnswer,
} from '../services/quizmo.service.js';
import type { QuizmoCompleteBody } from '../types/quizmo.types.js';

const QUIZMO_GAME_ID = '14';
const COINS_PER_CORRECT_ANSWER = 2;

export async function listQuizmoStages(_req: Request, res: Response) {
  try {
    const stages = await getQuizmoStages();
    return res.status(200).json({ stages });
  } catch (error) {
    logger.error('quizmo list stages failed', { err: error });
    return res.status(500).json({ message: 'failed to load quizmo stages' });
  }
}

export async function getQuizmoStageQuestions(req: Request, res: Response) {
  try {
    const stageId = Array.isArray(req.params.stageId) ? req.params.stageId[0] : req.params.stageId;
    const questions = await getQuizmoQuestionsByStage(stageId);
    if (!questions) {
      return res.status(404).json({ message: 'stage not found' });
    }
    return res.status(200).json({ stageId, questions, timerSeconds: 10 });
  } catch (error) {
    logger.error('quizmo get stage questions failed', { err: error, requestId: req.requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

export async function submitQuizmoAnswer(req: Request, res: Response) {
  try {
    const stageId = Array.isArray(req.params.stageId) ? req.params.stageId[0] : req.params.stageId;
    const levelIndexRaw = Array.isArray(req.params.levelIndex)
      ? req.params.levelIndex[0]
      : req.params.levelIndex;
    const levelIndex = Number(levelIndexRaw);
    const { answerIndex } = req.body as { answerIndex: number };
    const result = await validateQuizmoAnswer(stageId, levelIndex, answerIndex);
    if (!result) {
      return res.status(404).json({ message: 'stage or level not found' });
    }
    return res.status(200).json({
      correct: result.correct,
      correctAnswerIndex: result.correctAnswerIndex,
    });
  } catch (error) {
    logger.error('quizmo submit answer failed', { err: error, requestId: req.requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

export async function completeQuizmoStage(req: Request, res: Response) {
  try {
    const authUserId = req.authUserId;
    const guestId = req.guestId;
    const actorId = authUserId ?? guestId;
    const isGuest = Boolean(guestId);
    if (!actorId) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const { sessionToken, stageId, answers } = req.body as QuizmoCompleteBody;
    if (stageId !== req.params.stageId) {
      return res.status(400).json({ message: 'stageId in body must match route stageId' });
    }
    const payload = verifyGameSessionToken(sessionToken);
    if (!payload) {
      return res.status(401).json({ message: 'invalid or expired session token' });
    }
    if (payload.gameId !== QUIZMO_GAME_ID) {
      return res.status(400).json({ message: 'session token does not belong to quizmo' });
    }
    if (payload.isGuest) {
      if (!guestId) {
        return res.status(403).json({ message: 'guest session requires guest token' });
      }
      if (payload.userId !== guestId) {
        logger.warn('quizmo complete: guest session actor mismatch, accepting current guest actor', {
          requestId: req.requestId,
          sessionGuestId: payload.userId,
          currentGuestId: guestId,
          sessionId: payload.sessionId,
        });
      }
    } else if (payload.userId !== actorId) {
      return res.status(403).json({ message: 'session does not belong to this actor' });
    }

    const claimed = await tryClaim(payload.sessionId);
    if (!claimed) {
      return res.status(409).json({ message: 'reward already claimed for this session', code: 'DUPLICATE_CLAIM' });
    }

    const score = await computeQuizmoScore(stageId, answers);
    if (!score) {
      return res.status(404).json({ message: 'stage not found' });
    }

    const earnedCoins = score.correctCount * COINS_PER_CORRECT_ANSWER;
    logger.info('quizmo stage completion computed', {
      requestId: req.requestId,
      actorId,
      isGuest,
      stageId,
      correctCount: score.correctCount,
      totalQuestions: score.totalQuestions,
      earnedCoins,
    });

    if (isGuest) {
      const gid = guestId!;
      const guest = await findGuestById(gid);
      if (!guest || guest.migratedTo) {
        return res.status(404).json({ message: 'guest not found' });
      }
      const before = guest.coins;
      const updated = earnedCoins > 0 ? await addCoinsToGuest(gid, earnedCoins) : guest;
      if (!updated) {
        return res.status(404).json({ message: 'guest not found' });
      }
      if (earnedCoins > 0) {
        await appendTransaction({
          userId: gid,
          kind: 'reward',
          amount: earnedCoins,
          balanceBefore: before,
          balanceAfter: updated.coins,
          reason: 'quizmo_stage_complete',
          gameId: QUIZMO_GAME_ID,
          sessionId: payload.sessionId,
          guestId: gid,
        });
      }
      return res.status(200).json({
        stageId,
        correctCount: score.correctCount,
        totalQuestions: score.totalQuestions,
        coinsEarned: earnedCoins,
        coins: updated.coins,
        formula: `${COINS_PER_CORRECT_ANSWER} coins per correct answer`,
        signupPromptCount: updated.signupPromptCount,
        signupRequired: updated.signupRequired,
      });
    }

    const uid = authUserId!;
    const user = await findUserById(uid);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    const before = user.coins;
    const updated = earnedCoins > 0 ? await addCoinsToUser(uid, earnedCoins) : user;
    if (!updated) {
      return res.status(404).json({ message: 'user not found' });
    }
    if (earnedCoins > 0) {
      await appendTransaction({
        userId: uid,
        kind: 'reward',
        amount: earnedCoins,
        balanceBefore: before,
        balanceAfter: updated.coins,
        reason: 'quizmo_stage_complete',
        gameId: QUIZMO_GAME_ID,
        sessionId: payload.sessionId,
      });
    }

    return res.status(200).json({
      stageId,
      correctCount: score.correctCount,
      totalQuestions: score.totalQuestions,
      coinsEarned: earnedCoins,
      coins: updated.coins,
      formula: `${COINS_PER_CORRECT_ANSWER} coins per correct answer`,
    });
  } catch (error) {
    logger.error('quizmo complete stage failed', {
      err: error,
      requestId: req.requestId,
      userId: req.authUserId,
      guestId: req.guestId,
    });
    return res.status(500).json({ message: 'server error' });
  }
}
