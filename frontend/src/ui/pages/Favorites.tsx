import { GameCard } from '@/ui/components/GameCard';
import { useGetGamesQuery } from '@/store/apis/games.api';

export function Favorites() {
  const { data: games = [], isLoading } = useGetGamesQuery();
  const favoriteGames = games.slice(0, 3);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 flex items-center gap-3 font-heading text-2xl font-bold tracking-wider text-gv-text">
        <span className="text-pink-400">{'\u2661'}</span>
        MY FAVORITES
      </h1>

      {isLoading ? (
        <p className="text-gv-text-muted">Loading...</p>
      ) : favoriteGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center">
          <p className="text-gv-text-muted">No favorites yet. Start playing to add some!</p>
        </div>
      )}
    </div>
  );
}
