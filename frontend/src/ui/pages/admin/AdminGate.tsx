import { Link, Outlet, useLocation } from 'react-router';

/** MVP: admin panel is open (no secret gate). Game-scoped content management. */
export function AdminGate() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-[calc(100vh-60px)]">
      <nav className="border-b border-gv-border bg-gv-surface/50 px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="font-heading text-lg font-bold text-gv-gold">
            Admin Panel
          </div>
          <div className="flex gap-4">
            <Link
              to="/admin/games"
              className={`text-sm font-medium ${
                isActive('/admin/games')
                  ? 'text-gv-gold'
                  : 'text-gv-text hover:text-gv-gold'
              }`}
            >
              Games
            </Link>
            <Link
              to="/admin/upload"
              className={`text-sm font-medium ${
                location.pathname === '/admin/upload'
                  ? 'text-gv-gold'
                  : 'text-gv-text hover:text-gv-gold'
              }`}
            >
              Assets
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
