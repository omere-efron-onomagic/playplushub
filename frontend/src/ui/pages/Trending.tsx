import { GameCard } from '@/ui/components/GameCard';
import { games } from '@/data/games';

// Match the design: Trending = 4 Pics 1 Word, Mystery Box, Neon Racer
const trendingIds = ['1', '3', '5'];
const trendingGames = games.filter((g) => trendingIds.includes(g.id));

// Match the design: Developer's Choice = Cooking Panic!, Neon Racer, Arena Clash
const devChoiceIds = ['2', '5', '7'];
const devChoiceGames = games.filter((g) => devChoiceIds.includes(g.id));

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
          {devChoiceGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
