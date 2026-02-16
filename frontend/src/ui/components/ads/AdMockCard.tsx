import { type AdCreative } from '@/ui/ads/adPlacements';
import { Play } from 'lucide-react';

interface AdMockCardProps {
  creative: AdCreative;
  /** Additional Tailwind classes for height/sizing */
  className?: string;
  /** Whether this is an inline ad (default) or rewarded video */
  variant?: 'inline' | 'rewarded';
  /** Optional click handler for rewarded video completion */
  onComplete?: () => void;
}

/**
 * Renders a realistic-looking ad mock card.
 * UI-only component with no real ad network integration.
 */
export function AdMockCard({ creative, className = '', variant = 'inline', onComplete }: AdMockCardProps) {
  const isVideo = creative.type === 'video';
  const isRewarded = variant === 'rewarded';

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-gv-border bg-gv-surface ${className}`}
      style={{
        background: `linear-gradient(135deg, ${creative.gradientFrom} 0%, ${creative.gradientTo} 100%)`,
      }}
    >
      {/* Sponsor badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="rounded bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {creative.sponsorLabel}
        </span>
      </div>

      {/* Video duration badge (if video) */}
      {isVideo && creative.durationLabel && (
        <div className="absolute top-2 right-2 z-10">
          <span className="rounded bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {creative.durationLabel}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex h-full items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Video play icon */}
          {isVideo && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-12 sm:w-12">
              <Play className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="currentColor" />
            </div>
          )}

          {/* Text content */}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-bold text-white sm:text-base">{creative.title}</h3>
            {!isRewarded && (
              <p className="text-xs text-white/80 sm:text-sm">{creative.ctaText}</p>
            )}
          </div>
        </div>

        {/* CTA Button (inline ads only) */}
        {!isRewarded && (
          <button
            className="shrink-0 rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 transition-all hover:bg-white active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
            onClick={(e) => {
              e.preventDefault();
              // Mock click - no actual navigation
            }}
          >
            {creative.ctaText}
          </button>
        )}

        {/* Complete Button (rewarded videos only) */}
        {isRewarded && onComplete && (
          <button
            className="shrink-0 rounded-md bg-gv-gold px-3 py-1.5 text-xs font-bold text-gv-bg transition-all hover:bg-gv-gold-light active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
            onClick={onComplete}
          >
            Finish Video
          </button>
        )}
      </div>

      {/* Mock shimmer effect overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
