"use client";

import { FormEvent, useMemo, useState } from "react";

type ResponseRow = {
  id: string;
  createdAt: string;
  name: string;
  department: string | null;
  jobTitle: string | null;
  contact: string | null;
  payload: Record<string, unknown>;
};

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [rows, setRows] = useState<ResponseRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const countLabel = useMemo(
    () => (loaded ? `共 ${rows.length} 筆` : ""),
    [loaded, rows.length],
  );

  async function load(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/responses", {
        headers: { "x-admin-key": key },
        cache: "no-store",
      });
      const data = (await res.json()) as {
        error?: string;
        responses?: ResponseRow[];
      };
      if (!res.ok) {
        throw new Error(data.error || "無法讀取");
      }
      setRows(data.responses ?? []);
      setLoaded(true);
    } catch (err) {
      setLoaded(false);
      setRows([]);
      setError(err instanceof Error ? err.message : "無法讀取");
    } finally {
      setLoading(false);
    }
  }

  async function downloadCsv() {
    setError("");
    try {
      const res = await fetch("/api/admin/responses?format=csv", {
        headers: { "x-admin-key": key },
        cache: "no-store",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "無法下載");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-survey-responses.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "無法下載");
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <h1 className="brand">
          <span>Galaxy Telecom</span>
          調查結果管理
        </h1>
        <p className="lede">
          輸入共享密鑰（ADMIN_KEY）即可檢視與匯出員工 AI 調查回覆。請勿公開此頁密鑰。
        </p>
      </header>

      <section className="panel">
        <form onSubmit={load}>
          <div className="field">
            <label className="field-label" htmlFor="adminKey">
              管理密鑰
            </label>
            <input
              id="adminKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="貼上 ADMIN_KEY"
              autoComplete="off"
            />
          </div>
          <div className="actions">
            <button type="submit" disabled={loading || !key.trim()}>
              {loading ? "載入中…" : "載入回覆"}
            </button>
            <button
              type="button"
              disabled={!key.trim()}
              onClick={downloadCsv}
              style={{
                appearance: "none",
                border: "1px solid #0e6e8c",
                borderRadius: 999,
                background: "#fff",
                color: "#0a4f66",
                font: "inherit",
                fontWeight: 700,
                padding: "0.85rem 1.2rem",
                cursor: key.trim() ? "pointer" : "not-allowed",
              }}
            >
              下載 CSV
            </button>
            {countLabel && <span className="opt">{countLabel}</span>}
          </div>
          {error && <div className="error-box">{error}</div>}
        </form>
      </section>

      {loaded && (
        <section className="panel">
          <h2>回覆列表</h2>
          {rows.length === 0 ? (
            <p className="hint">目前尚無回覆。</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.92rem",
                }}
              >
                <thead>
                  <tr>
                    {["時間", "姓名", "部門", "職位", "摘要"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #d5e0ea",
                          padding: "0.55rem 0.4rem",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td style={{ padding: "0.55rem 0.4rem", verticalAlign: "top" }}>
                        {new Date(row.createdAt).toLocaleString("zh-HK")}
                      </td>
                      <td style={{ padding: "0.55rem 0.4rem", verticalAlign: "top" }}>
                        {row.name}
                      </td>
                      <td style={{ padding: "0.55rem 0.4rem", verticalAlign: "top" }}>
                        {row.department || "—"}
                      </td>
                      <td style={{ padding: "0.55rem 0.4rem", verticalAlign: "top" }}>
                        {row.jobTitle || "—"}
                      </td>
                      <td style={{ padding: "0.55rem 0.4rem", verticalAlign: "top" }}>
                        <code style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>
                          {JSON.stringify(row.payload).slice(0, 180)}
                          {JSON.stringify(row.payload).length > 180 ? "…" : ""}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
