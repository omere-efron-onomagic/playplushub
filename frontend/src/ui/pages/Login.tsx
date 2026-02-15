import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useLoginMutation } from '@/store/apis/auth.api';
import { setAuthenticatedUser } from '@/store/slices/user.slice';
import { useAppDispatch } from '@/store/hooks';

export function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await login({ email, password }).unwrap();
      dispatch(
        setAuthenticatedUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          coins: response.user.coins,
          token: response.token,
        }),
      );
      navigate('/');
    } catch {
      setErrorMessage('Invalid email or password');
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-gv-border bg-gv-surface/50 p-8"
      >
        <h1 className="mb-8 text-center font-heading text-2xl font-bold tracking-wider text-gv-gold">
          LOGIN
        </h1>

        <div className="space-y-5">
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
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark py-3 font-heading text-sm font-bold tracking-wider text-gv-bg transition-all hover:shadow-lg hover:shadow-gv-gold/20"
          >
            {isLoading ? 'ENTERING...' : 'ENTER THE VAULT'}
          </button>
        </div>

        {errorMessage && <p className="mt-4 text-center text-sm text-red-400">{errorMessage}</p>}

        <p className="mt-6 text-center text-sm text-gv-text-muted">
          New player?{' '}
          <Link to="/signup" className="font-medium text-gv-gold hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
