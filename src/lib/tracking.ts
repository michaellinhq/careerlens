/**
 * Append UTM tracking parameters to external URLs.
 * Used for training provider and tool vendor links to track referrals.
 */
export function trackUrl(url: string, source: 'training' | 'tool', skillId?: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'careerlens');
    u.searchParams.set('utm_medium', source);
    if (skillId) u.searchParams.set('utm_campaign', skillId);
    return u.toString();
  } catch {
    // If URL is invalid, return as-is
    return url;
  }
}
