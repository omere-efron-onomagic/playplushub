import { getAdPlacement } from '@/ui/ads/adPlacements';
import { AdMockCard } from './AdMockCard';
import { X } from 'lucide-react';
import { useState } from 'react';

/**
 * Global sticky bottom ad that appears on all routes.
 * Mobile-first with safe-area padding to avoid overlap with avatar button.
 */
export function StickyBottomAd() {
  const [isVisible, setIsVisible] = useState(true);
  const placement = getAdPlacement('globalStickyBottom');

  if (!placement || !isVisible) {
    return null;
  }

  const heightClasses = `${placement.mobileHeight} ${placement.desktopHeight}`;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 ${heightClasses}`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 z-40 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70 active:scale-95"
        aria-label="Close ad"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Ad content */}
      <AdMockCard creative={placement.creative} className="h-full rounded-none border-x-0 border-b-0" />
    </div>
  );
}
