export const DEPARTMENTS = [
  "董事會／總裁層",
  "總裁辦公室",
  "財務部",
  "人力資源及行政部",
  "科技創新與發展中心",
  "產業拓展中心",
  "業務營運中心",
] as const;

export const WORK_TYPES = [
  "文書／郵件／會議",
  "財務／預算／報表",
  "人資／行政",
  "法務／合規／審計",
  "市場／營銷／文案",
  "客戶服務",
  "供應商／採購",
  "倉儲／物流",
  "質檢／QC",
  "專案／方案",
  "管理／協調",
] as const;

/** 費時工作主選項（「其他」插在其後；封閉收尾項另列） */
export const TIME_SINKS = [
  "寫作或修改郵件、通知、報告等文字",
  "翻譯或閱讀不同語言的郵件／文件",
  "閱讀長文件、整理重點，或比較兩份文件差異",
  "整理 Excel、彙總數字，或核對不同表格",
  "準備簡報、工作匯報或方案內容",
  "整理會議記錄、待辦事項（含錄音重聽整理）",
  "查找公司內部規定、產品資料或過往文件",
  "製作或修改圖片、海報、宣傳素材",
  "草擬客戶或供應商溝通內容",
] as const;

export const TIME_SINKS_TAIL = [
  "暫時沒有特別需要改善的工作",
  "不確定哪些工作可以改善",
] as const;

export const FAMILIARITY = [
  { value: "never", label: "我幾乎沒用過（含完全沒聽過怎麼用）" },
  { value: "seen_only", label: "聽過／看過別人用，自己幾乎沒試過" },
  { value: "personal", label: "私人偶爾試過（例如娛樂、學習），工作上很少用" },
  { value: "work_occasional", label: "工作上偶爾用過" },
  { value: "work_frequent", label: "工作上經常使用" },
] as const;

export const SKIP_USAGE_VALUES = new Set(["never", "seen_only"]);

export const TOOL_GROUPS = [
  {
    id: "chat",
    title: "聊天寫作助手",
    blurb: "用對話方式幫你寫／改文字、問問題",
    options: ["ChatGPT", "Claude", "Gemini", "Perplexity"],
  },
  {
    id: "office",
    title: "辦公軟體內的 AI",
    blurb: "在 Word／Excel／Outlook／Google 文件裡出現的助手",
    options: ["Microsoft Copilot", "Google Workspace Gemini", "Notion AI"],
  },
  {
    id: "image",
    title: "做圖／設計",
    blurb: "用文字描述產生或修改圖片",
    options: ["Midjourney", "DALL·E", "Canva AI"],
  },
  {
    id: "code",
    title: "寫程式輔助",
    blurb: "幫工程／技術同仁寫或改程式（多數人可略過）",
    options: ["GitHub Copilot", "Cursor"],
  },
  {
    id: "translate",
    title: "翻譯／語音",
    blurb: "翻譯或把說話轉成文字",
    options: ["DeepL"],
  },
] as const;

export type ToolGroupId = (typeof TOOL_GROUPS)[number]["id"];

export const USAGE_FREQ = [
  "幾乎每天",
  "每週幾次",
  "每月幾次",
  "偶爾試過",
  "目前沒在用／不適用",
] as const;

export const ACCOUNT_TYPES = [
  "個人免費",
  "個人自費",
  "單位／專案報銷",
  "公司統一帳號",
  "不清楚／不適用",
] as const;

/** 希望 AI 幫忙主選項（「其他」插在其後；封閉收尾項另列） */
export const WISHES = [
  "幫我起草或潤飾郵件、通知、報告",
  "幫我翻譯，或把外文重點整理成中文",
  "幫我讀長文件、抓重點、做摘要",
  "幫我整理表格、核對數字、做簡單匯總說明",
  "幫我想簡報大綱或匯報草稿",
  "幫我把會議內容整理成紀要／待辦",
  "幫我快速查找「規定／產品／舊文件」類資訊（在公司允許的範圍內）",
  "幫我做圖或排版初稿",
] as const;

export const WISHES_TAIL = [
  "暫時想不出來，但願意先看看示範",
  "目前覺得不太需要",
] as const;

export const WILLINGNESS = [
  "願意試用",
  "想先看「跟我工作有關」的示範再決定",
  "暫時不需要",
] as const;

export const CONCERNS = [
  "不知道能幫我哪些日常工作",
  "不會操作／希望有示範或短教學",
  "擔心結果不準，還要自己花時間改",
  "不清楚哪些公司資料可以／不可以貼上去",
  "擔心資料外洩或個資問題",
  "沒有公司統一帳號，自己申請／付費不方便",
  "中文（尤其繁體）或公司術語不好用",
  "沒時間嘗試新工具",
] as const;

export const CONCERNS_TAIL = ["目前沒有特別顧慮"] as const;

export const PREFERENCES = [
  {
    value: "ChatGPT",
    label: "ChatGPT（通用聊天寫作，適合起草、改寫、問問題）",
  },
  {
    value: "Claude",
    label: "Claude（擅長長文閱讀與整理、較細的文字工作）",
  },
  {
    value: "Gemini",
    label: "Gemini（Google 生態；可搭配文件／試算表）",
  },
  {
    value: "Microsoft Copilot",
    label: "Microsoft Copilot（嵌在 Word／Excel／Outlook／Teams 裡用）",
  },
  {
    value: "image_tools",
    label: "Midjourney／DALL·E／Canva AI（做圖、海報、簡報配圖）",
  },
  {
    value: "translate_tools",
    label: "DeepL 或語音轉寫類（翻譯／開會錄音轉文字）",
  },
  { value: "no_preference", label: "無特定偏好，接受公司統一選定" },
  { value: "unsure", label: "不清楚，想先看示範" },
] as const;

export const SCALE = ["1", "2", "3", "4", "5", "還不確定"] as const;
