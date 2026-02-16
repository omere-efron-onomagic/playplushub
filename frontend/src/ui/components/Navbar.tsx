import { Link, useLocation } from 'react-router';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/user.slice';

const navLinks = [
  { to: '/', label: 'Machine', icon: null, showNav: 'hidden sm:flex', showMenu: 'sm:hidden' },
  { to: '/favorites', label: 'Favorites', icon: '\u2661', showNav: 'hidden md:flex', showMenu: 'md:hidden' },
  { to: '/trending', label: 'Trending', icon: '\u2606', showNav: 'hidden lg:flex', showMenu: 'lg:hidden' },
  { to: '/avatar-shop', label: 'Items', icon: '\uD83D\uDCE6', showNav: 'hidden xl:flex', showMenu: 'xl:hidden' }
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
        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 flex items-center rounded-lg border border-gv-gold/50 bg-gv-bg px-2.5 py-1 shadow-md sm:px-3.5 sm:py-1.5"
        >
          <span className="font-heading text-sm font-black tracking-wide text-white sm:text-base">PLAYPLUS</span>
          <span className="font-heading text-sm font-black tracking-wide text-gv-gold sm:text-base">HUB</span>
        </Link>

        {/* Nav Links - progressive visibility by breakpoint (disappear one by one on shrink) */}
        <div className="hidden min-w-0 flex-1 justify-center overflow-x-auto py-1 sm:flex">
          <div className="flex min-w-0 items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  className={`${link.showNav} items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
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
            <span className="font-heading text-xs font-bold text-gv-gold sm:text-sm" data-testid="navbar-coins">
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

          {/* Menu button - visible until all nav links are shown (xl) */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-gv-border bg-gv-surface text-gv-text xl:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? '\u2715' : '\u2630'}
          </button>
        </div>
      </div>

      {/* Dropdown menu - shows only the links hidden at the current breakpoint */}
      {mobileOpen && (
        <div className="border-t border-gv-border bg-gv-bg px-3 py-4 xl:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`${link.showMenu} min-h-[44px] items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors flex ${
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
            {/* Auth buttons - only in dropdown below sm where desktop auth is hidden */}
            <div className="mt-2 flex gap-2 border-t border-gv-border pt-3 sm:hidden">
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
