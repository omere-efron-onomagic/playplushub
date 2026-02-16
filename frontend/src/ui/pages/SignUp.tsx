import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRegisterMutation, useMigrateGuestMutation } from '@/store/apis/auth.api';
import { setAuthenticatedUser, setCoins, clearGuestToken } from '@/store/slices/user.slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function SignUp() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const guestToken = useAppSelector((s) => s.user.guestToken);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<'boy' | 'girl' | null>(() => {
    const saved = localStorage.getItem('guest-avatar-choice');
    return saved === 'boy' || saved === 'girl' ? saved : null;
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const [migrateGuest] = useMigrateGuestMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await register({ name: username, email, password }).unwrap();
      dispatch(
        setAuthenticatedUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          coins: response.user.coins,
          token: response.token,
        }),
      );

      // Trigger guest-to-account migration if a guest token exists
      if (guestToken) {
        try {
          const migration = await migrateGuest({ guestToken }).unwrap();
          if (migration.migrationStatus === 'applied' && migration.coinsTransferred > 0) {
            dispatch(setCoins(response.user.coins + migration.coinsTransferred));
          }
        } catch {
          // Migration failure is non-blocking; user is already authenticated
        }
        dispatch(clearGuestToken());
      }

      navigate('/');
    } catch {
      setErrorMessage('Could not create account');
    }
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
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gv-border bg-gv-bg px-4 py-2.5 text-sm text-gv-text placeholder-gv-text-muted outline-none transition-colors focus:border-gv-gold/50"
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="mb-3 block text-sm text-gv-text-muted">Choose your Avatar</label>
            <div className="flex justify-center gap-4">
              {([
                { id: 'boy' as const, src: '/avatar-boy.png', label: 'Boy' },
                { id: 'girl' as const, src: '/avatar-girl.png', label: 'Girl' },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAvatar(opt.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-2 transition-all ${avatar === opt.id
                      ? 'scale-105 ring-2 ring-gv-gold shadow-lg shadow-gv-gold/20'
                      : avatar === null
                        ? 'opacity-60 hover:scale-105 hover:ring-2 hover:ring-gv-gold hover:shadow-lg hover:shadow-gv-gold/20 hover:opacity-100'
                        : 'opacity-40'
                    }`}
                >
                  <div className="h-36 w-28 overflow-hidden rounded-xl border-2 border-gv-gold/40 bg-gv-bg">
                    <img
                      src={opt.src}
                      alt={opt.label}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <span className={`text-xs font-bold ${avatar === opt.id ? 'text-gv-gold' : 'text-gv-text-muted'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark py-3 font-heading text-sm font-bold tracking-wider text-gv-bg transition-all hover:shadow-lg hover:shadow-gv-gold/20"
          >
            {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </div>

        {errorMessage && <p className="mt-4 text-center text-sm text-red-400">{errorMessage}</p>}

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
