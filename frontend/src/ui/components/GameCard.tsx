import type { Game } from '@/types/game.type';
import { Link } from 'react-router';

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      to={`/game/${game.id}`}
      className="group block overflow-hidden rounded-xl border border-gv-border bg-gv-surface transition-all hover:border-gv-gold/30 hover:shadow-lg hover:shadow-gv-gold/5"
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
          <span className="absolute top-2.5 left-2.5 rounded-md bg-gv-hot px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            HOT
          </span>
        )}
        {/* PICK badge - top right */}
        {game.isPick && (
          <span className="absolute top-2.5 right-2.5 rounded-md bg-gv-pick px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
            {'\u2B50'} PICK
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-semibold text-gv-text">{game.title}</h3>
        <p className="mt-0.5 text-xs text-gv-text-muted">{game.category}</p>

        {/* Stats Row */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
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
