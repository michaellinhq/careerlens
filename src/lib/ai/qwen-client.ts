/**
 * AI Client — calls server-side /api/analyze
 *
 * API key is NEVER exposed to the browser.
 * The server route handles Qwen API communication.
 */

/**
 * Check if AI analysis is potentially available.
 * In SSR mode, always returns true — the server decides if the key is configured.
 * The client discovers availability when it calls the API.
 */
export function isAIAvailable(): boolean {
  // In SSR mode, we assume AI is available and handle errors gracefully
  return true;
}

/**
 * Call the server-side AI analysis endpoint.
 * Returns the parsed profile, or throws if unavailable.
 */
export async function analyzeWithAI(resumeText: string): Promise<{
  profile: import('./types').CareerProfile;
  mode: 'ai';
} | null> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });

    if (!response.ok) {
      // AI unavailable (no key configured, API error, etc.)
      // Caller should fall back to rules engine
      return null;
    }

    const data = await response.json();
    if (data.mode === 'ai' && data.profile) {
      return { profile: data.profile, mode: 'ai' };
    }
    return null;
  } catch {
    // Network error, server down, etc.
    return null;
  }
}
