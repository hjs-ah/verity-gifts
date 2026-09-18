/**
 * Minimal in-memory limiter. On Vercel each serverless instance keeps its own
 * counter, so treat this as a speed bump, not a wall. For a hard limit, move to
 * Upstash/Vercel KV or Vercel's built-in WAF rate limiting.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function clientKey(req: Request, scope: string): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return `${scope}:${ip}`;
}
