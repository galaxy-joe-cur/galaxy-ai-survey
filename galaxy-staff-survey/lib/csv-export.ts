import { FAMILIARITY, TOOL_GROUPS } from "@/lib/survey-options";

export type SurveyDbRow = {
  id: string;
  created_at: string;
  name: string;
  department: string | null;
  job_title: string | null;
  contact: string | null;
  payload: Record<string, unknown> | string;
};

const UTF8_BOM = "\uFEFF";

const FAMILIARITY_LABEL: Record<string, string> = Object.fromEntries(
  FAMILIARITY.map((item) => [item.value, item.label]),
);

const TOOL_GROUP_LABEL: Record<string, string> = Object.fromEntries(
  TOOL_GROUPS.map((g) => [g.id, g.title]),
);

/** 欄位順序：一題／一組選項一欄（繁中表頭） */
export const CSV_COLUMNS: { key: string; header: string }[] = [
  { key: "id", header: "編號" },
  { key: "created_at", header: "送出時間" },
  { key: "name", header: "姓名" },
  { key: "department", header: "部門／中心" },
  { key: "job_title", header: "職位或主要工作" },
  { key: "contact", header: "聯絡方式" },
  { key: "workTypes", header: "主要工作類型" },
  { key: "workTypeOther", header: "主要工作類型－其他說明" },
  { key: "workSummary", header: "平常主要在做什麼" },
  { key: "timeSinks", header: "費時／重複／易錯工作" },
  { key: "timeSinkOther", header: "費時工作－其他說明" },
  { key: "topImprove", header: "最希望先改善的一件事" },
  { key: "familiarity", header: "對 AI 熟悉程度" },
  { key: "tools", header: "用過的 AI 工具" },
  { key: "toolCategoryOthers", header: "各類工具－其他說明" },
  { key: "speechTool", header: "語音轉寫工具說明" },
  { key: "miscToolOther", header: "其他／不確定－其他工具說明" },
  { key: "unsureTool", header: "不確定名稱但用過類似工具" },
  { key: "noAi", header: "目前未使用任何 AI" },
  { key: "usageFreq", header: "工作上使用頻率" },
  { key: "accounts", header: "帳號類型" },
  { key: "usageNotes", header: "使用心得（好用／不滿意）" },
  { key: "wishes", header: "希望 AI 能幫忙的項目" },
  { key: "wishOther", header: "希望幫忙－其他說明" },
  { key: "willingness", header: "若公司提供工具的意願" },
  { key: "concerns", header: "顧慮與需要的協助" },
  { key: "concernOther", header: "顧慮－其他說明" },
  { key: "preferences", header: "希望公司優先提供的工具" },
  { key: "prefOther", header: "其他國際主流工具說明" },
  { key: "importance", header: "對日常工作重要程度" },
  { key: "urgency", header: "統一採購急迫性" },
  { key: "priority1", header: "優先工具／類型（第1）" },
  { key: "priority2", header: "優先工具／類型（第2）" },
  { key: "priorityNone", header: "無特定偏好（接受公司選定）" },
  { key: "suggestions", header: "其他建議" },
  { key: "confirmed", header: "本人確認" },
  { key: "remark", header: "備註" },
];

export function parsePayload(
  payload: SurveyDbRow["payload"],
): Record<string, unknown> {
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return { raw: payload };
    }
  }
  return payload ?? {};
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (value == null || value === "") return [];
  return [String(value)];
}

function joinList(value: unknown): string {
  return asList(value).join("；");
}

function yesNo(value: unknown): string {
  if (value === true || value === "true" || value === 1) return "是";
  if (value === false || value === "false" || value === 0) return "否";
  return "";
}

function formatToolCategoryOthers(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value == null ? "" : String(value);
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .map(([id, text]) => {
      const label = TOOL_GROUP_LABEL[id] ?? id;
      const note = String(text ?? "").trim();
      return note ? `${label}：${note}` : `${label}：（已勾選未填說明）`;
    })
    .filter(Boolean);
  return entries.join("；");
}

function formatPreferences(value: unknown): string {
  const labels: Record<string, string> = {
    ChatGPT: "ChatGPT",
    Claude: "Claude",
    Gemini: "Gemini",
    "Microsoft Copilot": "Microsoft Copilot",
    image_tools: "Midjourney／DALL·E／Canva AI",
    translate_tools: "DeepL 或語音轉寫類",
    other_intl: "其他國際主流工具",
    no_preference: "無特定偏好",
    unsure: "不清楚，想先看示範",
  };
  return asList(value)
    .map((item) => labels[item] ?? item)
    .join("；");
}

function cellValue(key: string, row: SurveyDbRow, p: Record<string, unknown>): string {
  switch (key) {
    case "id":
      return row.id;
    case "created_at":
      return row.created_at;
    case "name":
      return row.name;
    case "department":
      return row.department ?? (p.department as string) ?? "";
    case "job_title":
      return row.job_title ?? (p.jobTitle as string) ?? "";
    case "contact":
      return row.contact ?? (p.contact as string) ?? "";
    case "workTypes":
      return joinList(p.workTypes);
    case "workTypeOther":
      return String(p.workTypeOther ?? "");
    case "workSummary":
      return String(p.workSummary ?? "");
    case "timeSinks":
      return joinList(p.timeSinks);
    case "timeSinkOther":
      return String(p.timeSinkOther ?? "");
    case "topImprove":
      return String(p.topImprove ?? "");
    case "familiarity": {
      const raw = String(p.familiarity ?? "");
      return FAMILIARITY_LABEL[raw] ?? raw;
    }
    case "tools":
      return joinList(p.tools);
    case "toolCategoryOthers":
      return formatToolCategoryOthers(p.toolCategoryOthers);
    case "speechTool":
      return String(p.speechTool ?? "");
    case "miscToolOther":
      return String(p.toolOther ?? p.miscToolOther ?? "");
    case "unsureTool":
      return yesNo(p.unsureTool);
    case "noAi":
      return yesNo(p.noAi);
    case "usageFreq":
      return String(p.usageFreq ?? "");
    case "accounts":
      return joinList(p.accounts);
    case "usageNotes":
      return String(p.usageNotes ?? "");
    case "wishes":
      return joinList(p.wishes);
    case "wishOther":
      return String(p.wishOther ?? "");
    case "willingness":
      return String(p.willingness ?? "");
    case "concerns":
      return joinList(p.concerns);
    case "concernOther":
      return String(p.concernOther ?? "");
    case "preferences":
      return formatPreferences(p.preferences);
    case "prefOther":
      return String(p.prefOther ?? "");
    case "importance":
      return String(p.importance ?? "");
    case "urgency":
      return String(p.urgency ?? "");
    case "priority1":
      return String(p.priority1 ?? "");
    case "priority2":
      return String(p.priority2 ?? "");
    case "priorityNone":
      return yesNo(p.priorityNone);
    case "suggestions":
      return String(p.suggestions ?? "");
    case "confirmed":
      return yesNo(p.confirmed);
    case "remark":
      return String(p.remark ?? "");
    default:
      return "";
  }
}

/**
 * Neutralize Excel/Sheets formula injection, then RFC4180-quote.
 * Leading = + - @ TAB CR are prefixed with a single quote so Excel treats text.
 */
export function escapeCsvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",\n\r]/.test(text) || text.startsWith("'")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** UTF-8 CSV with BOM（Excel 可正確開繁中） */
export function rowsToCsv(rows: SurveyDbRow[]): string {
  const headerLine = CSV_COLUMNS.map((c) => escapeCsvCell(c.header)).join(",");
  const lines = [headerLine];
  for (const row of rows) {
    const payload = parsePayload(row.payload);
    lines.push(
      CSV_COLUMNS.map((c) => escapeCsvCell(cellValue(c.key, row, payload))).join(
        ",",
      ),
    );
  }
  return `${UTF8_BOM}${lines.join("\r\n")}\r\n`;
}
