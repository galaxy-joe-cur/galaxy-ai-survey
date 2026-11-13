import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { clientIp, takeToken } from "@/lib/rate-limit";
import { BodyTooLargeError, readBodyLimited } from "@/lib/read-body-limited";
import { pickSubmitPayload } from "@/lib/submit-payload";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 32_768; // 32 KiB
/** Tight anonymous limits (CAPTCHA-free). */
const PER_IP_PER_MINUTE = 3;
const PER_IP_PER_DAY = 8;
const GLOBAL_PER_HOUR = 120;
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function asOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function rateLimited(retryAfterSec: number) {
  return NextResponse.json(
    { error: "請求過於頻繁，請稍後再試" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  const perMinute = takeToken(
    `submit:min:${ip}`,
    PER_IP_PER_MINUTE,
    MINUTE_MS,
  );
  if (!perMinute.ok) return rateLimited(perMinute.retryAfterSec);

  const perDay = takeToken(`submit:day:${ip}`, PER_IP_PER_DAY, DAY_MS);
  if (!perDay.ok) return rateLimited(perDay.retryAfterSec);

  // Global cap so many spoofed / rotated addresses cannot fill the DB unbounded.
  const globalHour = takeToken(
    "submit:global:hour",
    GLOBAL_PER_HOUR,
    HOUR_MS,
  );
  if (!globalHour.ok) return rateLimited(globalHour.retryAfterSec);

  // Content-Length is optional (browsers / proxies may omit it). When present,
  // reject oversized declarations early; always enforce a stream byte cap.
  const contentLength = request.headers.get("content-length");
  if (contentLength != null) {
    const declared = Number(contentLength);
    if (!Number.isFinite(declared) || declared < 0 || declared > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "內容過大" }, { status: 413 });
    }
  }

  let raw: string;
  try {
    raw = await readBodyLimited(request, MAX_BODY_BYTES);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: "內容過大" }, { status: 413 });
    }
    return NextResponse.json({ error: "無效的請求內容" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "無效的請求內容" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "無效的請求內容" }, { status: 400 });
  }

  const name = asOptionalString(body.name);
  if (!name) {
    return NextResponse.json({ error: "姓名為必填" }, { status: 400 });
  }
  if (name.length > 200) {
    return NextResponse.json({ error: "姓名過長" }, { status: 400 });
  }

  const payload = pickSubmitPayload(body);
  const department = asOptionalString(payload.department);
  const jobTitle = asOptionalString(payload.jobTitle);
  const contact = asOptionalString(payload.contact);

  try {
    const rows = await sql<{ id: string }>(
      `insert into survey_responses (name, department, job_title, contact, payload)
       values ($1, $2, $3, $4, $5::jsonb)
       returning id`,
      [name, department, jobTitle, contact, JSON.stringify(payload)],
    );
    return NextResponse.json({ ok: true, id: rows[0]?.id ?? null });
  } catch (error) {
    console.error("submit failed", error);
    return NextResponse.json({ error: "儲存失敗，請稍後再試" }, { status: 500 });
  }
}
