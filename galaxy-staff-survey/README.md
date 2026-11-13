# 銀河電訊｜員工 AI 工作需求調查

員工填寫用繁中表單。**公開連結即可填寫，無需登入、無需 Cursor 帳號。****姓名必填**；**部門、職位選填**。回覆存入 Postgres（本機開發用 PGlite）。

## 路徑

| 路徑 | 用途 |
|------|------|
| `/` | **公開**員工填寫（無 Cursor 登入牆；需 Publish = Public） |
| `/admin` | 管理：檢視回覆、下載 CSV（**僅**需 `ADMIN_KEY` 標頭） |
| `/api/admin/responses` | JSON／CSV 匯出（標頭 `x-admin-key`） |

## 可見性

匿名同事要能直接開表，請在 Cursor **Publish Settings** 選 **Public**。Private／Team 會先要求 Cursor 登入。

正式網址：https://galaxy-staff-ai-survey.apps.grok.bot

## Joe 如何收集結果

1. Publish Settings = **Public**
2. Cursor Secrets 已設定 `ADMIN_KEY`
3. 開啟 `/admin`，輸入密鑰載入／下載 CSV

本倉庫**不打包**真實員工回覆種子檔。若正式庫需補回歷史回覆，請用 Project store 匯出（`docs/ai-survey-responses-export.csv`）在管理端另行匯入，或請同事重新填寫。

## 本機

```bash
env -u DATABASE_URL ADMIN_KEY="$ADMIN_KEY" npm run dev
```

## 發布注意

此應用宣告 Postgres（`cursor-app.json`）。`publish-app` 更新可能保留既有可見性——若仍是 Private，請在 Publish Settings **改為 Public**。
