/**
 * Single source of truth for all ad placements across the app.
 * All ad creative metadata, placement IDs, and display configs are centralized here.
 */

export type AdCreativeType = 'image' | 'video';

export type AdPlacementContext = 'globalStickyBottom' | 'gameInline' | 'rewarded';

export interface AdCreative {
  id: string;
  type: AdCreativeType;
  title: string;
  ctaText: string;
  sponsorLabel: string;
  /** Duration label for video ads (e.g., "0:30") */
  durationLabel?: string;
  /** Background gradient colors for mock visual */
  gradientFrom: string;
  gradientTo: string;
}

export interface AdPlacement {
  id: string;
  context: AdPlacementContext;
  creative: AdCreative;
  /** Route context: 'all' for all routes, or specific gameId */
  routeContext: 'all' | string;
  /** Mobile-first sizing */
  mobileHeight: string; // Tailwind class
  desktopHeight: string; // Tailwind class
}

/**
 * Ad creative definitions - reusable mock ad assets
 */
export const AD_CREATIVES: Record<string, AdCreative> = {
  genericBrandA: {
    id: 'genericBrandA',
    type: 'image',
    title: 'Discover New Games',
    ctaText: 'Play Now',
    sponsorLabel: 'Sponsored',
    gradientFrom: '#667eea',
    gradientTo: '#764ba2',
  },
  genericBrandB: {
    id: 'genericBrandB',
    type: 'image',
    title: 'Level Up Your Skills',
    ctaText: 'Learn More',
    sponsorLabel: 'Sponsored',
    gradientFrom: '#f093fb',
    gradientTo: '#f5576c',
  },
  genericBrandC: {
    id: 'genericBrandC',
    type: 'image',
    title: 'Join the Community',
    ctaText: 'Sign Up Free',
    sponsorLabel: 'Sponsored',
    gradientFrom: '#4facfe',
    gradientTo: '#00f2fe',
  },
  rewardedVideoHint: {
    id: 'rewardedVideoHint',
    type: 'video',
    title: 'Watch to Get a Hint',
    ctaText: 'Continue',
    sponsorLabel: 'Rewarded Ad',
    durationLabel: '0:30',
    gradientFrom: '#fa709a',
    gradientTo: '#fee140',
  },
  rewardedVideoLives: {
    id: 'rewardedVideoLives',
    type: 'video',
    title: 'Watch to Continue',
    ctaText: 'Continue',
    sponsorLabel: 'Rewarded Ad',
    durationLabel: '0:30',
    gradientFrom: '#30cfd0',
    gradientTo: '#330867',
  },
};

/**
 * Ad placement definitions - where ads appear in the app
 */
export const AD_PLACEMENTS: Record<string, AdPlacement> = {
  globalStickyBottom: {
    id: 'globalStickyBottom',
    context: 'globalStickyBottom',
    creative: AD_CREATIVES.genericBrandA,
    routeContext: 'all',
    mobileHeight: 'h-16',
    desktopHeight: 'sm:h-20',
  },
  linkFourInline: {
    id: 'linkFourInline',
    context: 'gameInline',
    creative: AD_CREATIVES.genericBrandB,
    routeContext: '1', // gameId for Link Four
    mobileHeight: 'h-20',
    desktopHeight: 'sm:h-24',
  },
  cinemojiInline: {
    id: 'cinemojiInline',
    context: 'gameInline',
    creative: AD_CREATIVES.genericBrandC,
    routeContext: '13', // gameId for Cinemoji
    mobileHeight: 'h-20',
    desktopHeight: 'sm:h-24',
  },
  quizmoInline: {
    id: 'quizmoInline',
    context: 'gameInline',
    creative: AD_CREATIVES.genericBrandB,
    routeContext: '14', // gameId for Quizmo
    mobileHeight: 'h-20',
    desktopHeight: 'sm:h-24',
  },
  cinemojiRewardedHintVideo: {
    id: 'cinemojiRewardedHintVideo',
    context: 'rewarded',
    creative: AD_CREATIVES.rewardedVideoHint,
    routeContext: '13',
    mobileHeight: 'h-64',
    desktopHeight: 'sm:h-80',
  },
  cinemojiRewardedLivesVideo: {
    id: 'cinemojiRewardedLivesVideo',
    context: 'rewarded',
    creative: AD_CREATIVES.rewardedVideoLives,
    routeContext: '13',
    mobileHeight: 'h-64',
    desktopHeight: 'sm:h-80',
  },
};

/**
 * Helper to get placement by ID
 */
export function getAdPlacement(placementId: string): AdPlacement | undefined {
  return AD_PLACEMENTS[placementId];
}

/**
 * Helper to get creative by ID
 */
export function getAdCreative(creativeId: string): AdCreative | undefined {
  return AD_CREATIVES[creativeId];
}

/**
 * Backend placeholder string mapping for rewarded ads
 * Maps backend response strings to our creative IDs
 */
export const REWARDED_PLACEHOLDER_MAP: Record<string, string> = {
  REWARDED_VIDEO_PLACEHOLDER: 'rewardedVideoHint', // default fallback
  HINT_REWARDED: 'rewardedVideoHint',
  LIVES_REWARDED: 'rewardedVideoLives',
};

/**
 * Get display label for rewarded placeholder response
 */
export function getRewardedDisplayLabel(placeholderString?: string): string {
  if (!placeholderString) return 'Ad Complete';
  
  const creativeId = REWARDED_PLACEHOLDER_MAP[placeholderString] || 'rewardedVideoHint';
  const creative = AD_CREATIVES[creativeId];
  
  return creative ? `${creative.sponsorLabel} - ${creative.title}` : 'Ad Complete';
}
