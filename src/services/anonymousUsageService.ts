/**
 * Anonymous Usage Service
 * Tracks translation usage for non-authenticated users using localStorage
 */

const STORAGE_KEY = 'anonymous_usage';
const FREE_TIER_LIMIT = 10;

export interface AnonymousUsage {
  count: number;
  firstUsedAt: string;
  lastUsedAt: string;
  resetAt: string; // Daily reset
}

/**
 * Get current anonymous usage from localStorage
 */
export function getAnonymousUsage(): AnonymousUsage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createNewUsage();
    }

    const usage: AnonymousUsage = JSON.parse(stored);

    // Check if we need to reset (24 hours have passed)
    const resetTime = new Date(usage.resetAt);
    const now = new Date();

    if (now > resetTime) {
      console.log('🔄 Resetting anonymous usage (24 hours elapsed)');
      return createNewUsage();
    }

    return usage;
  } catch (error) {
    console.error('Error reading anonymous usage:', error);
    return createNewUsage();
  }
}

/**
 * Create new usage record
 */
function createNewUsage(): AnonymousUsage {
  const now = new Date();
  const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  const usage: AnonymousUsage = {
    count: 0,
    firstUsedAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    resetAt: resetAt.toISOString()
  };

  saveUsage(usage);
  return usage;
}

/**
 * Save usage to localStorage
 */
function saveUsage(usage: AnonymousUsage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error('Error saving anonymous usage:', error);
  }
}

/**
 * Increment usage count
 */
export function incrementAnonymousUsage(): AnonymousUsage {
  const usage = getAnonymousUsage();
  usage.count += 1;
  usage.lastUsedAt = new Date().toISOString();
  saveUsage(usage);

  console.log(`📊 Anonymous usage: ${usage.count}/${FREE_TIER_LIMIT}`);

  return usage;
}

/**
 * Check if user has remaining free translations
 */
export function hasRemainingTranslations(): boolean {
  const usage = getAnonymousUsage();
  return usage.count < FREE_TIER_LIMIT;
}

/**
 * Get remaining translation count
 */
export function getRemainingTranslations(): number {
  const usage = getAnonymousUsage();
  return Math.max(0, FREE_TIER_LIMIT - usage.count);
}

/**
 * Get time until reset
 */
export function getTimeUntilReset(): string {
  const usage = getAnonymousUsage();
  const resetTime = new Date(usage.resetAt);
  const now = new Date();
  const diff = resetTime.getTime() - now.getTime();

  if (diff <= 0) return '0 hours';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 * Clear anonymous usage (for testing or when user signs up)
 */
export function clearAnonymousUsage(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Cleared anonymous usage');
}

/**
 * Check if user should be shown signup wall
 */
export function shouldShowSignupWall(): boolean {
  const usage = getAnonymousUsage();
  return usage.count >= FREE_TIER_LIMIT;
}

export const ANONYMOUS_FREE_LIMIT = FREE_TIER_LIMIT;
