import { Link, Outlet } from 'react-router';

/** MVP: admin panel is open (no secret gate). */
export function AdminGate() {
  return (
    <div className="min-h-[calc(100vh-60px)]">
      <nav className="border-b border-gv-border bg-gv-surface/50 px-4 py-3">
        <div className="flex gap-4">
          <Link to="/admin/games" className="text-sm font-medium text-gv-text hover:text-gv-gold">
            Games
          </Link>
          <Link to="/admin/levels" className="text-sm font-medium text-gv-text hover:text-gv-gold">
            Levels
          </Link>
          <Link to="/admin/upload" className="text-sm font-medium text-gv-text hover:text-gv-gold">
            Upload
          </Link>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
