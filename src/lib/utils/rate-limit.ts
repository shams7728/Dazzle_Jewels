/**
 * Rate Limiting Utility
 * 
 * Implements in-memory rate limiting for API endpoints to prevent abuse.
 * Uses a sliding window algorithm with per-user/IP tracking.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limit tracking
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;
  
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  
  /**
   * Identifier for the rate limit (e.g., 'coupon-validation', 'order-creation')
   */
  identifier: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if a request is allowed based on rate limiting rules
 * 
 * @param userId - User ID or IP address for tracking
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(
  userId: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.identifier}:${userId}`;
  const now = Date.now();
  
  // Get or create entry
  let entry = rateLimitStore.get(key);
  
  // If entry doesn't exist or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000); // seconds
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for a specific user/identifier combination
 * Useful for testing or manual overrides
 */
export function resetRateLimit(userId: string, identifier: string): void {
  const key = `${identifier}:${userId}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  userId: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.identifier}:${userId}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }
  
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = remaining > 0;
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  /**
   * Coupon validation: 5 requests per minute per user
   * Prevents brute-force coupon code guessing
   */
  COUPON_VALIDATION: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'coupon-validation',
  },
  
  /**
   * Order creation: 10 requests per minute per user
   * Prevents spam order creation
   */
  ORDER_CREATION: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'order-creation',
  },
  
  /**
   * Status update: 30 requests per minute per admin
   * Allows reasonable admin activity while preventing abuse
   */
  STATUS_UPDATE: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'status-update',
  },
  
  /**
   * Delivery calculation: 20 requests per minute per user
   * Allows users to check multiple addresses
   */
  DELIVERY_CALCULATION: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'delivery-calculation',
  },
  
  /**
   * Payment creation: 5 requests per minute per user
   * Prevents payment spam
   */
  PAYMENT_CREATION: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'payment-creation',
  },
} as const;

/**
 * Extract user identifier from request
 * Uses user ID if authenticated, otherwise falls back to IP address
 */
export function getUserIdentifier(userId?: string, ipAddress?: string): string {
  return userId || ipAddress || 'anonymous';
}

/**
 * Get client IP address from request headers
 * Handles various proxy headers
 */
export function getClientIP(headers: Headers): string {
  // Check common proxy headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  // Fallback to a generic identifier
  return 'unknown';
}
