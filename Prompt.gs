
/**
 * Google SheetsからCBTプロンプトを取得
 */
function getCBTPrompt() {

  // 日記と同じスプレッドシートを取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // プロンプト専用シートを取得
  const sheet = ss.getSheetByName(
    CONFIG.PROMPT_SHEET_NAME
  );

  if (!sheet) {
    throw new Error("Promptシートが見つかりません");
  }

  // A1に保存されたプロンプトを取得
  const prompt = String(
    sheet.getRange(CONFIG.PROMPT_CELL).getValue()
  ).trim();

  if (!prompt) {
    throw new Error("CBTプロンプトが空です");
  }

  return prompt;
}
