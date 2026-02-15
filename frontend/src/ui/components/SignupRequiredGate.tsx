import { Link } from 'react-router';

/** Full-page gate shown when a guest must sign up to continue (after 5 prompts). */
export function SignupRequiredGate() {
  return (
    <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-4 py-6">
      <div className="text-center">
        <div className="mb-3 text-5xl sm:mb-4 sm:text-6xl">{'\uD83D\uDE4B'}</div>
        <h1 className="font-heading text-2xl font-bold tracking-wider text-gv-gold sm:text-4xl">
          Sign up to continue
        </h1>
        <p className="mt-2 text-base text-gv-text-muted sm:mt-3 sm:text-lg">
          Create a free account to keep playing and save your progress.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
          <Link
            to="/signup"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-6 py-3 font-heading text-sm font-bold tracking-[0.2em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-105 active:scale-[0.98] touch-manipulation sm:px-8"
          >
            Create account
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-gv-gold bg-transparent px-6 py-3 font-heading text-sm font-bold tracking-[0.2em] text-gv-gold transition-all hover:bg-gv-gold/10 touch-manipulation sm:px-8"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
