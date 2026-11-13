import SurveyForm from "@/components/SurveyForm";

export default function HomePage() {
  return (
    <main className="page">
      <header className="hero">
        <h1 className="brand">
          <span>Galaxy Telecom 銀河電訊</span>
          員工 AI 工作需求調查
        </h1>
        <p className="lede">
          了解同仁日常工作中費時、重複或難處理的地方，以及對 AI
          助手的熟悉程度與需求，供公司評估統一採購。
          <strong>公開填寫：無需 Cursor／公司帳號登入。</strong>
          <strong>沒用過 AI 也能填。</strong>
          請用日常語言描述實際工作即可，約需 8–12 分鐘。本表不作績效考核依據。
        </p>
        <div className="meta">
          <span>範圍：不含 IT 部</span>
          <span>工具範圍：國外主流 AI</span>
          <span>匿名可填（無需登入）</span>
        </div>
      </header>
      <SurveyForm />
    </main>
  );
}
