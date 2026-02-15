import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gv-bg">
      <h1 className="font-heading text-6xl font-bold text-gv-gold">404</h1>
      <p className="mt-2 text-lg text-gv-text-muted">Page Not Found</p>
      <Link
        to="/"
        className="mt-6 rounded-full border border-gv-gold bg-gv-gold/10 px-6 py-2 text-sm font-medium text-gv-gold transition-colors hover:bg-gv-gold/20"
      >
        Back to Machine
      </Link>
    </div>
  );
}
