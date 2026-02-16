import {
  useCompleteQuizmoStageMutation,
  useGetQuizmoStageQuestionsQuery,
  useGetQuizmoStagesQuery,
  useSubmitQuizmoAnswerMutation,
} from '@/store/apis/quizmo.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCoins, setGuestProgression } from '@/store/slices/user.slice';
import { GuestSignupPrompt } from '@/ui/components/GuestSignupPrompt';
import { SignupRequiredGate } from '@/ui/components/SignupRequiredGate';
import { toImageUrl } from '@/utils/imageUrl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

type PlayLocationState = { sessionToken?: string } | null;
type QuizAnswer = { levelIndex: number; answerIndex: number | null };
type AnswerResult = { levelIndex: number; correct: boolean };

const TIMER_SECONDS = 10;

export function QuizmoGame() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams<{ gameId: string }>();
  const user = useAppSelector((state) => state.user);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([]);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [summary, setSummary] = useState<{
    correctCount: number;
    totalQuestions: number;
    coinsEarned: number;
    formula: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const [guestSignupRequired, setGuestSignupRequired] = useState<boolean | null>(null);
  const advanceInFlightRef = useRef(false);
  const timeoutHandledRef = useRef(false);

  const sessionToken = (location.state as PlayLocationState)?.sessionToken;
  const { data: stagesData, isLoading: stagesLoading, error: stagesError } = useGetQuizmoStagesQuery();
  const stage = stagesData?.stages?.[0] ?? null;
  const stageId = stage?.stageId ?? '';
  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
  } = useGetQuizmoStageQuestionsQuery(stageId, { skip: !stageId });
  const [submitAnswer] = useSubmitQuizmoAnswerMutation();
  const [completeStage, { isLoading: isCompleting }] = useCompleteQuizmoStageMutation();

  const questions = questionsData?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (!sessionToken) {
      navigate(`/game/${gameId ?? '14'}`, { replace: true });
    }
  }, [sessionToken, navigate, gameId]);

  // Reset timeout state for each question.
  useEffect(() => {
    if (!currentQuestion || isComplete) return;
    timeoutHandledRef.current = false;
    setTimeLeft(TIMER_SECONDS);
  }, [currentQuestionIndex, currentQuestion?.levelIndex, isComplete]);

  // Tick down timer for active question.
  useEffect(() => {
    if (!currentQuestion || isComplete || isSubmittingAnswer) return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentQuestion?.levelIndex, isComplete, isSubmittingAnswer]);

  // Trigger timeout once when clock hits zero.
  useEffect(() => {
    if (!currentQuestion || isComplete || isSubmittingAnswer) return;
    if (timeLeft > 0) return;
    if (timeoutHandledRef.current) return;
    timeoutHandledRef.current = true;
    void handleTimeout();
  }, [timeLeft, currentQuestion, isComplete, isSubmittingAnswer]);

  const totalQuestions = useMemo(() => questions.length, [questions.length]);

  async function goToNextQuestion(answerIndex: number | null, isCorrect: boolean) {
    if (!currentQuestion) return;
    if (advanceInFlightRef.current) return;
    advanceInFlightRef.current = true;

    const nextAnswers = [
      ...answers.filter((item) => item.levelIndex !== currentQuestion.levelIndex),
      { levelIndex: currentQuestion.levelIndex, answerIndex },
    ];
    const nextResults = [
      ...answerResults.filter((item) => item.levelIndex !== currentQuestion.levelIndex),
      { levelIndex: currentQuestion.levelIndex, correct: isCorrect },
    ];
    setAnswers(nextAnswers);
    setAnswerResults(nextResults);
    setSelectedAnswerIndex(null);

    const isLast = currentQuestionIndex >= totalQuestions - 1;
    if (!isLast) {
      setCurrentQuestionIndex((index) => index + 1);
      advanceInFlightRef.current = false;
      return;
    }

    if (!stageId || !sessionToken) {
      advanceInFlightRef.current = false;
      return;
    }
    try {
      const result = await completeStage({
        stageId,
        sessionToken,
        answers: nextAnswers,
      }).unwrap();

      if (user.isGuest) {
        dispatch(
          setGuestProgression({
            id: user.id,
            coins: result.coins,
            signupPromptCount: result.signupPromptCount ?? user.signupPromptCount,
            signupRequired: result.signupRequired ?? user.signupRequired,
          }),
        );
        setGuestSignupRequired(result.signupRequired ?? false);
        setShowSoftPrompt(!(result.signupRequired ?? false));
      } else {
        dispatch(setCoins(result.coins));
      }

      setSummary({
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        coinsEarned: result.coinsEarned,
        formula: result.formula,
      });
      setIsComplete(true);
    } catch {
      const localCorrectCount = nextResults.filter((item) => item.correct).length;
      setSummary({
        correctCount: localCorrectCount,
        totalQuestions,
        coinsEarned: 0,
        formula: 'Reward sync failed for this run',
      });
      setErrorMessage('Could not sync reward, but your quiz score is shown.');
      setIsComplete(true);
    } finally {
      advanceInFlightRef.current = false;
    }
  }

  async function handleTimeout() {
    if (!currentQuestion || isSubmittingAnswer || isComplete || isCompleting) return;
    setIsSubmittingAnswer(true);
    try {
    await goToNextQuestion(null, false);
    } finally {
      setIsSubmittingAnswer(false);
    }
  }

  async function handleSelectAnswer(answerIndex: number) {
    if (!currentQuestion || isSubmittingAnswer || isComplete) return;
    setErrorMessage('');
    setIsSubmittingAnswer(true);
    setSelectedAnswerIndex(answerIndex);
    try {
      const result = await submitAnswer({
        stageId,
        levelIndex: currentQuestion.levelIndex,
        answerIndex,
      }).unwrap();
      await goToNextQuestion(answerIndex, result.correct);
    } catch {
      setErrorMessage('Failed to submit answer. Check your connection and try again.');
      setSelectedAnswerIndex(null);
    } finally {
      setIsSubmittingAnswer(false);
    }
  }

  if (!sessionToken) {
    return null;
  }
  if (user.isGuest && user.signupRequired) {
    return <SignupRequiredGate />;
  }
  if (stagesLoading || questionsLoading) {
    return <div className="px-4 py-10 text-center text-gv-text-muted">Loading QUIZMO...</div>;
  }
  if (stagesError || questionsError || !stage || questions.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-red-400">QUIZMO content is unavailable right now.</p>
        <Link to="/" className="mt-4 inline-block text-gv-gold underline">
          Back to Machine
        </Link>
      </div>
    );
  }

  if (isComplete && summary) {
    const isGuestAtThreshold = user.isGuest && guestSignupRequired === true;
    return (
      <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-4 py-6 text-center">
        <h1 className="font-heading text-3xl font-bold text-gv-gold">QUIZ COMPLETE</h1>
        <p className="mt-2 text-gv-text-muted">
          Stage: {stage.title}
        </p>
        <p className="mt-4 text-lg text-gv-text">
          Score: <span className="font-bold text-gv-gold">{summary.correctCount}</span> /{' '}
          {summary.totalQuestions}
        </p>
        <p className="mt-2 text-xl font-bold text-gv-gold">+{summary.coinsEarned} Coins</p>
        <p className="mt-1 text-xs text-gv-text-muted">{summary.formula}</p>
        {errorMessage && <p className="mt-3 text-sm text-red-400">{errorMessage}</p>}
        {isGuestAtThreshold ? (
          <Link to="/signup" className="mt-6 rounded-full bg-gv-gold px-6 py-3 font-bold text-gv-bg">
            Sign up to continue playing
          </Link>
        ) : (
          <Link to="/" className="mt-6 rounded-full bg-gv-gold px-6 py-3 font-bold text-gv-bg">
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

  if (!currentQuestion) return null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-3xl flex-col gap-4 px-3 py-4 sm:px-4 sm:py-6">
      <div className="flex items-center justify-between">
        <Link to={`/game/${gameId ?? '14'}`} className="text-sm text-gv-text-muted hover:text-gv-gold">
          {'\u2190'} Back
        </Link>
        <h1 className="font-heading text-xl font-bold text-gv-gold">QUIZMO</h1>
        <span className="text-xs text-gv-text-muted">
          {currentQuestionIndex + 1}/{totalQuestions}
        </span>
      </div>

      <div className="rounded-xl border border-gv-border bg-gv-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-gv-text-muted">{stage.title}</p>
          <p className={`font-heading text-lg font-bold ${timeLeft <= 3 ? 'text-red-400' : 'text-gv-gold'}`}>
            {timeLeft}s
          </p>
        </div>

        <img
          src={toImageUrl(currentQuestion.imageUrl)}
          alt={`Question ${currentQuestion.levelIndex}`}
          className="mb-4 h-52 w-full rounded-lg border border-gv-border object-cover"
        />

        <h2 className="mb-4 text-lg font-semibold text-gv-text">{currentQuestion.question}</h2>

        <div className="grid gap-2">
          {currentQuestion.options.map((option, index) => (
            <button
              key={`${currentQuestion.levelIndex}-${index}`}
              type="button"
              disabled={isSubmittingAnswer || isCompleting}
              onClick={() => void handleSelectAnswer(index)}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                selectedAnswerIndex === index
                  ? 'border-gv-gold bg-gv-gold/15 text-gv-gold'
                  : 'border-gv-border bg-gv-bg text-gv-text hover:border-gv-gold/50'
              } disabled:opacity-60`}
            >
              {option}
            </button>
          ))}
        </div>

        {errorMessage && <p className="mt-3 text-sm text-red-400">{errorMessage}</p>}
      </div>

      <div className="rounded-lg border border-gv-border bg-gv-surface p-3 text-center text-xs text-gv-text-muted">
        AD PLACEHOLDER (QUIZMO IN-GAME BANNER)
      </div>
    </div>
  );
}
