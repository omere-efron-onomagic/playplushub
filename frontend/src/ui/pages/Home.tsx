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
      <div className="mb-8 flex h-20 items-center justify-center rounded-xl border border-gv-border bg-gv-surface/50">
        <span className="text-sm tracking-[0.3em] text-gv-text-muted">AD SPACE</span>
      </div>

      {/* Title - above the machine */}
      <div className="mb-6 text-center">
        <h1 className="font-heading text-4xl font-black tracking-[0.25em] text-gv-gold drop-shadow-[0_0_30px_rgba(212,165,32,0.4)]">
          GAME VENDING MACHINE
        </h1>
        <p className="mt-2 text-sm italic tracking-widest text-gv-text-muted">
          Insert Coins to Play
        </p>
      </div>

      {/* Search & Filters - between title and machine */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gv-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full rounded-xl border border-gv-border bg-gv-surface py-2.5 pl-10 pr-4 text-sm text-gv-text placeholder-gv-text-muted outline-none transition-colors focus:border-gv-gold/50 focus:shadow-[0_0_12px_rgba(212,165,32,0.1)]"
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
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-gv-gold text-gv-bg shadow-md shadow-gv-gold/20'
                  : 'border border-gv-border bg-gv-surface text-gv-text-muted hover:border-gv-text/30 hover:text-gv-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ===== VENDING MACHINE ===== */}
      <div className="relative">
        {/* Animated outer glow */}
        <div className="animate-pulse-slow absolute -inset-[3px] rounded-[28px] bg-gradient-to-b from-gv-cyan/30 via-gv-cyan/10 to-gv-cyan/30 blur-md" />
        {/* Inner glow ring */}
        <div className="absolute -inset-px rounded-[26px] bg-gradient-to-b from-gv-cyan/25 via-transparent to-gv-cyan/25" />

        {/* Machine Body */}
        <div className="relative overflow-hidden rounded-3xl border border-gv-cyan/30 bg-gv-bg">
          {/* Top LED strip */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-gv-cyan/60 to-transparent" />

          {/* Side rails (left & right metallic strips) */}
          <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-gv-cyan/10 via-gv-surface to-gv-cyan/10" />
          <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-gv-cyan/10 via-gv-surface to-gv-cyan/10" />

          {/* Machine top decorative bar */}
          <div className="relative mx-4 mt-3 flex items-center justify-between px-4">
            <div className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gv-cyan/50 shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-gv-gold/50 shadow-[0_0_4px_rgba(212,165,32,0.5)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-gv-cyan/50 shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
            </div>
            <div className="h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-gv-border to-transparent" />
            <div className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gv-cyan/50 shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-gv-gold/50 shadow-[0_0_4px_rgba(212,165,32,0.5)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-gv-cyan/50 shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
            </div>
          </div>

          {/* Glass Display Area */}
          <div className="relative mx-5 mt-3 mb-4 rounded-2xl border border-gv-border/60 bg-gradient-to-b from-gv-surface/30 to-gv-bg p-5">
            {/* Glass reflection overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />
            <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-2xl bg-gradient-to-bl from-white/[0.02] to-transparent" />

            {/* Game Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {/* Empty State */}
            {paginatedGames.length === 0 && (
              <div className="flex h-48 items-center justify-center">
                <p className="font-heading text-sm tracking-wider text-gv-text-muted">
                  No games found
                </p>
              </div>
            )}
          </div>

          {/* Separator line */}
          <div className="mx-8 h-px bg-gradient-to-r from-transparent via-gv-border to-transparent" />

          {/* Machine Bottom - Pagination & Credits */}
          <div className="flex flex-col items-center gap-4 px-8 pt-5 pb-6">
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gv-border bg-gv-surface text-lg text-gv-text-muted transition-all hover:border-gv-text/30 hover:text-gv-text disabled:opacity-30"
                >
                  {'\u2039'}
                </button>
                <div className="flex gap-2.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`h-3 w-3 rounded-full transition-all ${
                        currentPage === i
                          ? 'bg-gv-gold shadow-[0_0_8px_rgba(212,165,32,0.5)]'
                          : 'bg-gv-text-muted/30 hover:bg-gv-text-muted/60'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gv-border bg-gv-surface text-lg text-gv-text-muted transition-all hover:border-gv-text/30 hover:text-gv-text disabled:opacity-30"
                >
                  {'\u203A'}
                </button>
              </div>
            )}

            {/* Credits Display */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gv-gold/20 blur-md" />
              <div className="relative rounded-full border border-gv-gold/50 bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-8 py-2.5 shadow-lg shadow-gv-gold/20">
                <span className="font-heading text-sm font-bold tracking-[0.2em] text-gv-bg">
                  CREDITS: 250
                </span>
              </div>
            </div>
          </div>

          {/* Bottom LED strip */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-gv-cyan/60 to-transparent" />
        </div>
      </div>

      {/* Bottom Ad Space */}
      <div className="mt-10 flex h-24 items-center justify-center rounded-xl border border-gv-border bg-gv-surface/50">
        <span className="text-sm tracking-[0.3em] text-gv-text-muted">AD SPACE</span>
      </div>
    </div>
  );
}
