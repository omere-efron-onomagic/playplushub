import { GameCard } from '@/ui/components/GameCard';
import { useGetGamesQuery } from '@/store/apis/games.api';

const trendingIds = ['1', '3', '5'];
const devChoiceIds = ['2', '5', '7'];

export function Trending() {
  const { data: games = [], isLoading } = useGetGamesQuery();
  const trendingGames = games.filter((g) => trendingIds.includes(g.id));
  const devChoiceGames = games.filter((g) => devChoiceIds.includes(g.id));
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Trending Now */}
      <section className="mb-12">
        <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-bold tracking-wider text-gv-text">
          <span className="text-pink-400">{'\uD83D\uDCC8'}</span>
          TRENDING NOW
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="text-gv-text-muted">Loading...</p>
          ) : (
            trendingGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          )}
        </div>
      </section>

      {/* Ad Space */}
      <div className="mb-12 flex h-20 items-center justify-center rounded-xl border border-gv-border bg-gv-surface/50">
        <span className="text-sm tracking-[0.3em] text-gv-text-muted">AD SPACE</span>
      </div>

      {/* Developer's Choice */}
      <section>
        <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-bold tracking-wider text-gv-text">
          <span className="text-gv-gold">{'\uD83C\uDFC6'}</span>
          DEVELOPER&apos;S CHOICE
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="text-gv-text-muted">Loading...</p>
          ) : (
            devChoiceGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
