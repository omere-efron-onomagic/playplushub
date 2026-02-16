export type CinemojiMode = 'mode1' | 'mode2';

export type CinemojiPuzzle = {
  index: number;
  category: string;
  leftEmoji: string;
  rightEmoji: string;
  title: string;
};

export type CinemojiMode1Stage = {
  stage: number;
  hint: string;
  puzzles: CinemojiPuzzle[];
};

export type CinemojiMode2Round = {
  roundIndex: number;
  title: string;
  leftEmoji: string;
  rightEmoji: string;
  leftChoices: string[];
  rightChoices: string[];
};

export type CinemojiMode2Stage = {
  stage: number;
  hint: string;
  rounds: CinemojiMode2Round[];
};

export type CinemojiConfig = {
  mode1Stages: CinemojiMode1Stage[];
  mode2Stages: CinemojiMode2Stage[];
};

export type Mode1SubmitBody = {
  stage: number;
  puzzleIndex: number;
  guess: string;
};

export type Mode2SubmitBody = {
  stage: number;
  roundIndex: number;
  leftEmoji: string;
  rightEmoji: string;
};

export type HintBody = {
  mode: CinemojiMode;
  stage: number;
  puzzleIndex?: number;
  roundIndex?: number;
  watchRewarded: boolean;
};

export type ContinueLivesBody = {
  mode: 'mode2';
  stage: number;
  roundIndex: number;
  watchRewarded: boolean;
};

export type StageCompleteBody = {
  mode: CinemojiMode;
  stage: number;
};
