/**
 * Simple in-memory rate limiter for anonymous users
 * Tracks message timestamps per session/IP to prevent spam
 */

interface RateLimitEntry {
  timestamps: number[];
  lastCleanup: number;
}

// In-memory storage for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MESSAGE_INTERVAL_MS = 3000; // 3 seconds between messages
const MAX_MESSAGES_PER_WINDOW = 1; // 1 message per window
const CLEANUP_INTERVAL_MS = 60000; // Clean up old entries every minute
const ENTRY_EXPIRY_MS = 300000; // Remove entries after 5 minutes of inactivity

let lastGlobalCleanup = Date.now();

/**
 * Clean up old entries to prevent memory leaks
 */
function cleanupOldEntries(): void {
  const now = Date.now();
  
  // Only run global cleanup periodically
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }
  
  lastGlobalCleanup = now;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries that haven't been used recently
    if (now - entry.lastCleanup > ENTRY_EXPIRY_MS) {
      rateLimitStore.delete(key);
    } else {
      // Clean up old timestamps within the entry
      entry.timestamps = entry.timestamps.filter(
        (timestamp) => now - timestamp < MESSAGE_INTERVAL_MS * 2
      );
    }
  }
}

/**
 * Check if a request is allowed based on rate limiting
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  
  // Periodic cleanup
  cleanupOldEntries();
  
  // Get or create entry for this identifier
  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = {
      timestamps: [],
      lastCleanup: now,
    };
    rateLimitStore.set(identifier, entry);
  }
  
  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(
    (timestamp) => now - timestamp < MESSAGE_INTERVAL_MS
  );
  entry.lastCleanup = now;
  
  // Check if limit is exceeded
  if (entry.timestamps.length >= MAX_MESSAGES_PER_WINDOW) {
    const oldestTimestamp = Math.min(...entry.timestamps);
    const retryAfter = Math.ceil((MESSAGE_INTERVAL_MS - (now - oldestTimestamp)) / 1000);
    
    return {
      allowed: false,
      retryAfter: Math.max(retryAfter, 1),
    };
  }
  
  // Add current timestamp
  entry.timestamps.push(now);
  
  return {
    allowed: true,
  };
}

/**
 * Reset rate limit for an identifier (useful after authentication)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get current rate limit status without modifying it
 */
export function getRateLimitStatus(identifier: string): {
  messageCount: number;
  nextAllowedAt?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry) {
    return { messageCount: 0 };
  }
  
  // Filter to current window
  const recentTimestamps = entry.timestamps.filter(
    (timestamp) => now - timestamp < MESSAGE_INTERVAL_MS
  );
  
  if (recentTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
    const oldestTimestamp = Math.min(...recentTimestamps);
    const nextAllowedAt = oldestTimestamp + MESSAGE_INTERVAL_MS;
    
    return {
      messageCount: recentTimestamps.length,
      nextAllowedAt,
    };
  }
  
  return {
    messageCount: recentTimestamps.length,
  };
}

