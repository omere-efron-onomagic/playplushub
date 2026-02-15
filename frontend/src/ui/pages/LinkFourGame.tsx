import { linkFourLevels } from '@/data/linkFourLevels';
import { games } from '@/data/games';
import { useClaimGameSessionRewardMutation } from '@/store/apis/wallet.api';
import { useUpdateGuestProgressionMutation } from '@/store/apis/auth.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCoins, setGuestProgression } from '@/store/slices/user.slice';
import { GuestSignupPrompt } from '@/ui/components/GuestSignupPrompt';
import { SignupRequiredGate } from '@/ui/components/SignupRequiredGate';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PlayLocationState = { sessionToken?: string; sessionId?: string } | null;

export function LinkFourGame() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.user);
  const [claimReward] = useClaimGameSessionRewardMutation();
  const [updateGuestProgression] = useUpdateGuestProgressionMutation();
  const { gameId } = useParams<{ gameId: string }>();
  const selectedGame = games.find((game) => game.id === gameId) ?? games[0];
  const playState = location.state as PlayLocationState;
  const sessionToken = playState?.sessionToken;
  const totalLevels = linkFourLevels.length;
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<
    { letter: string; bankIndex: number }[]
  >([]);
  const [solvedLevels, setSolvedLevels] = useState<Set<number>>(new Set());
  const [shakeAnswer, setShakeAnswer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [rewardHandled, setRewardHandled] = useState(false);
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const [guestSignupRequired, setGuestSignupRequired] = useState<boolean | null>(null);

  const level = linkFourLevels[currentLevel];

  // Gate: guest with signupRequired cannot play
  if (user.isGuest && user.signupRequired) {
    return <SignupRequiredGate />;
  }

  // Auth user must have started session from GamePage (spend-before-play)
  if (!user.isGuest && !sessionToken) {
    navigate(`/game/${gameId ?? '1'}`, { replace: true });
    return null;
  }

  // Build shuffled letter bank for current level
  const letterBank = useMemo(() => {
    const answerLetters = level.answer.split('');
    const extra = level.extraLetters.split('');
    return shuffleArray([...answerLetters, ...extra]);
  }, [level]);

  // Track which bank slots are used
  const [usedBankSlots, setUsedBankSlots] = useState<Set<number>>(new Set());

  // Reset selections when level changes
  useEffect(() => {
    setSelectedLetters([]);
    setUsedBankSlots(new Set());
    setShakeAnswer(false);
    setShowSuccess(false);
  }, [currentLevel]);

  const rewardCoins = selectedGame?.rewardCoins ?? 20;

  useEffect(() => {
    if (!gameComplete || rewardHandled) {
      return;
    }

    setRewardHandled(true);

    const applyReward = async () => {
      try {
        if (user.isGuest && user.guestToken) {
          const response = await updateGuestProgression({ addCoins: rewardCoins }).unwrap();
          dispatch(
            setGuestProgression({
              id: response.guest.id,
              coins: response.guest.coins,
              signupPromptCount: response.guest.signupPromptCount,
              signupRequired: response.guest.signupRequired,
            }),
          );
          setEarnedCoins(rewardCoins);
          setGuestSignupRequired(response.guest.signupRequired);
          setShowSoftPrompt(!response.guest.signupRequired);
        } else if (!user.isGuest && sessionToken) {
          const outcome = {
            levelsCompleted: solvedLevels.size,
            totalLevels,
            won: true,
          };
          const response = await claimReward({ sessionToken, outcome }).unwrap();
          dispatch(setCoins(response.coins));
          setEarnedCoins(response.earnedCoins);
        } else {
          setEarnedCoins(0);
        }
      } catch {
        setEarnedCoins(0);
      }
    };

    void applyReward();
  }, [
    dispatch,
    gameComplete,
    rewardCoins,
    claimReward,
    updateGuestProgression,
    rewardHandled,
    user.isGuest,
    user.guestToken,
    sessionToken,
    solvedLevels.size,
    totalLevels,
  ]);

  const handleLetterClick = useCallback(
    (letter: string, bankIndex: number) => {
      if (usedBankSlots.has(bankIndex)) return;
      if (selectedLetters.length >= level.answer.length) return;

      const newSelected = [...selectedLetters, { letter, bankIndex }];
      setSelectedLetters(newSelected);
      setUsedBankSlots((prev) => new Set([...prev, bankIndex]));

      // Check answer when all slots filled
      if (newSelected.length === level.answer.length) {
        const guess = newSelected.map((s) => s.letter).join('');
        if (guess === level.answer) {
          // Correct
          setShowSuccess(true);
          setSolvedLevels((prev) => new Set([...prev, currentLevel]));
          setTimeout(() => {
            if (currentLevel < linkFourLevels.length - 1) {
              setCurrentLevel((prev) => prev + 1);
            } else {
              setGameComplete(true);
            }
          }, 1200);
        } else {
          // Wrong - shake and clear
          setShakeAnswer(true);
          setTimeout(() => {
            setShakeAnswer(false);
            setSelectedLetters([]);
            setUsedBankSlots(new Set());
          }, 600);
        }
      }
    },
    [usedBankSlots, selectedLetters, level.answer, currentLevel]
  );

  const handleRemoveLetter = useCallback(
    (index: number) => {
      if (showSuccess) return;
      const removed = selectedLetters[index];
      if (!removed) return;
      setSelectedLetters((prev) => prev.filter((_, i) => i !== index));
      setUsedBankSlots((prev) => {
        const next = new Set(prev);
        next.delete(removed.bankIndex);
        return next;
      });
    },
    [selectedLetters, showSuccess]
  );

  if (gameComplete) {
    const isGuestAtThreshold = user.isGuest && guestSignupRequired === true;
    return (
      <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-4 py-6">
        <div className="text-center">
          <div className="mb-3 text-5xl sm:mb-4 sm:text-6xl">{'\uD83C\uDFC6'}</div>
          <h1 className="font-heading text-2xl font-bold tracking-wider text-gv-gold sm:text-4xl">
            YOU WIN!
          </h1>
          <p className="mt-2 text-base text-gv-text-muted sm:mt-3 sm:text-lg">
            All 10 levels completed!
          </p>
          <div className="mt-2 font-heading text-xl font-bold text-gv-gold sm:text-2xl">
            +{earnedCoins} Coins Earned
          </div>
          {isGuestAtThreshold ? (
            <div className="mt-6 flex flex-col gap-3 sm:mt-8">
              <Link
                to="/signup"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-6 py-3 font-heading text-sm font-bold tracking-[0.2em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-105 active:scale-[0.98] touch-manipulation sm:px-8"
              >
                Sign up to continue playing
              </Link>
              <Link
                to="/"
                className="text-sm text-gv-text-muted underline transition-colors hover:text-gv-gold"
              >
                Back to machine
              </Link>
            </div>
          ) : (
            <Link
              to="/"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-6 py-3 font-heading text-sm font-bold tracking-[0.2em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-105 active:scale-[0.98] touch-manipulation sm:mt-8 sm:px-8"
            >
              BACK TO MACHINE
            </Link>
          )}
        </div>
        {user.isGuest && showSoftPrompt && !guestSignupRequired && (
          <GuestSignupPrompt onDismiss={() => setShowSoftPrompt(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-60px)] max-w-lg flex-col items-center px-3 py-4 sm:px-4 sm:py-6">
      {/* Header - touch-friendly back */}
      <div className="mb-3 flex w-full items-center justify-between sm:mb-4">
        <Link
          to="/game/1"
          className="flex min-h-[44px] min-w-[44px] items-center gap-1 py-2 text-sm text-gv-text-muted transition-colors hover:text-gv-gold touch-manipulation sm:min-h-0 sm:min-w-0"
        >
          {'\u2190'} Back
        </Link>
        <h2 className="font-heading text-base font-bold tracking-wider text-gv-gold sm:text-lg">
          LEVEL {level.level}/10
        </h2>
        <div className="min-h-[44px] flex items-center text-sm text-gv-text-muted sm:min-h-0">
          {solvedLevels.size}/10
        </div>
      </div>

      {/* Level progress bar */}
      <div className="mb-4 flex w-full gap-0.5 sm:mb-6 sm:gap-1">
        {linkFourLevels.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              solvedLevels.has(i)
                ? 'bg-gv-gold'
                : i === currentLevel
                  ? 'bg-gv-gold/40'
                  : 'bg-gv-border'
            }`}
          />
        ))}
      </div>

      {/* 4 Images Grid */}
      <div className="mb-4 grid w-full grid-cols-2 gap-1.5 sm:mb-6 sm:gap-2">
        {level.images.map((img, i) => (
          <div
            key={i}
            className="aspect-square overflow-hidden rounded-lg border border-gv-border sm:rounded-xl"
          >
            <img
              src={img}
              alt={`Clue ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Answer Slots - larger touch targets on mobile */}
      <div
        className={`mb-6 flex flex-wrap justify-center gap-1.5 sm:mb-8 sm:gap-2 ${shakeAnswer ? 'animate-shake' : ''}`}
      >
        {Array.from({ length: level.answer.length }).map((_, i) => {
          const filled = selectedLetters[i];
          return (
            <button
              key={i}
              onClick={() => handleRemoveLetter(i)}
              className={`flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-lg border-2 font-heading text-xl font-bold transition-all touch-manipulation sm:h-12 sm:w-12 sm:min-h-0 sm:min-w-0 ${
                showSuccess && filled
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : filled
                    ? 'border-gv-gold bg-gv-gold/10 text-gv-gold hover:border-red-400'
                    : 'border-gv-border bg-gv-surface text-transparent'
              }`}
            >
              {filled?.letter ?? '\u00A0'}
            </button>
          );
        })}
      </div>

      {/* Letter Bank - 44px min touch targets on mobile */}
      <div className="flex w-full max-w-sm flex-wrap justify-center gap-1.5 sm:gap-2">
        {letterBank.map((letter, i) => {
          const isUsed = usedBankSlots.has(i);
          return (
            <button
              key={i}
              disabled={isUsed}
              onClick={() => handleLetterClick(letter, i)}
              className={`flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-lg font-heading text-lg font-bold transition-all touch-manipulation sm:h-11 sm:w-11 sm:min-h-0 sm:min-w-0 ${
                isUsed
                  ? 'border border-gv-border/30 bg-gv-bg text-transparent'
                  : 'border border-gv-border bg-gv-surface text-gv-text hover:border-gv-gold/50 hover:bg-gv-gold/10 hover:text-gv-gold active:scale-95'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="mt-4 font-heading text-base font-bold tracking-wider text-green-400 sm:mt-6 sm:text-lg">
          {'\u2714'} Correct!
        </div>
      )}
    </div>
  );
}
