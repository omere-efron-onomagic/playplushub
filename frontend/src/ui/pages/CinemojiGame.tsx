import {
  useContinueMode2LivesMutation,
  useGetCinemojiContentQuery,
  useRequestHintMutation,
  useSubmitMode1GuessMutation,
  useSubmitMode2MatchMutation,
} from '@/store/apis/cinemoji.api';
import { useClaimGameSessionRewardMutation } from '@/store/apis/wallet.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCoins, setGuestProgression } from '@/store/slices/user.slice';
import { GuestSignupPrompt } from '@/ui/components/GuestSignupPrompt';
import { SignupRequiredGate } from '@/ui/components/SignupRequiredGate';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

type PlayLocationState = { sessionToken?: string } | null;
type CinemojiMode = 'mode1' | 'mode2';

function normalizeForBank(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function buildLetterBank(target: string): string[] {
  const extras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const base = target.split('');
  const bank = [...base];
  let index = 0;
  while (bank.length < Math.max(12, target.length + 4)) {
    bank.push(extras[index % extras.length] ?? 'A');
    index += 1;
  }
  return bank.sort(() => Math.random() - 0.5);
}

export function CinemojiGame() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams<{ gameId: string }>();
  const user = useAppSelector((state) => state.user);
  const [claimReward] = useClaimGameSessionRewardMutation();
  const [selectedMode, setSelectedMode] = useState<CinemojiMode | null>(null);
  const [mode1StageIndex, setMode1StageIndex] = useState(0);
  const [mode1PuzzleIndex, setMode1PuzzleIndex] = useState(0);
  const [mode2StageIndex, setMode2StageIndex] = useState(0);
  const [mode2RoundIndex, setMode2RoundIndex] = useState(0);
  const [mode2Lives, setMode2Lives] = useState(3);
  const [mode2LeftSelection, setMode2LeftSelection] = useState('');
  const [mode2RightSelection, setMode2RightSelection] = useState('');
  const [mode1GuessLetters, setMode1GuessLetters] = useState<string[]>([]);
  const [hintText, setHintText] = useState('');
  const [showHintConfirm, setShowHintConfirm] = useState(false);
  const [showMode2LivesPrompt, setShowMode2LivesPrompt] = useState(false);
  const [correctOverlay, setCorrectOverlay] = useState<{ title: string } | null>(null);
  const [rewardedBanner, setRewardedBanner] = useState('');
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const [guestSignupRequired, setGuestSignupRequired] = useState<boolean | null>(null);

  const [submitMode1Guess, { isLoading: isSubmittingMode1 }] = useSubmitMode1GuessMutation();
  const [submitMode2Match, { isLoading: isSubmittingMode2 }] = useSubmitMode2MatchMutation();
  const [requestHint, { isLoading: isRequestingHint }] = useRequestHintMutation();
  const [continueMode2Lives, { isLoading: isContinuingLives }] = useContinueMode2LivesMutation();
  const { data, isLoading, error } = useGetCinemojiContentQuery();

  const sessionToken = (location.state as PlayLocationState)?.sessionToken;

  useEffect(() => {
    if (!sessionToken) {
      navigate(`/game/${gameId ?? '13'}`, { replace: true });
    }
  }, [sessionToken, navigate, gameId]);

  if (!sessionToken) return null;

  if (user.isGuest && user.signupRequired) {
    return <SignupRequiredGate />;
  }

  const mode1Stages = data?.mode1Stages ?? [];
  const mode2Stages = data?.mode2Stages ?? [];
  const mode1Stage = mode1Stages[mode1StageIndex];
  const mode2Stage = mode2Stages[mode2StageIndex];
  const mode1Puzzle = mode1Stage?.puzzles[mode1PuzzleIndex];
  const mode2Round = mode2Stage?.rounds[mode2RoundIndex];

  const mode1AnswerNormalized = normalizeForBank(mode1Puzzle?.title ?? '');
  const mode1LetterBank = buildLetterBank(mode1AnswerNormalized);

  async function finalizeWin() {
    try {
      const response = await claimReward({
        sessionToken,
        outcome: { levelsCompleted: 1, totalLevels: 1, won: true },
      }).unwrap();
      setEarnedCoins(response.earnedCoins);
      if (user.isGuest) {
        dispatch(
          setGuestProgression({
            id: user.id,
            coins: response.coins,
            signupPromptCount: response.signupPromptCount ?? user.signupPromptCount,
            signupRequired: response.signupRequired ?? user.signupRequired,
          }),
        );
        setGuestSignupRequired(response.signupRequired ?? false);
        setShowSoftPrompt(!(response.signupRequired ?? false));
      } else {
        dispatch(setCoins(response.coins));
      }
    } catch {
      setEarnedCoins(0);
    }
    setGameComplete(true);
  }

  function advanceMode1() {
    if (!mode1Stage) return;
    const hasMorePuzzle = mode1PuzzleIndex < mode1Stage.puzzles.length - 1;
    if (hasMorePuzzle) {
      setMode1PuzzleIndex((value) => value + 1);
      setMode1GuessLetters([]);
      return;
    }

    const hasMoreStages = mode1StageIndex < mode1Stages.length - 1;
    if (hasMoreStages) {
      setMode1StageIndex((value) => value + 1);
      setMode1PuzzleIndex(0);
      setMode1GuessLetters([]);
      return;
    }

    void finalizeWin();
  }

  function advanceMode2() {
    if (!mode2Stage) return;
    const hasMoreRounds = mode2RoundIndex < mode2Stage.rounds.length - 1;
    if (hasMoreRounds) {
      setMode2RoundIndex((value) => value + 1);
      setMode2LeftSelection('');
      setMode2RightSelection('');
      return;
    }

    const hasMoreStages = mode2StageIndex < mode2Stages.length - 1;
    if (hasMoreStages) {
      setMode2StageIndex((value) => value + 1);
      setMode2RoundIndex(0);
      setMode2LeftSelection('');
      setMode2RightSelection('');
      return;
    }

    void finalizeWin();
  }

  async function handleMode1Submit() {
    if (!mode1Puzzle || !mode1Stage) return;
    try {
      const guess = mode1GuessLetters.join('');
      const result = await submitMode1Guess({
        stage: mode1Stage.stage,
        puzzleIndex: mode1PuzzleIndex + 1,
        guess,
      }).unwrap();
      if (!result.correct) {
        return;
      }

      setCorrectOverlay({ title: result.title });
      setTimeout(() => {
        setCorrectOverlay(null);
        advanceMode1();
      }, 1100);
    } catch {
      // Keep user on the current puzzle on network/API failure.
    }
  }

  async function handleMode2Submit() {
    if (!mode2Round || !mode2Stage || !mode2LeftSelection || !mode2RightSelection) return;
    try {
      const result = await submitMode2Match({
        stage: mode2Stage.stage,
        roundIndex: mode2Round.roundIndex,
        leftEmoji: mode2LeftSelection,
        rightEmoji: mode2RightSelection,
      }).unwrap();

      if (!result.correct) {
        const nextLives = mode2Lives - 1;
        setMode2Lives(nextLives);
        setMode2LeftSelection('');
        setMode2RightSelection('');
        if (nextLives <= 0) {
          setShowMode2LivesPrompt(true);
        }
        return;
      }

      setCorrectOverlay({ title: result.title });
      setTimeout(() => {
        setCorrectOverlay(null);
        advanceMode2();
      }, 1100);
    } catch {
      // Keep current selections for retry on network/API failure.
    }
  }

  async function handleRequestHint(confirmWatch: boolean) {
    if (!selectedMode) return;

    setShowHintConfirm(false);
    if (!confirmWatch) {
      return;
    }

    const stage = selectedMode === 'mode1' ? mode1Stage?.stage : mode2Stage?.stage;
    if (!stage) {
      return;
    }
    try {
      const response = await requestHint({
        mode: selectedMode,
        stage,
        watchRewarded: true,
      }).unwrap();
      if (response.granted) {
        setRewardedBanner(response.rewardedPlaceholder ?? '');
        setHintText(response.hint ?? '');
      }
    } catch {
      // Ignore hint fetch failures and keep gameplay uninterrupted.
    }
  }

  async function handleContinueLives(confirmWatch: boolean) {
    if (!confirmWatch) {
      setMode2StageIndex(0);
      setMode2RoundIndex(0);
      setMode2Lives(3);
      setMode2LeftSelection('');
      setMode2RightSelection('');
      setShowMode2LivesPrompt(false);
      return;
    }

    try {
      const response = await continueMode2Lives({ watchRewarded: true }).unwrap();
      setRewardedBanner(response.rewardedPlaceholder ?? '');
      setMode2Lives((value) => value + (response.extraLives ?? 1));
      setShowMode2LivesPrompt(false);
    } catch {
      setShowMode2LivesPrompt(false);
    }
  }

  if (isLoading) {
    return <div className="px-4 py-10 text-center text-gv-text-muted">Loading Cinemoji...</div>;
  }

  if (error || !data) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-red-400">Failed to load Cinemoji data.</p>
        <Link to="/" className="mt-4 inline-block text-gv-gold underline">
          Back to Machine
        </Link>
      </div>
    );
  }

  if (gameComplete) {
    const isGuestAtThreshold = user.isGuest && guestSignupRequired === true;
    return (
      <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-4 py-6">
        <h1 className="font-heading text-4xl font-bold text-gv-gold">YOU WIN!</h1>
        <p className="mt-2 text-gv-text-muted">Cinemoji mode completed.</p>
        <p className="mt-2 text-xl font-bold text-gv-gold">+{earnedCoins} Coins Earned</p>
        {isGuestAtThreshold ? (
          <Link
            to="/signup"
            className="mt-6 inline-flex rounded-full bg-gv-gold px-6 py-3 font-bold text-gv-bg"
          >
            Sign up to continue playing
          </Link>
        ) : (
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-gv-gold px-6 py-3 font-bold text-gv-bg"
          >
            BACK TO MACHINE
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
    <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-3xl flex-col gap-4 px-3 py-4 sm:px-4 sm:py-6">
      <div className="flex items-center justify-between">
        <Link to={`/game/${gameId ?? '13'}`} className="text-sm text-gv-text-muted hover:text-gv-gold">
          {'\u2190'} Back
        </Link>
        <h1 className="font-heading text-xl font-bold text-gv-gold">CINEMOJI</h1>
        <span className="text-xs text-gv-text-muted">2 Modes</span>
      </div>

      {!selectedMode && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelectedMode('mode1')}
            className="rounded-xl border border-gv-border bg-gv-surface p-4 text-left"
          >
            <p className="font-heading text-lg text-gv-gold">Mode 1: Emoji + Emoji</p>
            <p className="mt-2 text-sm text-gv-text-muted">Guess the title using the letter bank.</p>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode('mode2')}
            className="rounded-xl border border-gv-border bg-gv-surface p-4 text-left"
          >
            <p className="font-heading text-lg text-gv-gold">Mode 2: Connect the Emojis</p>
            <p className="mt-2 text-sm text-gv-text-muted">Match left/right emojis correctly. You have 3 lives.</p>
          </button>
        </div>
      )}

      {selectedMode === 'mode1' && mode1Puzzle && mode1Stage && (
        <div className="relative rounded-xl border border-gv-border bg-gv-surface p-4">
          <div className="mb-3 flex items-center justify-between text-sm text-gv-text-muted">
            <span>
              Stage {mode1Stage.stage}/4 - Puzzle {mode1PuzzleIndex + 1}/10
            </span>
            <button
              type="button"
              onClick={() => setShowHintConfirm(true)}
              className="rounded-full border border-gv-gold/50 px-3 py-1 text-xs text-gv-gold"
            >
              Hint
            </button>
          </div>

          <div className="mb-4 text-center text-5xl">
            {mode1Puzzle.leftEmoji} {'\u2795'} {mode1Puzzle.rightEmoji}
          </div>

          <div className="mb-4 flex min-h-12 flex-wrap justify-center gap-1">
            {mode1GuessLetters.map((letter, idx) => (
              <button
                type="button"
                key={`${letter}-${idx}`}
                onClick={() => setMode1GuessLetters((prev) => prev.filter((_, i) => i !== idx))}
                className="h-10 w-10 rounded border border-gv-gold/60 bg-gv-gold/10 font-bold text-gv-gold"
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap justify-center gap-1">
            {mode1LetterBank.map((letter, idx) => (
              <button
                type="button"
                key={`${letter}-${idx}`}
                onClick={() =>
                  setMode1GuessLetters((prev) =>
                    prev.length < mode1AnswerNormalized.length ? [...prev, letter] : prev,
                  )
                }
                className="h-9 w-9 rounded border border-gv-border bg-gv-bg text-sm font-bold text-gv-text"
              >
                {letter}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void handleMode1Submit()}
            disabled={isSubmittingMode1 || mode1GuessLetters.length < 1}
            className="w-full rounded-lg bg-gv-gold px-4 py-2 text-sm font-bold text-gv-bg disabled:opacity-60"
          >
            {isSubmittingMode1 ? 'Checking...' : 'Submit Guess'}
          </button>
          {hintText && <p className="mt-3 text-sm text-gv-gold">Hint: {hintText}</p>}
        </div>
      )}

      {selectedMode === 'mode2' && mode2Round && mode2Stage && (
        <div className="relative rounded-xl border border-gv-border bg-gv-surface p-4">
          <div className="mb-3 flex items-center justify-between text-sm text-gv-text-muted">
            <span>
              Stage {mode2Stage.stage}/8 - Round {mode2Round.roundIndex}/5
            </span>
            <span>Lives: {mode2Lives}</span>
          </div>

          <div className="mb-3 rounded-lg border border-gv-border/40 bg-gv-bg/50 p-2 text-center text-xs text-gv-text-muted">
            AD PLACEHOLDER (PERSISTENT)
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gv-border p-2">
              <p className="mb-2 text-center text-xs text-gv-text-muted">Left</p>
              <div className="grid grid-cols-1 gap-2">
                {mode2Round.leftChoices.map((emoji) => (
                  <button
                    type="button"
                    key={`left-${emoji}`}
                    onClick={() => setMode2LeftSelection(emoji)}
                    className={`rounded px-3 py-2 text-2xl ${
                      mode2LeftSelection === emoji ? 'bg-gv-gold/20' : 'bg-gv-bg'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-gv-border p-2">
              <p className="mb-2 text-center text-xs text-gv-text-muted">Right</p>
              <div className="grid grid-cols-1 gap-2">
                {mode2Round.rightChoices.map((emoji) => (
                  <button
                    type="button"
                    key={`right-${emoji}`}
                    onClick={() => setMode2RightSelection(emoji)}
                    className={`rounded px-3 py-2 text-2xl ${
                      mode2RightSelection === emoji ? 'bg-gv-gold/20' : 'bg-gv-bg'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setShowHintConfirm(true)}
              className="rounded-lg border border-gv-gold/50 px-4 py-2 text-sm text-gv-gold"
            >
              Hint
            </button>
            <button
              type="button"
              onClick={() => void handleMode2Submit()}
              disabled={isSubmittingMode2 || !mode2LeftSelection || !mode2RightSelection}
              className="flex-1 rounded-lg bg-gv-gold px-4 py-2 text-sm font-bold text-gv-bg disabled:opacity-60"
            >
              {isSubmittingMode2 ? 'Checking...' : 'Submit Match'}
            </button>
          </div>
          {hintText && <p className="mt-3 text-sm text-gv-gold">Hint: {hintText}</p>}
        </div>
      )}

      {showHintConfirm && (
        <div className="rounded-xl border border-gv-border bg-gv-bg p-4 text-center">
          <p className="text-sm text-gv-text">Watch a video to get a hint?</p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => void handleRequestHint(true)}
              disabled={isRequestingHint}
              className="rounded bg-gv-gold px-4 py-2 text-sm font-bold text-gv-bg"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => void handleRequestHint(false)}
              className="rounded border border-gv-border px-4 py-2 text-sm text-gv-text"
            >
              No
            </button>
          </div>
        </div>
      )}

      {showMode2LivesPrompt && (
        <div className="rounded-xl border border-gv-border bg-gv-bg p-4 text-center">
          <p className="text-sm text-gv-text">No lives left. Watch a video for +1 life?</p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => void handleContinueLives(true)}
              disabled={isContinuingLives}
              className="rounded bg-gv-gold px-4 py-2 text-sm font-bold text-gv-bg"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => void handleContinueLives(false)}
              className="rounded border border-gv-border px-4 py-2 text-sm text-gv-text"
            >
              No
            </button>
          </div>
        </div>
      )}

      {rewardedBanner && (
        <div className="rounded-lg border border-gv-border bg-gv-surface p-2 text-center text-xs text-gv-text-muted">
          {rewardedBanner}
        </div>
      )}

      {correctOverlay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="rounded-2xl border border-gv-gold/30 bg-gv-surface p-6 text-center">
            <p className="font-heading text-2xl font-bold text-gv-gold">CORRECT</p>
            {selectedMode === 'mode2' && (
              <p className="mt-2 text-sm text-gv-text-muted">{correctOverlay.title}</p>
            )}
            <div className="mt-3 rounded-md border border-gv-border px-3 py-2 text-xs text-gv-text-muted">
              AD PLACEHOLDER
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
