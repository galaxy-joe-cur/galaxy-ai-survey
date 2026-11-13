import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/admin-auth";
import { parsePayload, rowsToCsv, type SurveyDbRow } from "@/lib/csv-export";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

function deny(result: Exclude<ReturnType<typeof authorizeAdmin>, { ok: true }>) {
  const headers: Record<string, string> = {};
  if (result.retryAfterSec != null) {
    headers["Retry-After"] = String(result.retryAfterSec);
  }
  return NextResponse.json(
    { error: result.error },
    { status: result.status, headers },
  );
}

async function listRows() {
  return sql<SurveyDbRow>(
    `select id::text, created_at::text, name, department, job_title, contact, payload
     from survey_responses
     order by created_at desc`,
  );
}

function csvResponse(rows: SurveyDbRow[]) {
  const csv = rowsToCsv(rows);
  const body = Buffer.from(csv, "utf8");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="ai-survey-responses.csv"; filename*=UTF-8\'\'%E5%93%A1%E5%B7%A5AI%E8%AA%BF%E6%9F%A5%E5%9B%9E%E8%A6%86.csv',
      "Cache-Control": "no-store",
    },
  });
}

function jsonResponse(rows: SurveyDbRow[]) {
  return NextResponse.json({
    count: rows.length,
    responses: rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      name: row.name,
      department: row.department,
      jobTitle: row.job_title,
      contact: row.contact,
      payload: parsePayload(row.payload),
    })),
  });
}

export async function GET(request: Request) {
  const auth = authorizeAdmin(request);
  if (!auth.ok) return deny(auth);

  const format = new URL(request.url).searchParams.get("format") ?? "json";

  try {
    const rows = await listRows();
    if (format === "csv") return csvResponse(rows);
    return jsonResponse(rows);
  } catch (error) {
    console.error("admin list failed", error);
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}

/** Optional POST: key via header; body may set { "format": "csv" }. */
export async function POST(request: Request) {
  const auth = authorizeAdmin(request);
  if (!auth.ok) return deny(auth);

  let format = "json";
  try {
    const body = (await request.json()) as { format?: unknown };
    if (body?.format === "csv") format = "csv";
  } catch {
    // empty body → json
  }

  try {
    const rows = await listRows();
    if (format === "csv") return csvResponse(rows);
    return jsonResponse(rows);
  } catch (error) {
    console.error("admin list failed", error);
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}
