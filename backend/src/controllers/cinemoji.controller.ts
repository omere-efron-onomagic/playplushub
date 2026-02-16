import type { Request, Response } from 'express';
import { logger, redactSensitive } from '../logger/logger.js';
import {
  getCinemojiConfig,
  normalizeCinemojiGuess,
  reloadCinemojiConfig,
} from '../services/cinemoji.service.js';
import type {
  ContinueLivesBody,
  HintBody,
  Mode1SubmitBody,
  Mode2SubmitBody,
} from '../types/cinemoji.types.js';

export async function getCinemojiContent(_req: Request, res: Response) {
  try {
    const config = await getCinemojiConfig();
    return res.status(200).json(config);
  } catch (error) {
    logger.error('cinemoji get content failed', { err: error });
    return res.status(500).json({ message: 'failed to load cinemoji data' });
  }
}

export async function refreshCinemojiContent(_req: Request, res: Response) {
  try {
    const config = await reloadCinemojiConfig();
    return res.status(200).json(config);
  } catch (error) {
    logger.error('cinemoji refresh content failed', { err: error });
    return res.status(500).json({ message: 'failed to reload cinemoji data' });
  }
}

export async function submitMode1Guess(req: Request, res: Response) {
  try {
    const { stage, puzzleIndex, guess } = req.body as Mode1SubmitBody;
    const config = await getCinemojiConfig();
    const stageData = config.mode1Stages.find((value) => value.stage === stage);

    if (!stageData) {
      return res.status(404).json({ message: 'stage not found' });
    }

    const puzzle = stageData.puzzles[puzzleIndex - 1];
    if (!puzzle) {
      return res.status(404).json({ message: 'puzzle not found' });
    }

    const normalizedGuess = normalizeCinemojiGuess(guess);
    const normalizedAnswer = normalizeCinemojiGuess(puzzle.title);
    const correct = normalizedGuess === normalizedAnswer;

    if (!correct) {
      logger.warn('cinemoji mode1 wrong guess', {
        requestId: req.requestId,
        payload: redactSensitive(req.body as Record<string, unknown>),
      });
    }

    return res.status(200).json({
      correct,
      title: puzzle.title,
      adPlaceholder: 'BANNER_PLACEHOLDER',
    });
  } catch (error) {
    logger.error('cinemoji submit mode1 failed', { err: error, requestId: req.requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

export async function submitMode2Match(req: Request, res: Response) {
  try {
    const { stage, roundIndex, leftEmoji, rightEmoji } = req.body as Mode2SubmitBody;
    const config = await getCinemojiConfig();
    const stageData = config.mode2Stages.find((value) => value.stage === stage);

    if (!stageData) {
      return res.status(404).json({ message: 'stage not found' });
    }

    const round = stageData.rounds[roundIndex - 1];
    if (!round) {
      return res.status(404).json({ message: 'round not found' });
    }

    const correct = round.leftEmoji === leftEmoji && round.rightEmoji === rightEmoji;
    if (!correct) {
      logger.warn('cinemoji mode2 wrong match', {
        requestId: req.requestId,
        payload: redactSensitive(req.body as Record<string, unknown>),
      });
    }

    return res.status(200).json({
      correct,
      title: round.title,
      adPlaceholder: 'BANNER_PLACEHOLDER',
    });
  } catch (error) {
    logger.error('cinemoji submit mode2 failed', { err: error, requestId: req.requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

export async function getStageHint(req: Request, res: Response) {
  try {
    const { mode, stage, watchRewarded } = req.body as HintBody;
    if (!watchRewarded) {
      return res.status(200).json({
        granted: false,
        message: 'Hint cancelled',
      });
    }

    const config = await getCinemojiConfig();
    const hint =
      mode === 'mode1'
        ? config.mode1Stages.find((value) => value.stage === stage)?.hint
        : config.mode2Stages.find((value) => value.stage === stage)?.hint;

    if (!hint) {
      return res.status(404).json({ message: 'hint not found' });
    }

    return res.status(200).json({
      granted: true,
      rewardedPlaceholder: 'REWARDED_VIDEO_PLACEHOLDER',
      hint,
    });
  } catch (error) {
    logger.error('cinemoji get hint failed', { err: error, requestId: req.requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

export function continueMode2Lives(req: Request, res: Response) {
  try {
    const { watchRewarded } = req.body as ContinueLivesBody;
    if (!watchRewarded) {
      return res.status(200).json({
        granted: false,
        restartRequired: true,
      });
    }

    return res.status(200).json({
      granted: true,
      rewardedPlaceholder: 'REWARDED_VIDEO_PLACEHOLDER',
      extraLives: 1,
      restartRequired: false,
    });
  } catch (error) {
    logger.error('cinemoji continue lives failed', { err: error, requestId: req.requestId });
    return res.status(500).json({ message: 'server error' });
  }
}
