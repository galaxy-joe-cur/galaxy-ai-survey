"use client";

import { FormEvent, useMemo, useState } from "react";
import OtherExplain from "@/components/OtherExplain";
import {
  ACCOUNT_TYPES,
  CONCERNS,
  CONCERNS_TAIL,
  DEPARTMENTS,
  FAMILIARITY,
  PREFERENCES,
  SCALE,
  SKIP_USAGE_VALUES,
  TIME_SINKS,
  TIME_SINKS_TAIL,
  TOOL_GROUPS,
  USAGE_FREQ,
  WILLINGNESS,
  WISHES,
  WISHES_TAIL,
  WORK_TYPES,
  type ToolGroupId,
} from "@/lib/survey-options";

type SubmitState = "idle" | "submitting" | "success" | "error";

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export default function SurveyForm() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [contact, setContact] = useState("");
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [workTypeOther, setWorkTypeOther] = useState("");
  const [workSummary, setWorkSummary] = useState("");
  const [timeSinks, setTimeSinks] = useState<string[]>([]);
  const [timeSinkOther, setTimeSinkOther] = useState("");
  const [topImprove, setTopImprove] = useState("");
  const [familiarity, setFamiliarity] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [toolCategoryOtherOn, setToolCategoryOtherOn] = useState<
    Partial<Record<ToolGroupId, boolean>>
  >({});
  const [toolCategoryOtherText, setToolCategoryOtherText] = useState<
    Partial<Record<ToolGroupId, string>>
  >({});
  const [miscToolOtherOn, setMiscToolOtherOn] = useState(false);
  const [miscToolOther, setMiscToolOther] = useState("");
  const [speechTool, setSpeechTool] = useState("");
  const [noAi, setNoAi] = useState(false);
  const [unsureTool, setUnsureTool] = useState(false);
  const [usageFreq, setUsageFreq] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [usageNotes, setUsageNotes] = useState("");
  const [wishes, setWishes] = useState<string[]>([]);
  const [wishOther, setWishOther] = useState("");
  const [willingness, setWillingness] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [concernOther, setConcernOther] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [prefOther, setPrefOther] = useState("");
  const [importance, setImportance] = useState("");
  const [urgency, setUrgency] = useState("");
  const [priority1, setPriority1] = useState("");
  const [priority2, setPriority2] = useState("");
  const [priorityNone, setPriorityNone] = useState(false);
  const [suggestions, setSuggestions] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [remark, setRemark] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  const skipUsage = useMemo(
    () => SKIP_USAGE_VALUES.has(familiarity) || noAi,
    [familiarity, noAi],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("請填寫姓名後再送出。");
      return;
    }
    if (!confirmed) {
      setError("請勾選「本人確認以上為個人實際情況」。");
      return;
    }

    const categoryOthers: Record<string, string> = {};
    for (const group of TOOL_GROUPS) {
      if (toolCategoryOtherOn[group.id]) {
        categoryOthers[group.id] =
          (toolCategoryOtherText[group.id] ?? "").trim() || "";
      }
    }

    setState("submitting");
    const payload = {
      department: department || null,
      jobTitle: jobTitle.trim() || null,
      contact: contact.trim() || null,
      workTypes: workTypes.includes("其他")
        ? workTypes
        : workTypeOther.trim()
          ? [...workTypes, "其他"]
          : workTypes,
      workTypeOther: workTypes.includes("其他")
        ? workTypeOther.trim() || null
        : null,
      workSummary: workSummary.trim() || null,
      timeSinks: timeSinks.includes("其他")
        ? timeSinks
        : timeSinkOther.trim()
          ? [...timeSinks, "其他"]
          : timeSinks,
      timeSinkOther: timeSinks.includes("其他")
        ? timeSinkOther.trim() || null
        : null,
      topImprove: topImprove.trim() || null,
      familiarity,
      tools: skipUsage ? [] : tools,
      toolCategoryOthers: skipUsage ? {} : categoryOthers,
      toolOther: skipUsage
        ? null
        : miscToolOtherOn
          ? miscToolOther.trim() || null
          : null,
      miscToolOtherOn: skipUsage ? false : miscToolOtherOn,
      speechTool: skipUsage ? null : speechTool.trim() || null,
      noAi: skipUsage ? noAi || SKIP_USAGE_VALUES.has(familiarity) : noAi,
      unsureTool: skipUsage ? false : unsureTool,
      usageFreq: skipUsage ? null : usageFreq || null,
      accounts: skipUsage ? [] : accounts,
      usageNotes: skipUsage ? null : usageNotes.trim() || null,
      wishes: wishes.includes("其他")
        ? wishes
        : wishOther.trim()
          ? [...wishes, "其他"]
          : wishes,
      wishOther: wishes.includes("其他") ? wishOther.trim() || null : null,
      willingness,
      concerns: concerns.includes("其他")
        ? concerns
        : concernOther.trim()
          ? [...concerns, "其他"]
          : concerns,
      concernOther: concerns.includes("其他")
        ? concernOther.trim() || null
        : null,
      preferences,
      prefOther: preferences.includes("other_intl")
        ? prefOther.trim() || null
        : null,
      importance,
      urgency,
      priority1: priorityNone ? null : priority1.trim() || null,
      priority2: priorityNone ? null : priority2.trim() || null,
      priorityNone,
      suggestions: suggestions.trim() || null,
      confirmed,
      remark: remark.trim() || null,
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, ...payload }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "送出失敗，請稍後再試。");
      }
      setState("success");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "送出失敗，請稍後再試。");
    }
  }

  if (state === "success") {
    return (
      <section className="panel success" aria-live="polite">
        <div className="success-badge" aria-hidden>
          ✓
        </div>
        <h1>已成功送出，謝謝你！</h1>
        <p>
          你的回覆已記錄，僅用於公司 AI 工具統一採購與導入規劃，不作個別績效考核依據。
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <section className="panel">
        <h2>一、填表人資訊</h2>
        <p className="hint">姓名為必填；部門、職位為選填。</p>
        <div className="field">
          <label className="field-label" htmlFor="name">
            姓名<span className="req">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入姓名"
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="department">
            部門／中心<span className="opt">（選填）</span>
          </label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">未填寫</option>
            {DEPARTMENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="jobTitle">
            職位或主要工作<span className="opt">（選填）</span>
          </label>
          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="例如：行政專員"
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="contact">
            聯絡方式<span className="opt">（選填）</span>
          </label>
          <input
            id="contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="郵箱／分機"
          />
        </div>
      </section>

      <section className="panel">
        <h2>二、你的日常工作（先不用想 AI）</h2>
        <div className="field">
          <div className="field-label">主要工作類型（可複選）</div>
          <div className="choices">
            {WORK_TYPES.map((item) => (
              <label key={item} className="choice">
                <input
                  type="checkbox"
                  checked={workTypes.includes(item)}
                  onChange={() => setWorkTypes(toggle(workTypes, item))}
                />
                <span>{item}</span>
              </label>
            ))}
            <OtherExplain
              checked={workTypes.includes("其他")}
              onToggle={() => setWorkTypes(toggle(workTypes, "其他"))}
              value={workTypeOther}
              onChange={setWorkTypeOther}
              placeholder="請說明其他工作類型"
            />
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="workSummary">
            一句話說明你平常主要在做什麼
            <span className="opt">（選填）</span>
          </label>
          <input
            id="workSummary"
            type="text"
            value={workSummary}
            onChange={(e) => setWorkSummary(e.target.value)}
          />
        </div>
        <div className="field">
          <div className="field-label">
            哪些工作比較費時間、經常重複，或容易出錯？（可複選）
          </div>
          <div className="choices">
            {TIME_SINKS.map((item) => (
              <label key={item} className="choice">
                <input
                  type="checkbox"
                  checked={timeSinks.includes(item)}
                  onChange={() => setTimeSinks(toggle(timeSinks, item))}
                />
                <span>{item}</span>
              </label>
            ))}
            <OtherExplain
              checked={timeSinks.includes("其他")}
              onToggle={() => setTimeSinks(toggle(timeSinks, "其他"))}
              value={timeSinkOther}
              onChange={setTimeSinkOther}
              placeholder="請說明其他情況"
            />
            {TIME_SINKS_TAIL.map((item) => (
              <label key={item} className="choice">
                <input
                  type="checkbox"
                  checked={timeSinks.includes(item)}
                  onChange={() => setTimeSinks(toggle(timeSinks, item))}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="topImprove">
            若只能先改善一件，你最希望是哪一件？
            <span className="opt">（選填）</span>
          </label>
          <input
            id="topImprove"
            type="text"
            value={topImprove}
            onChange={(e) => setTopImprove(e.target.value)}
          />
        </div>
      </section>

      <section className="panel">
        <h2>三、你對 AI 有多熟悉？（單選）</h2>
        <p className="hint">不用擔心「答錯」——我們需要的是真實現況。</p>
        <div className="choices">
          {FAMILIARITY.map((item) => (
            <label key={item.value} className="choice">
              <input
                type="radio"
                name="familiarity"
                checked={familiarity === item.value}
                onChange={() => setFamiliarity(item.value)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>四、目前使用情況</h2>
        {skipUsage ? (
          <p className="skip-note">
            依你在第三題的選擇，本大題可整題跳過；請直接填第五題起——你的需求與顧慮一樣重要。
          </p>
        ) : (
          <>
            <p className="hint">
              你用過哪些 AI 工具？（可複選；僅列國外主流工具）
            </p>
            <div className="tool-grid">
              {TOOL_GROUPS.map((group) => (
                <div key={group.id} className="tool-block">
                  <h3>{group.title}</h3>
                  <p>{group.blurb}</p>
                  <div className="choices">
                    {group.options.map((item) => (
                      <label key={item} className="choice">
                        <input
                          type="checkbox"
                          checked={tools.includes(item)}
                          onChange={() => setTools(toggle(tools, item))}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                    {group.id === "translate" && (
                      <div>
                        <label className="choice">
                          <input
                            type="checkbox"
                            checked={
                              Boolean(speechTool) || tools.includes("語音轉寫")
                            }
                            onChange={() => {
                              if (tools.includes("語音轉寫")) {
                                setTools(
                                  tools.filter((t) => t !== "語音轉寫"),
                                );
                                setSpeechTool("");
                              } else {
                                setTools([...tools, "語音轉寫"]);
                              }
                            }}
                          />
                          <span>語音轉寫（請說明）</span>
                        </label>
                        {(tools.includes("語音轉寫") || speechTool) && (
                          <input
                            className="inline-other"
                            type="text"
                            value={speechTool}
                            onChange={(e) => setSpeechTool(e.target.value)}
                            placeholder="語音轉寫工具名稱"
                          />
                        )}
                      </div>
                    )}
                    <OtherExplain
                      checked={Boolean(toolCategoryOtherOn[group.id])}
                      onToggle={() =>
                        setToolCategoryOtherOn((prev) => ({
                          ...prev,
                          [group.id]: !prev[group.id],
                        }))
                      }
                      value={toolCategoryOtherText[group.id] ?? ""}
                      onChange={(value) =>
                        setToolCategoryOtherText((prev) => ({
                          ...prev,
                          [group.id]: value,
                        }))
                      }
                      placeholder={`請說明其他${group.title}`}
                    />
                  </div>
                </div>
              ))}
              <div className="tool-block">
                <h3>其他／不確定</h3>
                <div className="choices">
                  <label className="choice">
                    <input
                      type="checkbox"
                      checked={unsureTool}
                      onChange={() => setUnsureTool(!unsureTool)}
                    />
                    <span>不確定名稱，但用過類似工具</span>
                  </label>
                  <OtherExplain
                    checked={miscToolOtherOn}
                    onToggle={() => setMiscToolOtherOn(!miscToolOtherOn)}
                    value={miscToolOther}
                    onChange={setMiscToolOther}
                    placeholder="請說明其他工具"
                  />
                  <label className="choice">
                    <input
                      type="checkbox"
                      checked={noAi}
                      onChange={() => setNoAi(!noAi)}
                    />
                    <span>目前未使用任何 AI</span>
                  </label>
                </div>
              </div>
            </div>
            {!noAi && (
              <>
                <div className="field" style={{ marginTop: "1rem" }}>
                  <div className="field-label">大概多常在工作上用？（單選）</div>
                  <div className="choices">
                    {USAGE_FREQ.map((item) => (
                      <label key={item} className="choice">
                        <input
                          type="radio"
                          name="usageFreq"
                          checked={usageFreq === item}
                          onChange={() => setUsageFreq(item)}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <div className="field-label">帳號大概是？（可複選）</div>
                  <div className="choices">
                    {ACCOUNT_TYPES.map((item) => (
                      <label key={item} className="choice">
                        <input
                          type="checkbox"
                          checked={accounts.includes(item)}
                          onChange={() => setAccounts(toggle(accounts, item))}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="usageNotes">
                    主要拿來做什麼？好用或不滿意的地方？
                    <span className="opt">（選填）</span>
                  </label>
                  <textarea
                    id="usageNotes"
                    value={usageNotes}
                    onChange={(e) => setUsageNotes(e.target.value)}
                  />
                </div>
              </>
            )}
          </>
        )}
      </section>

      <section className="panel">
        <h2>五、就算還沒用過，你希望 AI 能幫什麼？</h2>
        <div className="field">
          <div className="field-label">
            若有簡單好用的助手，會想試試看的項目（可複選）
          </div>
          <div className="choices">
            {WISHES.map((item) => (
              <label key={item} className="choice">
                <input
                  type="checkbox"
                  checked={wishes.includes(item)}
                  onChange={() => setWishes(toggle(wishes, item))}
                />
                <span>{item}</span>
              </label>
            ))}
            <OtherExplain
              checked={wishes.includes("其他")}
              onToggle={() => setWishes(toggle(wishes, "其他"))}
              value={wishOther}
              onChange={setWishOther}
              placeholder="請說明其他需求"
            />
            {WISHES_TAIL.map((item) => (
              <label key={item} className="choice">
                <input
                  type="checkbox"
                  checked={wishes.includes(item)}
                  onChange={() => setWishes(toggle(wishes, item))}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="field-label">
            若公司提供工具與簡單教學，你的意願最接近？（單選）
          </div>
          <div className="choices">
            {WILLINGNESS.map((item) => (
              <label key={item} className="choice">
                <input
                  type="radio"
                  name="willingness"
                  checked={willingness === item}
                  onChange={() => setWillingness(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>六、顧慮與需要的協助（可複選）</h2>
        <div className="choices">
          {CONCERNS.map((item) => (
            <label key={item} className="choice">
              <input
                type="checkbox"
                checked={concerns.includes(item)}
                onChange={() => setConcerns(toggle(concerns, item))}
              />
              <span>{item}</span>
            </label>
          ))}
          <OtherExplain
            checked={concerns.includes("其他")}
            onToggle={() => setConcerns(toggle(concerns, "其他"))}
            value={concernOther}
            onChange={setConcernOther}
            placeholder="請說明其他顧慮"
          />
          {CONCERNS_TAIL.map((item) => (
            <label key={item} className="choice">
              <input
                type="checkbox"
                checked={concerns.includes(item)}
                onChange={() => setConcerns(toggle(concerns, item))}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>七、未來工具偏好與採購優先</h2>
        <div className="field">
          <div className="field-label">若公司統一提供，你較想先有哪些？（可複選）</div>
          <div className="choices">
            {PREFERENCES.filter(
              (item) =>
                item.value !== "no_preference" && item.value !== "unsure",
            ).map((item) => (
              <label key={item.value} className="choice">
                <input
                  type="checkbox"
                  checked={preferences.includes(item.value)}
                  onChange={() =>
                    setPreferences(toggle(preferences, item.value))
                  }
                />
                <span>{item.label}</span>
              </label>
            ))}
            <OtherExplain
              checked={preferences.includes("other_intl")}
              onToggle={() =>
                setPreferences(toggle(preferences, "other_intl"))
              }
              value={prefOther}
              onChange={setPrefOther}
              label="其他國際主流工具（請說明）"
              placeholder="請寫工具名稱"
            />
            {PREFERENCES.filter(
              (item) =>
                item.value === "no_preference" || item.value === "unsure",
            ).map((item) => (
              <label key={item.value} className="choice">
                <input
                  type="checkbox"
                  checked={preferences.includes(item.value)}
                  onChange={() =>
                    setPreferences(toggle(preferences, item.value))
                  }
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="field-label">
            對你日常工作的重要程度（單選，5＝極重要）
          </div>
          <div className="choices">
            {SCALE.map((item) => (
              <label key={`imp-${item}`} className="choice">
                <input
                  type="radio"
                  name="importance"
                  checked={importance === item}
                  onChange={() => setImportance(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="field-label">
            希望公司盡快統一採購的急迫性（單選，5＝越快越好）
          </div>
          <div className="choices">
            {SCALE.map((item) => (
              <label key={`urg-${item}`} className="choice">
                <input
                  type="radio"
                  name="urgency"
                  checked={urgency === item}
                  onChange={() => setUrgency(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="field-label">
            若公司只能先買 1–2 種，你最希望優先的是？
          </div>
          <label className="choice">
            <input
              type="checkbox"
              checked={priorityNone}
              onChange={() => setPriorityNone(!priorityNone)}
            />
            <span>無特定偏好，接受公司統一選定</span>
          </label>
          {!priorityNone && (
            <>
              <input
                style={{ marginTop: "0.55rem" }}
                type="text"
                value={priority1}
                onChange={(e) => setPriority1(e.target.value)}
                placeholder="1（最優先）"
              />
              <input
                style={{ marginTop: "0.55rem" }}
                type="text"
                value={priority2}
                onChange={(e) => setPriority2(e.target.value)}
                placeholder="2"
              />
            </>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>八、其他建議</h2>
        <label className="field-label" htmlFor="suggestions">
          其他建議<span className="opt">（選填）</span>
        </label>
        <textarea
          id="suggestions"
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
          placeholder="可寫 1–2 點"
        />
      </section>

      <section className="panel">
        <h2>九、填表確認</h2>
        <label className="choice">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={() => setConfirmed(!confirmed)}
          />
          <span>
            本人確認以上為個人實際情況（或真實需求／顧慮）
            <span className="req">*</span>
          </span>
        </label>
        <div className="field" style={{ marginTop: "0.85rem" }}>
          <label className="field-label" htmlFor="remark">
            備註<span className="opt">（選填）</span>
          </label>
          <input
            id="remark"
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>
        <div className="actions">
          <button type="submit" disabled={state === "submitting"}>
            {state === "submitting" ? "送出中…" : "送出調查表"}
          </button>
        </div>
        {error && <div className="error-box">{error}</div>}
      </section>

      <p className="footer-note">
        本調查表為入門友善版；對象為各單位個別員工，不含 IT
        部。收集結果僅用於公司 AI 工具統一採購與導入規劃。
      </p>
    </form>
  );
}
