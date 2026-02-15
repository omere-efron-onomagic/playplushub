import type { Game } from '@/types/game.type';

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-xl border border-gv-border bg-gv-surface transition-all hover:border-gv-gold/30 hover:shadow-lg hover:shadow-gv-gold/5">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {game.badge === 'hot' && (
            <span className="rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              HOT
            </span>
          )}
          {game.badge === 'pick' && (
            <span className="rounded-md bg-yellow-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
              {'\u2B50'} PICK
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gv-text">{game.title}</h3>
        <p className="text-xs text-gv-text-muted">{game.category}</p>

        {/* Stats */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-gv-gold">
            {'\uD83E\uDE99'} <span className="font-bold">{game.coinCost}</span>
          </span>
          <span className="flex items-center gap-1 text-gv-text-muted">
            {'\u2B50'} {game.rating}
          </span>
          <span className="flex items-center gap-1 text-gv-text-muted">
            {'\uD83D\uDC65'} {game.players}
          </span>
        </div>
      </div>
    </div>
  );
}
