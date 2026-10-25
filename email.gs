function sendJournalFormEmail() {
  
  // Script Propertiesから設定値を取得
  const properties = PropertiesService.getScriptProperties();

  const email = properties.getProperty("JOURNAL_EMAIL");
  const formUrl = properties.getProperty("JOURNAL_FORM_URL");

  // 設定漏れチェック
  if (!email) {
    throw new Error("JOURNAL_EMAIL が設定されていません。");
  }

  if (!formUrl) {
    throw new Error("JOURNAL_FORM_URL が設定されていません。");
  }

  const subject = "今日のジャーナル";

  const body = `
今日のジャーナルを書きましょう。

Google Form：
${formUrl}
  `;

  GmailApp.sendEmail(
    email,
    subject,
    body
  );
}