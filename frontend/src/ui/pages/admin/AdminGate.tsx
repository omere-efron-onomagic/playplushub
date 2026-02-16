import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAdminSecret } from '@/store/slices/admin.slice';
import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router';

export function AdminGate() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stored = useAppSelector((s) => s.admin?.secret ?? '');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!secret.trim()) {
      setError('Enter admin secret');
      return;
    }
    dispatch(setAdminSecret(secret.trim()));
    setSecret('');
  };

  if (stored) {
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

  return (
    <div className="mx-auto flex min-h-[calc(100vh-60px)] max-w-md flex-col items-center justify-center px-4">
      <h1 className="font-heading text-xl font-bold tracking-wider text-gv-gold">
        Admin Panel
      </h1>
      <p className="mt-2 text-sm text-gv-text-muted">
        Enter admin secret to continue
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 w-full space-y-4 rounded-xl border border-gv-border bg-gv-surface p-6"
      >
        <div>
          <label htmlFor="secret" className="block text-xs text-gv-text-muted">
            Secret
          </label>
          <input
            id="secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            className="mt-1 w-full rounded-lg border border-gv-border bg-gv-bg px-3 py-2 text-gv-text outline-none focus:border-gv-gold/50"
            autoComplete="off"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-gv-gold px-4 py-2 font-medium text-gv-bg"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-gv-border px-4 py-2 text-gv-text-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
