import { GameCard } from '@/ui/components/GameCard';
import { categories } from '@/data/games';
import { avatars } from '@/data/avatars';
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAppSelector } from '@/store/hooks';
import { useGetGamesQuery } from '@/store/apis/games.api';

const currentAvatar = avatars.find((a) => a.equipped) ?? avatars[0];

const PANEL_WIDTH = 300;
const EDGE_ZONE = 24;

export function Home() {
  const { data: games = [], isLoading } = useGetGamesQuery();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [displayCode, setDisplayCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelTranslate, setPanelTranslate] = useState(PANEL_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; startTranslate: number } | null>(null);
  const gamesPerPage = 6;

  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setDisplayCode('');
      setCodeError('');
    } else if (key === '✓') {
      const match = games.find((g) => g.vendingCode === displayCode);
      if (match) {
        setCodeError('');
        navigate(`/game/${match.id}`);
      } else {
        setCodeError('Invalid code');
      }
    } else if (displayCode.length < 4) {
      setCodeError('');
      setDisplayCode((prev) => prev + key);
    }
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
      const inEdgeZone = touch.clientX > screenWidth - EDGE_ZONE;
      const onPanel = isPanelOpen && touch.clientX > screenWidth - 280; // panel width
      if (inEdgeZone || onPanel) {
        touchStartRef.current = { x: touch.clientX, startTranslate: panelTranslate };
        setIsDragging(true);
      }
    },
    [isPanelOpen, panelTranslate]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const newTranslate = Math.max(0, Math.min(PANEL_WIDTH, touchStartRef.current.startTranslate + deltaX));
    setPanelTranslate(newTranslate);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    const threshold = PANEL_WIDTH / 2;
    setIsPanelOpen(panelTranslate < threshold);
    setPanelTranslate(panelTranslate < threshold ? 0 : PANEL_WIDTH);
    touchStartRef.current = null;
    setIsDragging(false);
  }, [panelTranslate]);

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

  const RightPanelContent = () => (
    <>
      <div className="relative w-full max-w-[12rem] md:max-w-none">
        <div className="absolute -inset-[2px] rounded-[18px] border-2 border-gv-gold/60" />
        <div className="absolute -inset-[5px] rounded-[20px] border border-gv-gold/40" />
        <div className="relative flex flex-col gap-2 rounded-2xl border border-gv-border/50 bg-gradient-to-b from-gv-surface/80 to-gv-bg p-2 shadow-inner sm:gap-3 sm:p-3">
          <p className="text-center text-[10px] font-medium uppercase tracking-widest text-gv-text-muted">
            select code
          </p>
          <div className="rounded-lg border border-gv-border bg-gv-bg px-2 py-1.5 font-mono text-base font-bold tracking-[0.2em] text-gv-gold shadow-inner sm:px-3 sm:py-2 sm:text-lg sm:tracking-[0.3em]">
            {displayCode || '____'}
          </div>
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => {
              const isConfirm = key === '✓';
              const confirmReady = isConfirm && displayCode.length === 4;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  disabled={isConfirm && !confirmReady}
                  className={`flex h-8 w-full min-h-[44px] items-center justify-center rounded-md border font-mono text-xs font-medium transition-all active:scale-95 sm:h-9 sm:min-h-0 sm:text-sm ${
                    key === 'C'
                      ? 'border-gv-hot/40 bg-gv-hot/10 text-gv-hot hover:bg-gv-hot/20'
                      : isConfirm
                        ? confirmReady
                          ? 'border-green-500/60 bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'cursor-default border-gv-border/50 bg-gv-surface/50 text-gv-text-muted opacity-60'
                        : 'border-gv-border bg-gv-surface text-gv-text hover:border-gv-gold/40 hover:bg-gv-surface/90'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
          {codeError && (
            <p className="text-center text-[10px] font-medium text-red-400">{codeError}</p>
          )}
        </div>
      </div>
      <div className="relative w-full max-w-[12rem] md:max-w-none">
        <div className="absolute -inset-[2px] rounded-[18px] border-2 border-gv-gold/60" />
        <div className="absolute -inset-[5px] rounded-[20px] border border-gv-gold/40" />
        <div className="relative flex min-h-[200px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-gv-border/50 bg-gv-bg p-2 shadow-inner sm:min-h-[300px] sm:min-w-[164px] sm:p-3">
          <img
            src={user.isGuest ? '/avatars-duo.png' : currentAvatar.image}
            alt={user.isGuest ? 'Choose your avatar' : currentAvatar.name}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <p className="relative z-10 text-center text-[9px] font-medium uppercase tracking-widest text-gv-text-muted sm:text-[10px]">
            {user.isGuest ? 'choose avatar' : 'my avatar'}
          </p>
          <p className="relative z-10 text-center text-[11px] font-medium text-gv-text sm:text-xs">
            {user.isGuest ? 'Sign up to pick' : currentAvatar.name}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="relative min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Mobile: edge trigger - tap to open panel */}
      {!isPanelOpen && panelTranslate >= PANEL_WIDTH && (
        <button
          type="button"
          onClick={() => {
            setIsPanelOpen(true);
            setPanelTranslate(0);
          }}
          className="fixed right-0 top-1/2 z-30 flex h-16 w-8 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-gv-gold/50 bg-gv-surface/95 shadow-lg md:hidden"
          aria-label="Open keypad and avatar"
        >
          <span className="text-gv-gold text-lg">‹</span>
        </button>
      )}

      {/* Mobile: backdrop when panel open */}
      {(isPanelOpen || panelTranslate < PANEL_WIDTH) && (
        <button
          type="button"
          onClick={() => {
            setIsPanelOpen(false);
            setPanelTranslate(PANEL_WIDTH);
          }}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close panel"
        />
      )}

      {/* Mobile: sliding panel - pull from right to reveal */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(85vw,280px)] flex-col items-center gap-4 overflow-y-auto border-l border-gv-border bg-gv-bg p-4 pt-16 shadow-xl md:hidden ${isDragging ? '' : 'transition-transform duration-200 ease-out'}`}
        style={{ transform: `translateX(${panelTranslate}px)` }}
      >
        <RightPanelContent />
      </div>

      <div className="mx-auto max-w-6xl overflow-x-hidden px-3 py-4 sm:px-4 sm:py-8">
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
        {/* Yellow strips frame around machine */}
        <div className="absolute -inset-[2px] rounded-[18px] border-2 border-gv-gold/60 sm:-inset-[3px] sm:rounded-[26px]" />
        <div className="absolute -inset-[6px] rounded-[22px] border border-gv-gold/40 sm:-inset-[10px] sm:rounded-[30px]" />

        {/* Machine Body */}
        <div className="relative overflow-hidden rounded-2xl border border-gv-border bg-gv-bg sm:rounded-3xl">
          {/* Top LED strip */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-gv-gold/40 to-transparent" />

          {/* Machine top decorative bar */}
          <div className="relative mx-2 mt-2 flex items-center justify-between px-2 sm:mx-4 sm:mt-3 sm:px-4">
            <div className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gv-gold/50 shadow-[0_0_4px_rgba(212,165,32,0.5)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-gv-gold/50 shadow-[0_0_4px_rgba(212,165,32,0.5)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-gv-gold/50 shadow-[0_0_4px_rgba(212,165,32,0.5)]" />
            </div>
            <div className="h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-gv-border to-transparent" />
            <div className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gv-gold/50 shadow-[0_0_4px_rgba(212,165,32,0.5)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-gv-gold/50 shadow-[0_0_4px_rgba(212,165,32,0.5)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-gv-gold/50 shadow-[0_0_4px_rgba(212,165,32,0.5)]" />
            </div>
          </div>

          {/* Main Content + Right Panel */}
          <div className="mx-2 mt-2 mb-3 flex flex-col gap-4 sm:mx-5 sm:mt-3 sm:mb-4 md:flex-row">
            {/* Glass Display Area - Games */}
            <div className="relative min-w-0 flex-1 rounded-xl border border-gv-border/60 bg-gradient-to-b from-gv-surface/30 to-gv-bg p-3 sm:rounded-2xl sm:p-5">
              {/* Glass reflection overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.03] via-transparent to-transparent sm:rounded-2xl" />
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-xl bg-gradient-to-bl from-white/[0.02] to-transparent sm:rounded-2xl" />

            {/* Game Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {paginatedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {/* Loading / Empty State */}
            {isLoading && (
              <div className="flex h-48 items-center justify-center">
                <p className="font-heading text-sm tracking-wider text-gv-text-muted">
                  Loading...
                </p>
              </div>
            )}
            {!isLoading && paginatedGames.length === 0 && (
              <div className="flex h-48 items-center justify-center">
                <p className="font-heading text-sm tracking-wider text-gv-text-muted">
                  No games found
                </p>
              </div>
            )}
            </div>

            {/* Right Panel - Vending Machine Interface (hidden on mobile, shown in sliding overlay) */}
            <div className="hidden w-full flex-shrink-0 flex-col items-center gap-4 md:flex md:w-fit md:items-stretch md:self-start">
              <RightPanelContent />
            </div>
          </div>

          {/* Separator line */}
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gv-border to-transparent sm:mx-8" />

          {/* Machine Bottom - Pagination */}
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

          </div>

        </div>
      </div>

      {/* Bottom Ad Space */}
      <div className="mt-6 flex h-16 items-center justify-center rounded-xl border border-gv-border bg-gv-surface/50 sm:mt-10 sm:h-24">
        <span className="text-xs tracking-[0.2em] text-gv-text-muted sm:text-sm sm:tracking-[0.3em]">AD SPACE</span>
      </div>
      </div>
    </div>
  );
}
