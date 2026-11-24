
/**
 * Config.gs
 *
 * アプリ全体の設定を一元管理する。
 * APIキーなどの秘密情報は
 * スクリプトプロパティから取得する。
 */

const CONFIG = {

  // ==========================================
  // 1. Google Sheets（日記データ）
  // ==========================================

  // Googleフォームの回答シート名
  SHEET_NAME: "フォームの回答 1",

  // フォームの回答列
  DATE_COLUMN: "タイムスタンプ",

  // B1セルの質問文と完全一致させる
  DIARY_COLUMN: "今日考えたこと、感じたこと、起きたことなどを自由に書いてください。",

  // GASが自動作成する管理列
  STATUS_COLUMN: "分析状態",
  ANALYSIS_COLUMN: "AI分析結果",
  NOTION_URL_COLUMN: "Notion URL",


  // ==========================================
  // 2. CBT分析プロンプト
  // ==========================================

  // プロンプトを保存しているシート
  PROMPT_SHEET_NAME: "Prompt",

  // プロンプト全文を記載するセル
  PROMPT_CELL: "A1",


  // ==========================================
  // 3. Gemini API
  // ==========================================

  // 動作確認済みのモデル
  MODEL: "gemini-3.8-flash",


  // ==========================================
  // 4. Notion API
  // ==========================================

  NOTION_VERSION: "2022-06-28",

  // Notionデータベースのプロパティ名
  NOTION_TITLE_COLUMN: "タイトル",
  NOTION_DATE_COLUMN: "日付",
  NOTION_TYPE_COLUMN: "種別",

  // セレクトプロパティの値
  NOTION_TYPE_VALUE: "Daily",


  // ==========================================
  // 5. その他
  // ==========================================

  TIMEZONE: "Asia/Tokyo"

};


// ==========================================
// 6. スクリプトプロパティ取得
// ==========================================

/**
 * GASのスクリプトプロパティから
 * APIキーなどを取得する。
 *
 * @param {string} key プロパティ名
 * @return {string} 設定値
 */
function getSecret(key) {

  const value = PropertiesService
    .getScriptProperties()
    .getProperty(key);

  if (!value) {
    throw new Error(`${key} が未設定です`);
  }

  return value;
}


// ==========================================
// 7. 日付変換
// ==========================================

/**
 * 日付を YYYY-MM-DD に統一する。
 *
 * @param {Date|string} date 日付
 * @return {string} 変換後の日付
 */
function formatDate(date) {

  return Utilities.formatDate(
    new Date(date),
    CONFIG.TIMEZONE,
    "yyyy-MM-dd"
  );
}
