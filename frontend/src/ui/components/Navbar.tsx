import { Link, useLocation } from 'react-router';

const navLinks = [
  { to: '/', label: 'Machine', icon: null },
  { to: '/favorites', label: 'Favorites', icon: '\u2661' },
  { to: '/trending', label: 'Trending', icon: '\u2606' },
  { to: '/avatar-shop', label: 'Avatar Shop', icon: '\uD83D\uDCE6' }
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-gv-gold/20 bg-gv-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="font-heading text-xl font-bold tracking-wider text-gv-gold">
          GAME VAULT
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
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

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Coin Counter */}
          <div className="flex items-center gap-1.5 rounded-full border border-gv-gold/40 bg-gv-gold/10 px-4 py-1.5">
            <span className="text-sm">{'\uD83E\uDE99'}</span>
            <span className="font-heading text-sm font-bold text-gv-gold">250</span>
          </div>

          {/* Auth Buttons */}
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
        </div>
      </div>
    </nav>
  );
}
