
/**
 * ① 日記入力リマインドメール
 * 毎日17時頃に送信
 */
function sendJournalFormEmail() {

  const properties = PropertiesService.getScriptProperties();

  const email = properties.getProperty("JOURNAL_EMAIL");
  const formUrl = properties.getProperty("JOURNAL_FORM_URL");

  if (!email || !formUrl) {
    throw new Error("メール設定が不足しています");
  }

  const subject = "今日のジャーナル";

  const body = `
今日のジャーナルを書きましょう。

Google Form：
${formUrl}
  `;

  GmailApp.sendEmail(email, subject, body);
}


/**
 * ② Geminiによる分析結果の通知
 * フォーム送信後の分析完了時に実行
 */
function sendAnalysisEmail(date, analysis, notionUrl) {

  const email = PropertiesService
    .getScriptProperties()
    .getProperty("JOURNAL_EMAIL");

  if (!email) {
    throw new Error("JOURNAL_EMAILが設定されていません");
  }

  const subject = `【CBT日記分析】${date}`;

  const body = `
${date} のCBT分析結果

${analysis}

--------------------------

Notionレポート：
${notionUrl}
`;

  GmailApp.sendEmail(email, subject, body);
}
