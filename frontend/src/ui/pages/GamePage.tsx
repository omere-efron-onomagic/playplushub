import { games } from '@/data/games';
import { Link, useParams } from 'react-router';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = games.find((g) => g.id === gameId);

  if (!game) {
    return (
      <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center">
        <h1 className="font-heading text-4xl font-bold text-gv-gold">Game Not Found</h1>
        <Link
          to="/"
          className="mt-6 rounded-full border border-gv-gold bg-gv-gold/10 px-6 py-2 text-sm font-medium text-gv-gold transition-colors hover:bg-gv-gold/20"
        >
          Back to Machine
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gv-text-muted transition-colors hover:text-gv-gold"
      >
        <span>{'\u2190'}</span> Back to Machine
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gv-border bg-gv-surface">
        {/* Hero image */}
        <div className="relative aspect-[16/7] overflow-hidden">
          <img src={game.image} alt={game.title} className="h-full w-full object-cover" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gv-surface via-transparent to-transparent" />
          {/* Badges */}
          {game.isHot && (
            <span className="absolute top-4 left-4 rounded-md bg-gv-hot px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              HOT
            </span>
          )}
          {game.isPick && (
            <span className="absolute top-4 right-4 rounded-md bg-gv-pick px-3 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-md">
              {'\u2B50'} PICK
            </span>
          )}
        </div>

        {/* Game info */}
        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-wider text-gv-text">
                {game.title}
              </h1>
              <p className="mt-1 text-sm text-gv-text-muted">{game.category}</p>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-gv-border bg-gv-bg px-4 py-2 text-sm text-gv-text-muted">
                {'\u2B50'} {game.rating}
              </div>
              <div className="rounded-full border border-gv-border bg-gv-bg px-4 py-2 text-sm text-gv-text-muted">
                {'\uD83D\uDC65'} {game.players}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-gv-border" />

          {/* Cost and Play */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{'\uD83E\uDE99'}</span>
              <span className="font-heading text-xl font-bold text-gv-gold">
                {game.coinCost} Coins
              </span>
              <span className="text-sm text-gv-text-muted">to play</span>
            </div>

            <Link
              to={`/play/${game.id}`}
              className="rounded-xl bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-10 py-3 font-heading text-sm font-bold tracking-[0.2em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-105 hover:shadow-gv-gold/30"
            >
              PLAY NOW
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
