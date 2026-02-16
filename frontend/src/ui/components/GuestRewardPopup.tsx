import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

type Props = {
  gameId: string;
  onContinuePlay: () => void;
};

const FIREWORK_COLORS = [
  '#d4a520', '#f0c850', '#ef4444', '#06b6d4', '#a855f7',
  '#22c55e', '#f97316', '#ec4899', '#facc15', '#3b82f6',
];

function FireworkParticle({ color, delay, angle }: { color: string; delay: number; angle: number }) {
  const distance = 40 + Math.random() * 50;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;

  return (
    <div
      className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full animate-firework-spread"
      style={{
        backgroundColor: color,
        '--fw-translate': `translate(${x}px, ${y}px)`,
        animationDelay: `${delay}ms`,
        boxShadow: `0 0 6px ${color}`,
      } as React.CSSProperties}
    />
  );
}

function Fireworks() {
  const bursts = [
    { cx: '20%', cy: '25%', delay: 0 },
    { cx: '80%', cy: '20%', delay: 300 },
    { cx: '50%', cy: '15%', delay: 600 },
    { cx: '30%', cy: '35%', delay: 900 },
    { cx: '70%', cy: '30%', delay: 500 },
    { cx: '15%', cy: '50%', delay: 1100 },
    { cx: '85%', cy: '45%', delay: 800 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bursts.map((burst, bi) =>
        Array.from({ length: 10 }).map((_, pi) => (
          <div
            key={`${bi}-${pi}`}
            className="absolute"
            style={{ left: burst.cx, top: burst.cy }}
          >
            <FireworkParticle
              color={FIREWORK_COLORS[(bi + pi) % FIREWORK_COLORS.length]}
              delay={burst.delay + pi * 50}
              angle={(360 / 10) * pi}
            />
          </div>
        )),
      )}
    </div>
  );
}

const AVATAR_OPTIONS = [
  { id: 'boy' as const, src: '/avatar-boy.png', label: 'Boy' },
  { id: 'girl' as const, src: '/avatar-girl.png', label: 'Girl' },
];

type PopupStep = 'reward' | 'choose-avatar' | 'evolve' | 'auth-choice' | 'guest-choice';

export function GuestRewardPopup({ gameId, onContinuePlay }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<PopupStep>('reward');

  // reward step animation states
  const [showLevel, setShowLevel] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showChooseBtn, setShowChooseBtn] = useState(false);
  const [levelNum, setLevelNum] = useState(1);

  // avatar choice
  const [selectedAvatar, setSelectedAvatar] = useState<'boy' | 'girl' | null>(null);

  // evolve step animation states
  const [evolvePhase, setEvolvePhase] = useState<'lv1' | 'glow' | 'lv2' | 'done'>('lv1');

  // Step 1 (reward) timers
  useEffect(() => {
    if (step !== 'reward') return;
    const t1 = setTimeout(() => setShowLevel(true), 400);
    const t2 = setTimeout(() => setLevelNum(2), 1000);
    const t3 = setTimeout(() => setShowRewards(true), 1600);
    const t4 = setTimeout(() => setShowChooseBtn(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [step]);

  // Step 3 (evolve) animation sequence
  useEffect(() => {
    if (step !== 'evolve') return;
    setEvolvePhase('lv1');
    const t1 = setTimeout(() => setEvolvePhase('glow'), 800);
    const t2 = setTimeout(() => setEvolvePhase('lv2'), 1600);
    const t3 = setTimeout(() => setEvolvePhase('done'), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [step]);

  function handleAvatarSelect(avatar: 'boy' | 'girl') {
    setSelectedAvatar(avatar);
  }

  function handleAcceptRewards() {
    if (!selectedAvatar) return;
    localStorage.setItem('guest-avatar-choice', selectedAvatar);
    setStep('evolve');
  }

  // ──────── Step 5: Guest Choice ────────
  if (step === 'guest-choice') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gv-gold/30 bg-gv-surface shadow-2xl">
          <div className="p-6 text-center">
            <div className="mb-2 text-4xl">{'\uD83C\uDFAE'}</div>
            <h3 className="font-heading text-lg font-bold tracking-wider text-gv-text">
              What next?
            </h3>
            <p className="mt-1 text-sm text-gv-text-muted">
              Rewards are waiting when you sign up!
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={onContinuePlay}
                className="flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-6 py-3 font-heading text-sm font-bold tracking-[0.15em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                CONTINUE PLAYING
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex min-h-[48px] items-center justify-center rounded-xl border border-gv-border bg-gv-bg px-6 py-3 text-sm font-medium text-gv-text transition-all hover:border-gv-gold/40 hover:text-gv-gold active:scale-[0.98]"
              >
                MORE GAMES
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────── Step 4: Auth Choice ────────
  if (step === 'auth-choice') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gv-gold/40 bg-gv-surface shadow-2xl shadow-gv-gold/10">
          <div className="flex flex-col items-center gap-1 bg-gradient-to-b from-gv-gold/10 to-transparent px-6 pt-8 pb-4">
            <div className="mb-1 h-20 w-16 overflow-hidden rounded-xl border-2 border-gv-gold/50">
              <img
                src={selectedAvatar === 'girl' ? '/avatar-girl-lv2.png' : '/avatar-boy-lv2.png'}
                alt="Your avatar"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <p className="font-heading text-xs font-bold text-gv-gold">LV 2</p>
          </div>

          <div className="flex flex-col gap-2.5 px-6 pt-2 pb-6">
            <p className="text-center text-sm text-gv-text">
              Sign in to keep your rewards & progress!
            </p>
            <Link
              to="/login"
              className="flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-6 py-3 font-heading text-sm font-bold tracking-[0.15em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              LOG IN
            </Link>
            <Link
              to="/signup"
              className="flex min-h-[48px] items-center justify-center rounded-xl border-2 border-gv-gold bg-gv-gold/10 px-6 py-3 font-heading text-sm font-bold tracking-[0.15em] text-gv-gold transition-all hover:bg-gv-gold/20 hover:scale-[1.03] active:scale-[0.98]"
            >
              SIGN UP
            </Link>
            <button
              type="button"
              onClick={() => setStep('guest-choice')}
              className="mt-1 text-sm text-gv-text-muted underline transition-colors hover:text-gv-text"
            >
              Continue as guest
            </button>
            <p className="text-center text-[10px] text-gv-text-muted/60">
              Guest rewards won&apos;t be saved
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ──────── Step 3: Evolve Animation ────────
  if (step === 'evolve') {
    const avatarLv1 = selectedAvatar === 'girl' ? '/avatar-girl.png' : '/avatar-boy.png';
    const avatarLv2 = selectedAvatar === 'girl' ? '/avatar-girl-lv2.png' : '/avatar-boy-lv2.png';
    const isGlowing = evolvePhase === 'glow' || evolvePhase === 'lv2';
    const showLv2 = evolvePhase === 'lv2' || evolvePhase === 'done';
    const showAwesome = evolvePhase === 'done';
    const currentAvatarSrc = showLv2 ? avatarLv2 : avatarLv1;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <Fireworks />
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gv-gold/40 bg-gv-surface shadow-2xl shadow-gv-gold/10">
          <div className="flex flex-col items-center px-6 pt-8 pb-6">
            {/* Avatar with evolve glow */}
            <div
              className={`relative mb-4 transition-all duration-700 ${isGlowing ? 'scale-110' : 'scale-100'}`}
            >
              {isGlowing && (
                <div className="absolute -inset-3 animate-pulse rounded-2xl bg-gv-gold/30 blur-xl" />
              )}
              <div
                className={`relative h-52 w-40 overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                  showLv2
                    ? 'border-gv-gold shadow-[0_0_30px_rgba(212,165,32,0.5)]'
                    : 'border-gv-gold/40'
                }`}
              >
                <img
                  src={currentAvatarSrc}
                  alt="Your avatar"
                  className="h-full w-full object-cover object-top"
                />
                {/* Level badge overlay */}
                <div
                  className={`absolute bottom-0 left-0 right-0 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent py-3 transition-all duration-500`}
                >
                  <span
                    className={`font-heading text-2xl font-black transition-all duration-500 ${
                      showLv2
                        ? 'text-gv-gold drop-shadow-[0_0_12px_rgba(212,165,32,0.8)] animate-level-count'
                        : 'text-gv-text-muted'
                    }`}
                  >
                    {showLv2 ? 'LV 2' : 'LV 1'}
                  </span>
                </div>
              </div>
            </div>

            {showLv2 && !showAwesome && (
              <p className="font-heading text-sm tracking-wider text-gv-gold animate-pulse">
                Evolving...
              </p>
            )}

            {showAwesome && (
              <div className="mt-2 flex flex-col items-center gap-3 animate-fade-in">
                <p className="font-heading text-lg font-bold tracking-wider text-gv-gold">
                  Level 2 Unlocked!
                </p>
                <button
                  type="button"
                  onClick={() => setStep('auth-choice')}
                  className="flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-10 py-3 font-heading text-sm font-bold tracking-[0.15em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
                >
                  AWESOME!
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────── Step 2: Choose Avatar ────────
  if (step === 'choose-avatar') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gv-gold/40 bg-gv-surface shadow-2xl shadow-gv-gold/10">
          <div className="flex flex-col items-center px-6 pt-8 pb-6">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gv-text-muted">
              Choose your avatar
            </p>
            <p className="mb-5 text-center text-sm text-gv-text">
              Pick an avatar to claim your rewards!
            </p>

            <div className="mb-6 flex justify-center gap-5">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAvatarSelect(opt.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-2 transition-all ${
                    selectedAvatar === opt.id
                      ? 'scale-105 ring-2 ring-gv-gold shadow-lg shadow-gv-gold/20'
                      : selectedAvatar === null
                        ? 'opacity-70 hover:scale-105 hover:opacity-100 hover:ring-2 hover:ring-gv-gold/50'
                        : 'opacity-40 hover:opacity-60'
                  }`}
                >
                  <div className="h-40 w-32 overflow-hidden rounded-xl border-2 border-gv-gold/40 bg-gv-bg">
                    <img
                      src={opt.src}
                      alt={opt.label}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      selectedAvatar === opt.id ? 'text-gv-gold' : 'text-gv-text-muted'
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!selectedAvatar}
              onClick={handleAcceptRewards}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-6 py-3 font-heading text-sm font-bold tracking-[0.15em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
            >
              ACCEPT REWARDS
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────── Step 1: Reward (Level Up + XP/Coins) ────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Fireworks />

      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gv-gold/40 bg-gv-surface shadow-2xl shadow-gv-gold/10">
        {/* Level Up Section */}
        <div className="relative flex flex-col items-center gap-2 bg-gradient-to-b from-gv-gold/10 to-transparent px-6 pt-8 pb-4">
          {showLevel && (
            <>
              <p className="text-xs font-medium uppercase tracking-widest text-gv-text-muted">
                Level Up!
              </p>
              <div className="flex items-center gap-3">
                <span className="font-heading text-3xl font-bold text-gv-text-muted/50">
                  1
                </span>
                <span className="text-2xl text-gv-gold">{'\u2192'}</span>
                <span
                  className={`font-heading text-5xl font-black text-gv-gold drop-shadow-[0_0_20px_rgba(212,165,32,0.6)] ${levelNum === 2 ? 'animate-level-count' : ''}`}
                >
                  {levelNum}
                </span>
              </div>
              <div className="mt-1 text-3xl">{'\uD83C\uDF89'}</div>
            </>
          )}
        </div>

        {/* Rewards */}
        <div
          className={`flex flex-col items-center gap-3 px-6 pb-4 transition-all duration-500 ${showRewards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-gv-text-muted">
            Rewards earned
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-gv-gold/30 bg-gv-gold/10 px-4 py-2.5">
              <span className="text-lg">{'\u2B50'}</span>
              <div>
                <p className="font-heading text-lg font-bold text-gv-gold">+80</p>
                <p className="text-[10px] text-gv-text-muted">XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-gv-gold/30 bg-gv-gold/10 px-4 py-2.5">
              <span className="text-lg">{'\uD83E\uDE99'}</span>
              <div>
                <p className="font-heading text-lg font-bold text-gv-gold">+100</p>
                <p className="text-[10px] text-gv-text-muted">Coins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Choose avatar CTA */}
        <div
          className={`flex flex-col items-center gap-2 px-6 pt-2 pb-6 transition-all duration-500 ${showChooseBtn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <p className="text-center text-xs text-gv-text-muted">
            Choose an avatar to claim your rewards
          </p>
          <button
            type="button"
            onClick={() => setStep('choose-avatar')}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark px-6 py-3 font-heading text-sm font-bold tracking-[0.15em] text-gv-bg shadow-lg shadow-gv-gold/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            CHOOSE AVATAR
          </button>
        </div>
      </div>
    </div>
  );
}
