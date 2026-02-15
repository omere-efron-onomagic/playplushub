import { Link } from 'react-router';

type Props = {
  onDismiss: () => void;
};

/** Soft sign-up prompt shown after guest win, dismissible. */
export function GuestSignupPrompt({ onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gv-border bg-gv-surface p-5 shadow-xl sm:p-6">
        <h3 className="font-heading text-lg font-bold tracking-wider text-gv-gold">
          Save your progress!
        </h3>
        <p className="mt-2 text-sm text-gv-text-muted">
          Create a free account to keep your coins and unlock more games.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            to="/signup"
            className="flex min-h-[44px] items-center justify-center rounded-lg bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark font-heading text-sm font-bold tracking-wider text-gv-bg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign up
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm text-gv-text-muted underline transition-colors hover:text-gv-text"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
