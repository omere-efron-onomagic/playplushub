import type { Game } from '@/types/game.type';
import { Link } from 'react-router';

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      to={`/game/${game.id}`}
      className="group block overflow-hidden rounded-xl border border-gv-border bg-gv-surface transition-all hover:border-gv-gold/30 hover:shadow-lg hover:shadow-gv-gold/5 active:scale-[0.98] min-h-[44px] touch-manipulation"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* HOT badge - top left */}
        {game.isHot && (
          <span className="absolute top-2 left-2 rounded-md bg-gv-hot px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md sm:top-2.5 sm:left-2.5 sm:px-2.5">
            HOT
          </span>
        )}
        {/* PICK badge - top right */}
        {game.isPick && (
          <span className="absolute top-2 right-2 rounded-md bg-gv-pick px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-md sm:top-2.5 sm:right-2.5 sm:px-2.5">
            {'\u2B50'} PICK
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-3.5">
        <h3 className="line-clamp-2 font-semibold text-gv-text text-sm sm:text-base">{game.title}</h3>
        <p className="mt-0.5 text-xs text-gv-text-muted">{game.category}</p>

        {/* Stats Row */}
        <div className="mt-2 flex items-center justify-between gap-2 text-xs sm:mt-2.5">
          <span className="flex items-center gap-1 font-semibold text-gv-gold">
            {'\uD83E\uDE99'} {game.coinCost}
          </span>
          <span className="flex items-center gap-1 text-gv-text-muted">
            {'\u2B50'} {game.rating}
          </span>
          <span className="flex items-center gap-1 text-gv-text-muted">
            {'\uD83D\uDC65'} {game.players}
          </span>
        </div>
      </div>
    </Link>
  );
}
