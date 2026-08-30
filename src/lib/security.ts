
// Simple in-memory rate limit (per serverless instance)
const hits = new Map<string, {count:number; reset:number}>();
export function checkRateLimit(ip: string, limit=20, windowMs=60_000): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.reset) {
    hits.set(ip, {count:1, reset: now+windowMs});
    return true;
  }
  if (rec.count >= limit) return false;
  rec.count++;
  return true;
}
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
