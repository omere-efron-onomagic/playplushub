import { GameCard } from '@/ui/components/GameCard';
import { games } from '@/data/games';

// Simulated trending / developer picks
const trendingGames = games.filter((g) => g.badge === 'hot').slice(0, 3);
const devChoiceGames = games.filter((g) => g.badge === 'pick' || g.rating >= 4.5).slice(0, 3);

export function Trending() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Trending Now */}
      <section className="mb-12">
        <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-bold tracking-wider text-gv-text">
          <span className="text-pink-400">{'\uD83D\uDCC8'}</span>
          TRENDING NOW
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trendingGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Ad Space */}
      <div className="mb-12 flex h-20 items-center justify-center rounded-xl border border-gv-border bg-gv-surface">
        <span className="text-sm tracking-widest text-gv-text-muted">AD SPACE</span>
      </div>

      {/* Developer's Choice */}
      <section>
        <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-bold tracking-wider text-gv-text">
          <span className="text-gv-gold">{'\uD83C\uDFC6'}</span>
          DEVELOPER'S CHOICE
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {devChoiceGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
