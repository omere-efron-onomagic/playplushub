import { useState } from 'react';
import { Link } from 'react-router';

export function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-gv-border bg-gv-surface/50 p-8"
      >
        <h1 className="mb-8 text-center font-heading text-2xl font-bold tracking-wider text-gv-gold">
          SIGN UP
        </h1>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm text-gv-text-muted">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gv-border bg-gv-bg px-4 py-2.5 text-sm text-gv-gold placeholder-gv-text-muted outline-none transition-colors focus:border-gv-gold/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-gv-text-muted">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gv-border bg-gv-bg px-4 py-2.5 text-sm text-gv-text placeholder-gv-text-muted outline-none transition-colors focus:border-gv-gold/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-gv-text-muted">Password</label>
            <input
              type="password"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gv-border bg-gv-bg px-4 py-2.5 text-sm text-gv-text placeholder-gv-text-muted outline-none transition-colors focus:border-gv-gold/50"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark py-3 font-heading text-sm font-bold tracking-wider text-gv-bg transition-all hover:shadow-lg hover:shadow-gv-gold/20"
          >
            CREATE ACCOUNT
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gv-text-muted">
          Already a player?{' '}
          <Link to="/login" className="font-medium text-gv-gold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
