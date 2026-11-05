/**
 * Per-route request budget, held in the memory of one server instance.
 *
 * It caps how many requests a route answers per window, for everyone
 * together. It never looks at who is asking (no IP, no identifier), so it
 * keeps the privacy promise in /privacy. Its job is cost control: when a flood
 * of requests arrives, the route answers 429 at once instead of doing work or
 * calling paid services (Upstash). Blocking abusive clients per IP is the job
 * of the Vercel Firewall rate-limit rule (see GROWTH_AND_ROADMAP.md, cost
 * guardrails), which also isn't billed for the requests it blocks.
 */
type Window = { start: number; count: number };

const windows = new Map<string, Window>();

export interface RouteBudget {
  /** Requests allowed per window, per server instance. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/** Counter routes write to Upstash: 300 a minute per instance is far above real use. */
export const COUNTER_BUDGET: RouteBudget = { limit: 300, windowMs: 60_000 };
/** Public data API: answers are cached at the CDN, so a function call is a cache miss. */
export const DATA_API_BUDGET: RouteBudget = { limit: 600, windowMs: 60_000 };

/** Largest request body the counter routes accept (their real bodies are under 200 bytes). */
export const MAX_COUNTER_BODY_BYTES = 1024;

/** True if this request fits the route's budget; counts it either way. */
export function withinBudget(route: string, budget: RouteBudget, now: number = Date.now()): boolean {
  const w = windows.get(route);
  if (!w || now - w.start >= budget.windowMs) {
    windows.set(route, { start: now, count: 1 });
    return true;
  }
  w.count += 1;
  return w.count <= budget.limit;
}

/** Seconds until the route's current window ends, for the Retry-After header. */
export function retryAfterSeconds(route: string, budget: RouteBudget, now: number = Date.now()): number {
  const w = windows.get(route);
  if (!w) return 0;
  return Math.max(1, Math.ceil((w.start + budget.windowMs - now) / 1000));
}

/** True if the declared body size is missing or within the limit. */
export function bodySizeOk(request: Request, maxBytes: number = MAX_COUNTER_BODY_BYTES): boolean {
  const declared = request.headers.get("content-length");
  if (declared === null) return true;
  const n = Number(declared);
  return Number.isFinite(n) && n <= maxBytes;
}

/** Test helper: forget all windows. */
export function resetBudgets(): void {
  windows.clear();
}
