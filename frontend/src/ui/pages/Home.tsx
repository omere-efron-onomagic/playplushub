import { GameCard } from '@/ui/components/GameCard';
import { games, categories } from '@/data/games';
import { useState } from 'react';
export function Home() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(0);
  const gamesPerPage = 6;

  const filtered = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / gamesPerPage);
  const paginatedGames = filtered.slice(
    currentPage * gamesPerPage,
    (currentPage + 1) * gamesPerPage
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Ad Space */}
      <div className="mb-8 flex h-20 items-center justify-center rounded-xl border border-gv-border bg-gv-surface">
        <span className="text-sm tracking-widest text-gv-text-muted">AD SPACE</span>
      </div>

      {/* Vending Machine Wrapper */}
      <div className="relative">
        {/* Machine Frame - outer glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-gv-cyan/20 via-gv-cyan/5 to-gv-cyan/20 blur-sm" />

        {/* Machine Body */}
        <div className="relative overflow-hidden rounded-3xl border border-gv-cyan/20 bg-gv-bg shadow-2xl shadow-gv-cyan/5">
          {/* Machine Top - Header with rivets */}
          <div className="relative border-b border-gv-cyan/10 bg-gradient-to-b from-gv-surface to-gv-bg px-8 pt-8 pb-6">
            {/* Decorative rivets */}
            <div className="absolute top-3 left-6 flex gap-3">
              <div className="h-2 w-2 rounded-full bg-gv-cyan/30" />
              <div className="h-2 w-2 rounded-full bg-gv-cyan/30" />
            </div>
            <div className="absolute top-3 right-6 flex gap-3">
              <div className="h-2 w-2 rounded-full bg-gv-cyan/30" />
              <div className="h-2 w-2 rounded-full bg-gv-cyan/30" />
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="font-heading text-3xl font-black tracking-[0.2em] text-gv-gold drop-shadow-[0_0_20px_rgba(212,165,32,0.3)]">
                GAME VENDING MACHINE
              </h1>
              <p className="mt-1 text-sm italic tracking-wider text-gv-text-muted">
                Insert Coins to Play
              </p>
            </div>
          </div>

          {/* Glass Display Area */}
          <div className="relative mx-6 mt-6 rounded-2xl border border-gv-border/50 bg-gradient-to-b from-gv-surface/50 to-gv-bg p-6">
            {/* Glass reflection effect */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />

            {/* Search & Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gv-text-muted">
                  {'\uD83D\uDD0D'}
                </span>
                <input
                  type="text"
                  placeholder="Search games..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="w-full rounded-lg border border-gv-border bg-gv-bg py-2 pl-9 pr-4 text-sm text-gv-text placeholder-gv-text-muted outline-none transition-colors focus:border-gv-gold/50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setCurrentPage(0);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-gv-gold text-gv-bg'
                        : 'border border-gv-border text-gv-text-muted hover:border-gv-text/30 hover:text-gv-text'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {/* Empty State */}
            {paginatedGames.length === 0 && (
              <div className="flex h-48 items-center justify-center">
                <p className="text-gv-text-muted">No games found</p>
              </div>
            )}
          </div>

          {/* Machine Bottom - Pagination & Coin Slot */}
          <div className="flex flex-col items-center gap-4 px-8 pt-6 pb-8">
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gv-border text-gv-text-muted transition-colors hover:border-gv-text/30 hover:text-gv-text disabled:opacity-30"
                >
                  {'\u2039'}
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`h-2.5 w-2.5 rounded-full transition-all ${
                        currentPage === i
                          ? 'scale-125 bg-gv-gold'
                          : 'bg-gv-text-muted/40 hover:bg-gv-text-muted'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gv-border text-gv-text-muted transition-colors hover:border-gv-text/30 hover:text-gv-text disabled:opacity-30"
                >
                  {'\u203A'}
                </button>
              </div>
            )}

            {/* Coin Slot / Credits Display */}
            <div className="flex items-center gap-2 rounded-full border border-gv-gold/40 bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-6 py-2 shadow-lg shadow-gv-gold/10">
              <span className="font-heading text-sm font-bold tracking-wider text-gv-bg">
                CREDITS: 250
              </span>
            </div>

            {/* Decorative coin slot */}
            <div className="flex flex-col items-center gap-1">
              <div className="h-1 w-12 rounded-full bg-gv-border" />
              <div className="h-6 w-3 rounded-full border border-gv-border bg-gv-surface" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ad Space */}
      <div className="mt-8 flex h-20 items-center justify-center rounded-xl border border-gv-border bg-gv-surface">
        <span className="text-sm tracking-widest text-gv-text-muted">AD SPACE</span>
      </div>
    </div>
  );
}
