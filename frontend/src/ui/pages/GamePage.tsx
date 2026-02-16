import { useGetGameQuery, useGetGameRoundsQuery, useGetGameProgressQuery } from '@/store/apis/games.api';
import { useStartGameSessionMutation } from '@/store/apis/wallet.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCoins } from '@/store/slices/user.slice';
import { Link, useNavigate, useParams } from 'react-router';

export function GamePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isGuest, signupRequired, coins } = useAppSelector((s) => s.user);
  const [startSession, { isLoading: isStarting, error: startError }] = useStartGameSessionMutation();
  const { gameId } = useParams<{ gameId: string }>();
  const { data: game, isLoading } = useGetGameQuery(gameId ?? '', { skip: !gameId });
  const { data: rounds = [] } = useGetGameRoundsQuery(gameId ?? '', {
    skip: !gameId || !game?.totalRounds,
  });
  const { data: completedRoundIds = [] } = useGetGameProgressQuery(gameId ?? '', {
    skip: !gameId || !game?.totalRounds,
  });

  const handlePlayClick = (roundId?: string) => {
    if (!game) return;
    void (async () => {
      try {
        const payload = roundId ? { gameId: game.id, roundId } : { gameId: game.id };
        const res = await startSession(payload).unwrap();
        dispatch(setCoins(res.coins));
        navigate(`/play/${game.id}`, {
          state: { sessionToken: res.sessionToken, sessionId: res.sessionId, roundId },
        });
      } catch {
        // Error shown via startError
      }
    })();
  };

  if (!gameId) return null;
  if (!game && !isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center">
        <h1 className="font-heading text-4xl font-bold text-gv-gold">Game Not Found</h1>
        <Link to="/" className="mt-6 rounded-full border border-gv-gold bg-gv-gold/10 px-6 py-2 text-sm font-medium text-gv-gold">
          Back to Machine
        </Link>
      </div>
    );
  }
  if (isLoading || !game) {
    return (
      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center">
        <p className="font-heading text-gv-text-muted">Loading...</p>
      </div>
    );
  }

  const canAfford = coins >= game.coinCost;
  const errData = startError && 'data' in startError ? (startError.data as { code?: string }) : null;
  const showInsufficientFunds = errData?.code === 'INSUFFICIENT_FUNDS';
  const showRoundCompleted = errData?.code === 'ROUND_ALREADY_COMPLETED';
  const isRoundBased = !!game.totalRounds;
  const roundsLoading = isRoundBased && rounds.length === 0;
  const allRoundsComplete = isRoundBased && completedRoundIds.length >= (game.totalRounds ?? 0);

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
      <Link to="/" className="mb-4 inline-flex min-h-[44px] items-center gap-2 py-2 text-sm text-gv-text-muted transition-colors hover:text-gv-gold sm:mb-6 sm:min-h-0">
        <span>{'\u2190'}</span> Back to Machine
      </Link>

      <div className="overflow-hidden rounded-xl border border-gv-border bg-gv-surface sm:rounded-2xl">
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/7]">
          <img src={game.image} alt={game.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gv-surface via-transparent to-transparent" />
          {game.isHot && (
            <span className="absolute top-3 left-3 rounded-md bg-gv-hot px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:top-4 sm:left-4 sm:px-3 sm:text-xs">
              HOT
            </span>
          )}
          {game.isPick && (
            <span className="absolute top-3 right-3 rounded-md bg-gv-pick px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black sm:top-4 sm:right-4 sm:px-3 sm:text-xs">
              {'\u2B50'} PICK
            </span>
          )}
        </div>

        <div className="p-4 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div>
              <h1 className="font-heading text-xl font-bold tracking-wider text-gv-text sm:text-3xl">
                {game.title}
              </h1>
              <p className="mt-1 text-sm text-gv-text-muted">{game.category}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="rounded-full border border-gv-border bg-gv-bg px-3 py-1.5 text-xs text-gv-text-muted sm:px-4 sm:py-2 sm:text-sm">
                {'\u2B50'} {game.rating}
              </div>
              <div className="rounded-full border border-gv-border bg-gv-bg px-3 py-1.5 text-xs text-gv-text-muted sm:px-4 sm:py-2 sm:text-sm">
                {'\uD83D\uDC65'} {game.players}
              </div>
            </div>
          </div>

          <div className="my-4 h-px bg-gv-border sm:my-6" />

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">{'\uD83E\uDE99'}</span>
              <span className="font-heading text-lg font-bold text-gv-gold sm:text-xl">
                {game.coinCost} Coins
              </span>
              <span className="text-xs text-gv-text-muted sm:text-sm">per round</span>
            </div>

            {isGuest && signupRequired ? (
              <Link
                to="/signup"
                className="flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-8 py-3 font-heading text-sm font-bold tracking-[0.2em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-105 hover:shadow-gv-gold/30 active:scale-[0.98] touch-manipulation sm:min-h-0"
              >
                Sign up to play
              </Link>
            ) : (
              <>
                {showInsufficientFunds && (
                  <p className="w-full text-sm text-red-400">Not enough coins. You need {game.coinCost} to play.</p>
                )}
                {showRoundCompleted && (
                  <p className="w-full text-sm text-red-400">You already completed this round.</p>
                )}
                {roundsLoading ? (
                  <p className="w-full text-sm text-gv-text-muted">Loading rounds...</p>
                ) : allRoundsComplete ? (
                  <p className="w-full text-sm text-gv-text-muted">
                    All rounds completed. Check back for new content!
                  </p>
                ) : isRoundBased && rounds.length > 0 ? (
                  <div className="w-full space-y-2">
                    <p className="text-xs text-gv-text-muted">Pick a round</p>
                    <div className="flex flex-wrap gap-2">
                      {rounds.map((r) => {
                        const done = completedRoundIds.includes(r.roundId);
                        const canPlay = canAfford && !done && !isStarting;
                        return (
                          <button
                            key={r.roundId}
                            type="button"
                            disabled={!canPlay}
                            onClick={() => handlePlayClick(r.roundId)}
                            data-testid={done ? undefined : 'game-play-now'}
                            className={`rounded-lg px-4 py-2 text-sm font-medium ${
                              done
                                ? 'border border-gv-border bg-gv-bg text-gv-text-muted'
                                : canPlay
                                  ? 'bg-gv-gold text-gv-bg'
                                  : 'border border-gv-border bg-gv-surface text-gv-text-muted opacity-50'
                            }`}
                          >
                            {r.roundId} {done ? '(done)' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : isRoundBased && rounds.length === 0 ? (
                  <p className="w-full text-sm text-gv-text-muted">No rounds available yet.</p>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford || isStarting}
                    onClick={() => handlePlayClick()}
                    data-testid="game-play-now"
                    className="flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-8 py-3 font-heading text-sm font-bold tracking-[0.2em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-105 hover:shadow-gv-gold/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation sm:min-h-0"
                  >
                    {isStarting ? 'Starting...' : 'PLAY NOW'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
