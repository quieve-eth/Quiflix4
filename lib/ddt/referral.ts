import crypto from 'crypto';

/**
 * Generate unique referral link for distributor
 * Format: /films?ref=<unique-code>
 */
export function generateReferralCode(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create the full referral URL
 */
export function createReferralLink(referralCode: string, filmId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams();
  params.append('ref', referralCode);
  if (filmId) {
    params.append('film', filmId);
  }
  return `${baseUrl}/films?${params.toString()}`;
}

/**
 * Extract referral code from URL
 */
export function extractReferralCode(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('ref');
  } catch {
    return null;
  }
}
