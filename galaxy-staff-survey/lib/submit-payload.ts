/** Whitelist of survey fields stored in payload jsonb (excludes name). */
export const SUBMIT_PAYLOAD_KEYS = [
  "department",
  "jobTitle",
  "contact",
  "workTypes",
  "workTypeOther",
  "workSummary",
  "timeSinks",
  "timeSinkOther",
  "topImprove",
  "familiarity",
  "tools",
  "toolCategoryOthers",
  "toolOther",
  "miscToolOtherOn",
  "speechTool",
  "noAi",
  "unsureTool",
  "usageFreq",
  "accounts",
  "usageNotes",
  "wishes",
  "wishOther",
  "willingness",
  "concerns",
  "concernOther",
  "preferences",
  "prefOther",
  "importance",
  "urgency",
  "priority1",
  "priority2",
  "priorityNone",
  "suggestions",
  "confirmed",
  "remark",
] as const;

export type SubmitPayloadKey = (typeof SUBMIT_PAYLOAD_KEYS)[number];

export function pickSubmitPayload(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of SUBMIT_PAYLOAD_KEYS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
}
