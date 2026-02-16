import { getAdPlacement, type AdPlacement } from '@/ui/ads/adPlacements';
import { AdMockCard } from './AdMockCard';

interface InlineAdProps {
  /** Placement ID from ad registry */
  placementId: string;
  /** Additional container classes */
  className?: string;
}

/**
 * Inline ad component for game pages and content areas.
 * Pulls configuration from centralized ad placement registry.
 */
export function InlineAd({ placementId, className = '' }: InlineAdProps) {
  const placement: AdPlacement | undefined = getAdPlacement(placementId);

  if (!placement) {
    // Fallback for missing placement
    return (
      <div className={`rounded-lg border border-gv-border bg-gv-surface p-3 text-center text-xs text-gv-text-muted ${className}`}>
        Ad Placeholder
      </div>
    );
  }

  const heightClasses = `${placement.mobileHeight} ${placement.desktopHeight}`;

  return (
    <div className={className}>
      <AdMockCard creative={placement.creative} className={heightClasses} variant="inline" />
    </div>
  );
}
