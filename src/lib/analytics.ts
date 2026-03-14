/**
 * GA4 event tracking for viral/growth metrics.
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env.local (e.g. G-XXXXXXXXXX).
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type ViralEvent =
  | { name: 'quiz_completed'; params: { score: number; total: number; streak?: number } }
  | { name: 'share_clicked'; params: { method: string; content: string } }
  | { name: 'challenge_created'; params: { challengeId?: string } }
  | { name: 'word_saved'; params: { word?: string; source?: string } }
  | { name: 'streak_extended'; params: { streak: number } }
  | { name: 'page_view'; params: { page_path: string; page_title?: string } };

export function trackEvent(event: ViralEvent): void {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag('event', event.name, event.params);
}

export function trackQuizCompleted(score: number, total: number, streak?: number): void {
  trackEvent({ name: 'quiz_completed', params: { score, total, ...(streak != null && { streak }) } });
}

export function trackShareClicked(method: string, content: string): void {
  trackEvent({ name: 'share_clicked', params: { method, content } });
}

export function trackChallengeCreated(challengeId?: string): void {
  trackEvent({ name: 'challenge_created', params: { challengeId: challengeId ?? '' } });
}

export function trackWordSaved(word?: string, source?: string): void {
  trackEvent({ name: 'word_saved', params: { word: word ?? '', source: source ?? '' } });
}

export function trackStreakExtended(streak: number): void {
  trackEvent({ name: 'streak_extended', params: { streak } });
}
