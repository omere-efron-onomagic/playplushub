import { Link, useLocation } from 'react-router';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/user.slice';

const navLinks = [
  { to: '/', label: 'Machine', icon: null },
  { to: '/favorites', label: 'Favorites', icon: '\u2661' },
  { to: '/trending', label: 'Trending', icon: '\u2606' },
  { to: '/avatar-shop', label: 'Avatar Shop', icon: '\uD83D\uDCE6' }
];

export function Navbar() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAppSelector((state) => state.user);
  const avatarInitial = user.name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <nav className="sticky top-0 z-50 border-b border-gv-gold/20 bg-gv-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-3">
        {/* Logo - shrink on mobile */}
        <Link
          to="/"
          className="shrink-0 font-heading text-base font-bold tracking-wider text-gv-gold sm:text-xl"
        >
          GAME VAULT
        </Link>

        {/* Nav Links - hidden on small mobile, visible from sm */}
        <div className="hidden flex-1 justify-center overflow-x-auto py-1 sm:flex">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:flex sm:items-center sm:gap-1.5 sm:px-4 sm:text-sm ${
                    isActive
                      ? 'border border-gv-gold/60 bg-gv-gold/10 text-gv-gold'
                      : 'text-gv-text-muted hover:text-gv-text'
                  }`}
                >
                  {link.icon && <span className="text-xs">{link.icon}</span>}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: coins + desktop auth / mobile menu button */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 rounded-full border border-gv-gold/40 bg-gv-gold/10 px-2.5 py-1.5 sm:gap-1.5 sm:px-4">
            <span className="text-xs sm:text-sm">{'\uD83E\uDE99'}</span>
            <span className="font-heading text-xs font-bold text-gv-gold sm:text-sm">
              {user.coins}
            </span>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-3">
            {user.isGuest ? (
              <>
                <Link
                  to="/login"
                  className="rounded-full bg-gv-surface px-5 py-1.5 text-sm font-medium text-gv-text transition-colors hover:bg-gv-card"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full border border-gv-gold bg-gv-gold px-5 py-1.5 text-sm font-bold text-gv-bg transition-colors hover:bg-gv-gold-light"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gv-gold/60 bg-gv-gold/10 font-heading text-xs font-bold text-gv-gold"
                  title={user.name}
                >
                  {avatarInitial}
                </div>
                <button
                  type="button"
                  onClick={() => dispatch(logout())}
                  className="rounded-full bg-gv-surface px-5 py-1.5 text-sm font-medium text-gv-text transition-colors hover:bg-gv-card"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button (shown when nav links hidden) */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-gv-border bg-gv-surface text-gv-text sm:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? '\u2715' : '\u2630'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-gv-border bg-gv-bg px-3 py-4 sm:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gv-gold/10 text-gv-gold'
                      : 'text-gv-text hover:bg-gv-surface'
                  }`}
                >
                  {link.icon && <span>{link.icon}</span>}
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 flex gap-2 border-t border-gv-border pt-3">
              {user.isGuest ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="min-h-[44px] flex-1 rounded-xl bg-gv-surface px-4 py-3 text-center text-sm font-medium text-gv-text"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="min-h-[44px] flex-1 rounded-xl border border-gv-gold bg-gv-gold px-4 py-3 text-center text-sm font-bold text-gv-bg"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(logout());
                    setMobileOpen(false);
                  }}
                  className="min-h-[44px] w-full rounded-xl bg-gv-surface px-4 py-3 text-center text-sm font-medium text-gv-text"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
