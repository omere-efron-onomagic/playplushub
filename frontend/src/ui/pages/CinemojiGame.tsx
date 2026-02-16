import {
  useCompleteCinemojiStageMutation,
  useContinueMode2LivesMutation,
  useGetCinemojiContentQuery,
  useGetCinemojiProgressQuery,
  useRequestHintMutation,
  useSubmitMode1GuessMutation,
  useSubmitMode2MatchMutation,
  type CinemojiMode2Round,
} from '@/store/apis/cinemoji.api';
import { useClaimGameSessionRewardMutation } from '@/store/apis/wallet.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCoins, setGuestProgression } from '@/store/slices/user.slice';
import { GuestSignupPrompt } from '@/ui/components/GuestSignupPrompt';
import { SignupRequiredGate } from '@/ui/components/SignupRequiredGate';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

type PlayLocationState = { sessionToken?: string } | null;
type CinemojiMode = 'mode1' | 'mode2';
type StageProgress = { mode1CompletedStages: number[]; mode2CompletedStages: number[] };
type ModalState = null | 'hintConfirm' | 'hintVideo' | 'livesConfirm' | 'livesVideo';

type DragState = {
  leftEmoji: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

function normalizeForCompare(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[’'`]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .trim();
}

function buildAnswerSlots(target: string, input: string): string[] {
  const normalizedTarget = normalizeForCompare(target).toUpperCase();
  const normalizedInput = normalizeForCompare(input).toUpperCase();
  return normalizedTarget.split('').map((_, index) => normalizedInput[index] ?? '');
}

function buildLetterBank(target: string): string[] {
  const source = normalizeForCompare(target).toUpperCase();
  const letters = source.split('');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const result = [...letters];
  let cursor = 0;
  while (result.length < Math.max(14, letters.length + 5)) {
    result.push(alphabet[cursor % alphabet.length] ?? 'A');
    cursor += 1;
  }
  return result.sort(() => Math.random() - 0.5);
}

export function CinemojiGame() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams<{ gameId: string }>();
  const user = useAppSelector((state) => state.user);
  const canFetchProgress = !user.isGuest || Boolean(user.guestToken);

  const [claimReward] = useClaimGameSessionRewardMutation();
  const [submitMode1Guess, { isLoading: isSubmittingMode1 }] = useSubmitMode1GuessMutation();
  const [submitMode2Match] = useSubmitMode2MatchMutation();
  const [requestHint, { isLoading: isRequestingHint }] = useRequestHintMutation();
  const [continueMode2Lives, { isLoading: isContinuingLives }] = useContinueMode2LivesMutation();
  const [completeStage] = useCompleteCinemojiStageMutation();

  const { data: content, isLoading: isContentLoading, error: contentError } = useGetCinemojiContentQuery();
  const { data: progressData } = useGetCinemojiProgressQuery(undefined, { skip: !canFetchProgress });

  const sessionToken = (location.state as PlayLocationState)?.sessionToken;

  const [selectedMode, setSelectedMode] = useState<CinemojiMode | null>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [mode1PuzzleIndex, setMode1PuzzleIndex] = useState(0);
  const [mode2RoundIndex, setMode2RoundIndex] = useState(0);
  const [mode2Lives, setMode2Lives] = useState(3);
  const [mode1Input, setMode1Input] = useState('');
  const [mode1LetterBank, setMode1LetterBank] = useState<string[]>([]);
  const [hintText, setHintText] = useState('');
  const [rewardedLabel, setRewardedLabel] = useState('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [correctOverlay, setCorrectOverlay] = useState<{ title?: string } | null>(null);
  const [wrongFeedback, setWrongFeedback] = useState(false);
  const [stageFinished, setStageFinished] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const [guestSignupRequired, setGuestSignupRequired] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<StageProgress>({
    mode1CompletedStages: [],
    mode2CompletedStages: [],
  });
  const [dragState, setDragState] = useState<DragState | null>(null);

  const [selectedLeftEmoji, setSelectedLeftEmoji] = useState('');
  const [actionError, setActionError] = useState('');

  const mode1InputRef = useRef<HTMLInputElement | null>(null);
  const mode2BoardRef = useRef<HTMLDivElement | null>(null);
  const mode2LeftButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const mode1Stages = content?.mode1Stages ?? [];
  const mode2Stages = content?.mode2Stages ?? [];
  const currentMode1Stage = selectedMode === 'mode1' ? mode1Stages.find((s) => s.stage === selectedStage) : undefined;
  const currentMode2Stage = selectedMode === 'mode2' ? mode2Stages.find((s) => s.stage === selectedStage) : undefined;
  const currentMode1Puzzle = currentMode1Stage?.puzzles[mode1PuzzleIndex];
  const currentMode2Round = currentMode2Stage?.rounds[mode2RoundIndex];

  useEffect(() => {
    if (!sessionToken) {
      navigate(`/game/${gameId ?? '13'}`, { replace: true });
    }
  }, [sessionToken, navigate, gameId]);

  useEffect(() => {
    if (progressData) {
      setProgress(progressData);
    }
  }, [progressData]);

  useEffect(() => {
    if (selectedMode === 'mode1') {
      mode1InputRef.current?.focus();
    }
  }, [selectedMode, selectedStage, mode1PuzzleIndex]);

  useEffect(() => {
    if (selectedMode === 'mode1' && currentMode1Puzzle) {
      setMode1LetterBank(buildLetterBank(currentMode1Puzzle.title));
    }
  }, [selectedMode, currentMode1Puzzle?.title]);

  useEffect(() => {
    return () => {
      window.onpointermove = null;
      window.onpointerup = null;
    };
  }, []);

  if (!sessionToken) {
    return null;
  }

  if (user.isGuest && user.signupRequired) {
    return <SignupRequiredGate />;
  }

  if (isContentLoading) {
    return <div className="px-4 py-10 text-center text-gv-text-muted">Loading Cinemoji...</div>;
  }

  if (!content || contentError) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-red-400">Cinemoji content is unavailable.</p>
        <Link to="/" className="mt-4 inline-block text-gv-gold underline">
          Back to Machine
        </Link>
      </div>
    );
  }

  const mode1Slots = buildAnswerSlots(currentMode1Puzzle?.title ?? '', mode1Input);
  const mode1NormalizedTarget = normalizeForCompare(currentMode1Puzzle?.title ?? '');

  async function finalizeStageWin(mode: CinemojiMode, stage: number) {
    try {
      const [newProgress, rewardResponse] = await Promise.all([
        completeStage({ mode, stage }).unwrap(),
        claimReward({
          sessionToken,
          outcome: { levelsCompleted: 1, totalLevels: 1, won: true },
        }).unwrap(),
      ]);

      setProgress(newProgress);
      setEarnedCoins(rewardResponse.earnedCoins);
      if (user.isGuest) {
        dispatch(
          setGuestProgression({
            id: user.id,
            coins: rewardResponse.coins,
            signupPromptCount: rewardResponse.signupPromptCount ?? user.signupPromptCount,
            signupRequired: rewardResponse.signupRequired ?? user.signupRequired,
          }),
        );
        setGuestSignupRequired(rewardResponse.signupRequired ?? false);
        setShowSoftPrompt(!(rewardResponse.signupRequired ?? false));
      } else {
        dispatch(setCoins(rewardResponse.coins));
      }
    } catch {
      setActionError('Could not finish stage due to a network issue.');
    }
    setStageFinished(true);
  }

  async function handleMode1Submit() {
    if (!currentMode1Puzzle || !selectedStage) return;
    setActionError('');
    try {
      const result = await submitMode1Guess({
        stage: selectedStage,
        puzzleIndex: mode1PuzzleIndex + 1,
        guess: mode1Input,
      }).unwrap();

      if (!result.correct) {
        setWrongFeedback(true);
        window.setTimeout(() => setWrongFeedback(false), 400);
        return;
      }

      setCorrectOverlay({});
      window.setTimeout(() => {
        setCorrectOverlay(null);
        const isLastPuzzle = mode1PuzzleIndex >= 9;
        if (isLastPuzzle) {
          void finalizeStageWin('mode1', selectedStage);
          return;
        }
        setMode1PuzzleIndex((value) => value + 1);
        setMode1Input('');
        setHintText('');
        setMode1LetterBank(buildLetterBank(currentMode1Stage?.puzzles[mode1PuzzleIndex + 1]?.title ?? ''));
      }, 900);
    } catch {
      setActionError('Submit failed. Please try again.');
    }
  }

  async function handleConnectDrop(rightEmoji: string) {
    if (!currentMode2Round || !selectedStage || !selectedLeftEmoji) return;
    setActionError('');
    try {
      const result = await submitMode2Match({
        stage: selectedStage,
        roundIndex: currentMode2Round.roundIndex,
        leftEmoji: selectedLeftEmoji,
        rightEmoji,
      }).unwrap();

      if (!result.correct) {
        const nextLives = Math.max(0, mode2Lives - 1);
        setMode2Lives(nextLives);
        setWrongFeedback(true);
        window.setTimeout(() => setWrongFeedback(false), 450);
        if (nextLives === 0) {
          setModalState('livesConfirm');
        }
        setSelectedLeftEmoji('');
        return;
      }

      setCorrectOverlay({ title: result.title });
      window.setTimeout(() => {
        setCorrectOverlay(null);
        const isLastRound = mode2RoundIndex >= 4;
        if (isLastRound) {
          void finalizeStageWin('mode2', selectedStage);
          return;
        }
        setMode2RoundIndex((value) => value + 1);
        setSelectedLeftEmoji('');
        setHintText('');
      }, 900);
    } catch {
      setActionError('Connection submit failed. Please try again.');
    }
  }

  function startLeftDrag(leftEmoji: string) {
    const board = mode2BoardRef.current;
    const leftButton = mode2LeftButtonRefs.current.get(leftEmoji);
    if (!board || !leftButton) return;

    const boardRect = board.getBoundingClientRect();
    const leftRect = leftButton.getBoundingClientRect();
    const startX = leftRect.left + leftRect.width / 2 - boardRect.left;
    const startY = leftRect.top + leftRect.height / 2 - boardRect.top;

    setSelectedLeftEmoji(leftEmoji);
    setDragState({ leftEmoji, startX, startY, currentX: startX, currentY: startY });

    window.onpointermove = (event: PointerEvent) => {
      const currentBoard = mode2BoardRef.current;
      if (!currentBoard) return;
      const rect = currentBoard.getBoundingClientRect();
      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentX: event.clientX - rect.left,
              currentY: event.clientY - rect.top,
            }
          : null,
      );
    };

    window.onpointerup = (event: PointerEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const rightCandidate = element?.closest('[data-cinemoji-right]') as HTMLElement | null;
      const rightEmoji = rightCandidate?.dataset.cinemojiRight;

      setDragState(null);
      window.onpointermove = null;
      window.onpointerup = null;

      if (rightEmoji) {
        void handleConnectDrop(rightEmoji);
      }
    };
  }

  async function handleHintVideoComplete() {
    if (!selectedMode || !selectedStage) return;
    try {
      const response = await requestHint({
        mode: selectedMode,
        stage: selectedStage,
        watchRewarded: true,
      }).unwrap();
      if (response.granted) {
        setRewardedLabel(response.rewardedPlaceholder ?? 'REWARDED_VIDEO_PLACEHOLDER');
        setHintText(response.hint ?? '');
      }
    } catch {
      setActionError('Hint request failed. Please try again.');
    }
    setModalState(null);
  }

  async function handleLivesVideoComplete() {
    if (!selectedStage) return;
    try {
      const response = await continueMode2Lives({
        mode: 'mode2',
        stage: selectedStage,
        roundIndex: (currentMode2Round?.roundIndex ?? 1),
        watchRewarded: true,
      }).unwrap();
      if (response.granted) {
        setRewardedLabel(response.rewardedPlaceholder ?? 'REWARDED_VIDEO_PLACEHOLDER');
        setMode2Lives((value) => Math.min(3, value + (response.extraLives ?? 1)));
      }
    } catch {
      setActionError('Could not grant lives. Please try again.');
    }
    setModalState(null);
  }

  function resetStageModeState() {
    setMode1PuzzleIndex(0);
    setMode2RoundIndex(0);
    setMode2Lives(3);
    setMode1Input('');
    setHintText('');
    setCorrectOverlay(null);
    setWrongFeedback(false);
    setSelectedLeftEmoji('');
    setActionError('');
  }

  function renderHearts() {
    return (
      <span className="text-lg" aria-label={`Lives ${mode2Lives}`}>
        {Array.from({ length: 3 })
          .map((_, index) => (index < mode2Lives ? '❤️' : '🖤'))
          .join('')}
      </span>
    );
  }

  if (stageFinished) {
    const isGuestAtThreshold = user.isGuest && guestSignupRequired === true;
    return (
      <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-4 py-6">
        <h1 className="font-heading text-3xl font-bold text-gv-gold">STAGE COMPLETED</h1>
        <p className="mt-2 text-gv-text-muted">You finished stage {selectedStage}.</p>
        <p className="mt-2 text-xl font-bold text-gv-gold">+{earnedCoins} Coins Earned</p>
        {isGuestAtThreshold ? (
          <Link to="/signup" className="mt-6 rounded-full bg-gv-gold px-6 py-3 font-bold text-gv-bg">
            Sign up to continue playing
          </Link>
        ) : (
          <Link to={`/game/${gameId ?? '13'}`} className="mt-6 rounded-full bg-gv-gold px-6 py-3 font-bold text-gv-bg">
            Back to Cinemoji Entry
          </Link>
        )}
        {user.isGuest && showSoftPrompt && !guestSignupRequired && (
          <div className="mt-6 w-full max-w-md">
            <GuestSignupPrompt onDismiss={() => setShowSoftPrompt(false)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-4xl flex-col gap-4 px-3 py-4 sm:px-4 sm:py-6">
      <div className="flex items-center justify-between">
        <Link to={`/game/${gameId ?? '13'}`} className="text-sm text-gv-text-muted hover:text-gv-gold">
          {'\u2190'} Back
        </Link>
        <h1 className="font-heading text-xl font-bold text-gv-gold">CINEMOJI</h1>
        <span className="text-xs text-gv-text-muted">Modes + stages</span>
      </div>

      {!selectedMode && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setSelectedMode('mode1');
              setSelectedStage(null);
              resetStageModeState();
            }}
            className="rounded-xl border border-gv-border bg-gv-surface p-4 text-left"
          >
            <p className="font-heading text-lg text-gv-gold">Mode 1: Emoji + Emoji</p>
            <p className="mt-2 text-sm text-gv-text-muted">Keyboard + letter-bank title guessing.</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedMode('mode2');
              setSelectedStage(null);
              resetStageModeState();
            }}
            className="rounded-xl border border-gv-border bg-gv-surface p-4 text-left"
          >
            <p className="font-heading text-lg text-gv-gold">Mode 2: Connect the Emojis</p>
            <p className="mt-2 text-sm text-gv-text-muted">Drag line to match emoji pairs with lives.</p>
          </button>
        </div>
      )}

      {selectedMode && !selectedStage && (
        <div className="rounded-xl border border-gv-border bg-gv-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg text-gv-gold">
              {selectedMode === 'mode1' ? 'Select Mode 1 Stage' : 'Select Mode 2 Stage'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setSelectedMode(null);
                setSelectedStage(null);
              }}
              className="text-sm text-gv-text-muted underline"
            >
              Change mode
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(selectedMode === 'mode1' ? mode1Stages : mode2Stages).map((stage) => {
              const completed =
                selectedMode === 'mode1'
                  ? progress.mode1CompletedStages.includes(stage.stage)
                  : progress.mode2CompletedStages.includes(stage.stage);
              return (
                <button
                  type="button"
                  key={stage.stage}
                  disabled={completed}
                  onClick={() => {
                    setSelectedStage(stage.stage);
                    resetStageModeState();
                    if (selectedMode === 'mode1') {
                      const firstPuzzle = mode1Stages.find((item) => item.stage === stage.stage)?.puzzles[0];
                      setMode1LetterBank(buildLetterBank(firstPuzzle?.title ?? ''));
                    }
                  }}
                  className="rounded-lg border border-gv-border bg-gv-bg px-3 py-3 text-left disabled:opacity-50"
                >
                  <p className="font-heading text-sm text-gv-gold">Stage {stage.stage}</p>
                  <p className="mt-1 text-xs text-gv-text-muted">{completed ? 'Completed' : 'Uncompleted'}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedMode === 'mode1' && selectedStage && currentMode1Puzzle && (
        <div
          className={`rounded-xl border border-gv-border bg-gv-surface p-4 ${
            wrongFeedback ? 'ring-2 ring-red-500/60' : ''
          }`}
        >
          <div className="mb-3 flex items-center justify-between text-sm text-gv-text-muted">
            <span>
              Stage {selectedStage}/4 - Puzzle {mode1PuzzleIndex + 1}/10
            </span>
            <button
              type="button"
              onClick={() => setModalState('hintConfirm')}
              className="rounded-full border border-gv-gold/50 px-3 py-1 text-xs text-gv-gold"
            >
              Hint
            </button>
          </div>

          <div className="mb-4 text-center text-5xl">
            {currentMode1Puzzle.leftEmoji} {'\u2795'} {currentMode1Puzzle.rightEmoji}
          </div>

          <div className="mb-3 flex flex-wrap justify-center gap-1">
            {mode1Slots.map((char, index) => (
              <div
                key={`slot-${index}`}
                className="flex h-10 w-8 items-center justify-center rounded border border-gv-border bg-gv-bg font-bold text-gv-gold"
              >
                {char || '_'}
              </div>
            ))}
          </div>

          <input
            ref={mode1InputRef}
            value={mode1Input}
            onChange={(event) => setMode1Input(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleMode1Submit();
              }
            }}
            className="mb-3 w-full rounded-lg border border-gv-border bg-gv-bg px-3 py-2 text-sm text-gv-text outline-none focus:border-gv-gold/60"
            placeholder="Type your guess (keyboard enabled)"
          />

          <div className="mb-3 flex flex-wrap justify-center gap-1">
            {mode1LetterBank.map((letter, index) => (
              <button
                type="button"
                key={`${letter}-${index}`}
                onClick={() => setMode1Input((value) => `${normalizeForCompare(value).toUpperCase()}${letter}`)}
                className="h-9 w-9 rounded border border-gv-border bg-gv-bg text-sm font-bold text-gv-text"
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode1Input((value) => value.slice(0, -1))}
              className="rounded border border-gv-border px-3 py-2 text-xs text-gv-text-muted"
            >
              Backspace
            </button>
            <button
              type="button"
              onClick={() => void handleMode1Submit()}
              disabled={isSubmittingMode1 || normalizeForCompare(mode1Input).length !== mode1NormalizedTarget.length}
              className="flex-1 rounded bg-gv-gold px-4 py-2 text-sm font-bold text-gv-bg disabled:opacity-60"
            >
              {isSubmittingMode1 ? 'Checking...' : 'Submit Guess'}
            </button>
          </div>

          {hintText && <p className="mt-3 text-sm text-gv-gold">Hint: {hintText}</p>}
          <div className="mt-4 rounded-lg border border-gv-border bg-gv-bg/40 p-2 text-center text-xs text-gv-text-muted">
            AD PLACEHOLDER (PERSISTENT MODE 1 BOTTOM)
          </div>
        </div>
      )}

      {selectedMode === 'mode2' && selectedStage && currentMode2Round && (
        <div
          ref={mode2BoardRef}
          className={`relative rounded-xl border border-gv-border bg-gv-surface p-4 ${
            wrongFeedback ? 'ring-2 ring-red-500/60' : ''
          }`}
        >
          <div className="mb-3 flex items-center justify-between text-sm text-gv-text-muted">
            <span>
              Stage {selectedStage}/8 - Round {currentMode2Round.roundIndex}/5
            </span>
            {renderHearts()}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setModalState('hintConfirm')}
              className="rounded-full border border-gv-gold/50 px-3 py-1 text-xs text-gv-gold"
            >
              Hint
            </button>
            <span className="text-xs text-gv-text-muted">Drag from left emoji to right emoji</span>
          </div>

          <div className="mb-3 rounded-lg border border-gv-border/40 bg-gv-bg/50 p-2 text-center text-xs text-gv-text-muted">
            AD PLACEHOLDER (PERSISTENT MODE 2)
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {currentMode2Round.leftChoices.map((emoji) => (
                <button
                  key={`left-${emoji}`}
                  type="button"
                  ref={(element) => {
                    if (element) {
                      mode2LeftButtonRefs.current.set(emoji, element);
                    } else {
                      mode2LeftButtonRefs.current.delete(emoji);
                    }
                  }}
                  onPointerDown={() => startLeftDrag(emoji)}
                  className={`w-full rounded-lg border border-gv-border bg-gv-bg px-3 py-3 text-3xl ${
                    selectedLeftEmoji === emoji ? 'ring-2 ring-gv-gold/70' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {currentMode2Round.rightChoices.map((emoji) => (
                <button
                  key={`right-${emoji}`}
                  type="button"
                  data-cinemoji-right={emoji}
                  className="w-full rounded-lg border border-gv-border bg-gv-bg px-3 py-3 text-3xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {dragState && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <line
                x1={dragState.startX}
                y1={dragState.startY}
                x2={dragState.currentX}
                y2={dragState.currentY}
                stroke="#f2c76e"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>
          )}

          {hintText && <p className="mt-3 text-sm text-gv-gold">Hint: {hintText}</p>}
        </div>
      )}

      {actionError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {actionError}
        </div>
      )}

      {rewardedLabel && (
        <div className="rounded-lg border border-gv-border bg-gv-surface p-2 text-center text-xs text-gv-text-muted">
          {rewardedLabel}
        </div>
      )}

      {correctOverlay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="rounded-2xl border border-gv-gold/30 bg-gv-surface p-6 text-center">
            <p className="font-heading text-2xl font-bold text-gv-gold">CORRECT</p>
            {correctOverlay.title && <p className="mt-2 text-sm text-gv-text-muted">{correctOverlay.title}</p>}
          </div>
        </div>
      )}

      {modalState === 'hintConfirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gv-border bg-gv-surface p-5 text-center">
            <p className="text-sm text-gv-text">Watch to earn a hint?</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setModalState('hintVideo')}
                className="rounded bg-gv-gold px-4 py-2 text-sm font-bold text-gv-bg"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="rounded border border-gv-border px-4 py-2 text-sm text-gv-text"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'hintVideo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gv-border bg-gv-surface p-5 text-center">
            <p className="text-sm text-gv-text-muted">REWARDED VIDEO PLACEHOLDER</p>
            <button
              type="button"
              onClick={() => void handleHintVideoComplete()}
              disabled={isRequestingHint}
              className="mt-4 rounded bg-gv-gold px-4 py-2 text-sm font-bold text-gv-bg"
            >
              {isRequestingHint ? 'Loading hint...' : 'Finish Video'}
            </button>
          </div>
        </div>
      )}

      {modalState === 'livesConfirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gv-border bg-gv-surface p-5 text-center">
            <p className="text-sm text-gv-text">Watch to earn more lives?</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setModalState('livesVideo')}
                className="rounded bg-gv-gold px-4 py-2 text-sm font-bold text-gv-bg"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalState(null);
                  setMode2RoundIndex(0);
                  setMode2Lives(3);
                  setHintText('');
                  setSelectedLeftEmoji('');
                }}
                className="rounded border border-gv-border px-4 py-2 text-sm text-gv-text"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'livesVideo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gv-border bg-gv-surface p-5 text-center">
            <p className="text-sm text-gv-text-muted">REWARDED VIDEO PLACEHOLDER</p>
            <p className="mt-2 text-xs text-gv-text-muted">Reward policy: +1 life (up to 3 hearts).</p>
            <button
              type="button"
              onClick={() => void handleLivesVideoComplete()}
              disabled={isContinuingLives}
              className="mt-4 rounded bg-gv-gold px-4 py-2 text-sm font-bold text-gv-bg"
            >
              {isContinuingLives ? 'Granting...' : 'Finish Video'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
