/**
 * FORGE — Sliding Window Rate Limiter
 *
 * Enforces three independent limit dimensions per request:
 *   • IP      — account/network level  (5 req/min, 20 req/hour)
 *   • Browser — browser fingerprint    (8 req/min, 30 req/hour)
 *   • Device  — persistent device ID  (10 req/min, 50 req/hour)
 *
 * NOTE: This uses in-memory storage. On Vercel each serverless instance
 * has its own Map, so limits are per-instance. For strict multi-instance
 * enforcement, swap `store` for Vercel KV or Upstash Redis.
 */

// ── Store ─────────────────────────────────────────────────────────────────────
// key → [timestamp, timestamp, ...]
const store = new Map();
let lastCleanup = Date.now();

// ── Limits config ─────────────────────────────────────────────────────────────
const LIMITS = {
  ip: {
    label: 'IP (account)',
    minute: { window: 60_000,      max: 5  },
    hour:   { window: 3_600_000,   max: 20 },
  },
  browser: {
    label: 'Browser',
    minute: { window: 60_000,      max: 8  },
    hour:   { window: 3_600_000,   max: 30 },
  },
  device: {
    label: 'Device',
    minute: { window: 60_000,      max: 10 },
    hour:   { window: 3_600_000,   max: 50 },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

function getIP(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

function getBrowserFingerprint(req) {
  const ua   = req.headers['user-agent']        || 'ua:unknown';
  const lang = req.headers['accept-language']   || 'lang:unknown';
  const enc  = req.headers['accept-encoding']   || '';
  return djb2(ua + lang + enc);
}

// ── Sliding window check ──────────────────────────────────────────────────────
/**
 * Returns null if the request is within limits.
 * Returns { retryAfter } (seconds) if the limit is exceeded.
 */
function checkWindow(key, windowMs, max) {
  const now = Date.now();
  const cutoff = now - windowMs;

  let timestamps = store.get(key) ?? [];
  // Slide the window: discard events older than the window
  timestamps = timestamps.filter(ts => ts > cutoff);
  timestamps.push(now);
  store.set(key, timestamps);

  if (timestamps.length > max) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { retryAfter: Math.max(1, retryAfter) };
  }
  return null;
}

// ── Memory cleanup (runs at most every 5 minutes) ─────────────────────────────
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  const maxAge = 3_600_000; // 1 hour
  for (const [key, timestamps] of store.entries()) {
    const fresh = timestamps.filter(ts => now - ts < maxAge);
    if (fresh.length === 0) store.delete(key);
    else store.set(key, fresh);
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Call at the top of every API handler.
 * Returns true  → request is allowed, proceed.
 * Returns false → response already sent (429), abort handler.
 */
export function applyRateLimit(req, res) {
  maybeCleanup();

  const ip              = getIP(req);
  const browserHash     = getBrowserFingerprint(req);
  const deviceId        = req.headers['x-device-fingerprint'] || null;

  const ipKey           = `ip:${ip}`;
  const browserKey      = `browser:${browserHash}`;
  const deviceKey       = deviceId ? `device:${djb2(deviceId)}` : null;

  // Helper: send 429 and return false
  const block = (scope, label, retryAfter) => {
    res.setHeader('Retry-After', String(retryAfter));
    res.setHeader('X-RateLimit-Scope', scope);
    res.setHeader('X-RateLimit-Label', label);
    res.status(429).json({
      error: `Rate limit exceeded (${label}). Please wait ${retryAfter} second${retryAfter === 1 ? '' : 's'} before retrying.`,
      scope,
      retryAfter,
    });
    return false;
  };

  // ── 1. IP checks (account / network level) ──
  let hit = checkWindow(`${ipKey}:min`, LIMITS.ip.minute.window, LIMITS.ip.minute.max);
  if (hit) return block('IP_MINUTE', LIMITS.ip.label, hit.retryAfter);

  hit = checkWindow(`${ipKey}:hr`, LIMITS.ip.hour.window, LIMITS.ip.hour.max);
  if (hit) return block('IP_HOUR', LIMITS.ip.label, hit.retryAfter);

  // ── 2. Browser checks ──
  hit = checkWindow(`${browserKey}:min`, LIMITS.browser.minute.window, LIMITS.browser.minute.max);
  if (hit) return block('BROWSER_MINUTE', LIMITS.browser.label, hit.retryAfter);

  hit = checkWindow(`${browserKey}:hr`, LIMITS.browser.hour.window, LIMITS.browser.hour.max);
  if (hit) return block('BROWSER_HOUR', LIMITS.browser.label, hit.retryAfter);

  // ── 3. Device checks (only if client sends fingerprint) ──
  if (deviceKey) {
    hit = checkWindow(`${deviceKey}:min`, LIMITS.device.minute.window, LIMITS.device.minute.max);
    if (hit) return block('DEVICE_MINUTE', LIMITS.device.label, hit.retryAfter);

    hit = checkWindow(`${deviceKey}:hr`, LIMITS.device.hour.window, LIMITS.device.hour.max);
    if (hit) return block('DEVICE_HOUR', LIMITS.device.label, hit.retryAfter);
  }

  // ── Attach remaining-count headers for transparency ──
  const ipLeft = LIMITS.ip.minute.max - (store.get(`${ipKey}:min`)?.length ?? 0);
  res.setHeader('X-RateLimit-Remaining-IP',      String(Math.max(0, ipLeft)));
  res.setHeader('X-RateLimit-Remaining-Browser', String(Math.max(0,
    LIMITS.browser.minute.max - (store.get(`${browserKey}:min`)?.length ?? 0))));
  if (deviceKey) {
    res.setHeader('X-RateLimit-Remaining-Device', String(Math.max(0,
      LIMITS.device.minute.max - (store.get(`${deviceKey}:min`)?.length ?? 0))));
  }

  return true; // ✅ allowed
}
