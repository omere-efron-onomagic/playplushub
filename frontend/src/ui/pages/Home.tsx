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
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
      {/* Ad Space - smaller on mobile */}
      <div className="mb-4 flex h-14 items-center justify-center rounded-xl border border-gv-border bg-gv-surface/50 sm:mb-8 sm:h-20">
        <span className="text-xs tracking-[0.2em] text-gv-text-muted sm:text-sm sm:tracking-[0.3em]">AD SPACE</span>
      </div>

      {/* Title - above the machine */}
      <div className="mb-4 text-center sm:mb-6">
        <h1 className="font-heading text-xl font-black tracking-[0.15em] text-gv-gold drop-shadow-[0_0_30px_rgba(212,165,32,0.4)] sm:text-3xl sm:tracking-[0.2em] lg:text-4xl lg:tracking-[0.25em]">
          GAME VENDING MACHINE
        </h1>
        <p className="mt-1 text-xs italic tracking-widest text-gv-text-muted sm:mt-2 sm:text-sm">
          Insert Coins to Play
        </p>
      </div>

      {/* Search & Filters - between title and machine */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full min-w-0 flex-1">
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
            className="min-h-[44px] w-full rounded-xl border border-gv-border bg-gv-surface py-2.5 pl-10 pr-4 text-base text-gv-text placeholder-gv-text-muted outline-none transition-colors focus:border-gv-gold/50 focus:shadow-[0_0_12px_rgba(212,165,32,0.1)] sm:min-h-0 sm:text-sm"
          />
        </div>
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(0);
              }}
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition-all min-h-[44px] sm:min-h-0 sm:py-1.5 ${
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
        <div className="animate-pulse-slow absolute -inset-[2px] rounded-[20px] bg-gradient-to-b from-gv-cyan/30 via-gv-cyan/10 to-gv-cyan/30 blur-md sm:-inset-[3px] sm:rounded-[28px]" />
        {/* Inner glow ring */}
        <div className="absolute -inset-px rounded-[18px] bg-gradient-to-b from-gv-cyan/25 via-transparent to-gv-cyan/25 sm:rounded-[26px]" />

        {/* Machine Body */}
        <div className="relative overflow-hidden rounded-2xl border border-gv-cyan/30 bg-gv-bg sm:rounded-3xl">
          {/* Top LED strip */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-gv-cyan/60 to-transparent" />

          {/* Side rails (left & right metallic strips) */}
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-gv-cyan/10 via-gv-surface to-gv-cyan/10 sm:w-2" />
          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-gv-cyan/10 via-gv-surface to-gv-cyan/10 sm:w-2" />

          {/* Machine top decorative bar */}
          <div className="relative mx-2 mt-2 flex items-center justify-between px-2 sm:mx-4 sm:mt-3 sm:px-4">
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
          <div className="relative mx-2 mt-2 mb-3 rounded-xl border border-gv-border/60 bg-gradient-to-b from-gv-surface/30 to-gv-bg p-3 sm:mx-5 sm:mt-3 sm:mb-4 sm:rounded-2xl sm:p-5">
            {/* Glass reflection overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.03] via-transparent to-transparent sm:rounded-2xl" />
            <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-xl bg-gradient-to-bl from-white/[0.02] to-transparent sm:rounded-2xl" />

            {/* Game Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gv-border to-transparent sm:mx-8" />

          {/* Machine Bottom - Pagination & Credits */}
          <div className="flex flex-col items-center gap-3 px-4 pt-4 pb-5 sm:gap-4 sm:px-8 sm:pt-5 sm:pb-6">
            {/* Pagination - larger touch targets on mobile */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-gv-border bg-gv-surface text-lg text-gv-text-muted transition-all hover:border-gv-text/30 hover:text-gv-text disabled:opacity-30 sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
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
                  className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-gv-border bg-gv-surface text-lg text-gv-text-muted transition-all hover:border-gv-text/30 hover:text-gv-text disabled:opacity-30 sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                >
                  {'\u203A'}
                </button>
              </div>
            )}

            {/* Credits Display */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gv-gold/20 blur-md" />
              <div className="relative rounded-full border border-gv-gold/50 bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-5 py-2 shadow-lg shadow-gv-gold/20 sm:px-8 sm:py-2.5">
                <span className="font-heading text-xs font-bold tracking-[0.15em] text-gv-bg sm:text-sm sm:tracking-[0.2em]">
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
      <div className="mt-6 flex h-16 items-center justify-center rounded-xl border border-gv-border bg-gv-surface/50 sm:mt-10 sm:h-24">
        <span className="text-xs tracking-[0.2em] text-gv-text-muted sm:text-sm sm:tracking-[0.3em]">AD SPACE</span>
      </div>
    </div>
  );
}
