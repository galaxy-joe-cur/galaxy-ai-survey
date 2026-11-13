import { createHash, timingSafeEqual } from "node:crypto";
import { clientIp } from "@/lib/rate-limit";

const ADMIN_FAIL_LIMIT = 10;
const ADMIN_FAIL_WINDOW_MS = 15 * 60_000;

type FailBucket = { count: number; resetAt: number };
const failCounts = new Map<string, FailBucket>();

export function adminKeyConfigured(): boolean {
  return Boolean(process.env.ADMIN_KEY?.trim());
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Constant-time compare of candidate vs configured ADMIN_KEY. */
export function isValidAdminKey(candidate: string | null | undefined): boolean {
  const expected = process.env.ADMIN_KEY?.trim() ?? "";
  if (!expected || !candidate) return false;
  try {
    return timingSafeEqual(digest(candidate), digest(expected));
  } catch {
    return false;
  }
}

/** Only header (or Authorization Bearer). Never read from URL query. */
export function readAdminKeyFromRequest(request: Request): string | null {
  const header = request.headers.get("x-admin-key")?.trim();
  if (header) return header;
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    return token || null;
  }
  return null;
}

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 429 | 503; error: string; retryAfterSec?: number };

/** Shared ADMIN_KEY check with per-IP failed-attempt lockout. */
export function authorizeAdmin(request: Request): AdminAuthResult {
  if (!adminKeyConfigured()) {
    return {
      ok: false,
      status: 503,
      error:
        "尚未設定 ADMIN_KEY。請在 Cursor 應用 Secrets 中加入 ADMIN_KEY 後再匯出。",
    };
  }

  const ip = clientIp(request);
  const now = Date.now();
  const bucket = failCounts.get(ip);
  if (bucket && bucket.resetAt > now && bucket.count >= ADMIN_FAIL_LIMIT) {
    return {
      ok: false,
      status: 429,
      error: "嘗試次數過多，請稍後再試",
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  const key = readAdminKeyFromRequest(request);
  if (!isValidAdminKey(key)) {
    if (!bucket || bucket.resetAt <= now) {
      failCounts.set(ip, { count: 1, resetAt: now + ADMIN_FAIL_WINDOW_MS });
    } else {
      bucket.count += 1;
    }
    return { ok: false, status: 401, error: "未授權" };
  }

  failCounts.delete(ip);
  return { ok: true };
}
