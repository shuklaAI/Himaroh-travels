import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null | undefined; // undefined = not yet checked, null = unavailable

function getRateLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Rate limiting is disabled rather than blocking requests when Redis isn't
    // configured (e.g. local development) — same graceful-degradation pattern
    // used for email (Resend) and payments (Razorpay) elsewhere in this app.
    limiter = null;
    return null;
  }

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "himaroh",
  });
  return limiter;
}

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean }> {
  const rl = getRateLimiter();
  if (!rl) return { allowed: true };

  try {
    const result = await rl.limit(identifier);
    return { allowed: result.success };
  } catch (err) {
    // If the rate-limit service itself is unreachable, fail open rather than
    // blocking legitimate customers from booking.
    console.error("Rate limit check failed, allowing request:", err);
    return { allowed: true };
  }
}
