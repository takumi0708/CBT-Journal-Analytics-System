
/**
 * Main.gs
 *
 * Googleフォーム送信時に以下を実行する。
 *
 * 1. Google Sheetsから日記を取得
 * 2. Gemini APIでCBT分析
 * 3. Notionに分析結果を保存
 * 4. Gmailで分析結果を通知
 *
 * 既存ファイル：
 * Config.gs / Diary.gs / Prompt.gs
 * Gemini.gs / Notion.gs / Email.gs
 */


// ==========================================
// 1. フォーム送信イベント
// ==========================================

function onJournalSubmit(e) {

  // フォーム送信時のイベント情報を確認
  if (!e || !e.range) {
    throw new Error(
      "フォーム送信トリガーから実行してください"
    );
  }

  // 送信された回答行を取得
  const sheet = e.range.getSheet();
  const rowNumber = e.range.getRow();

  // 日記用シート以外は処理しない
  if (sheet.getName() !== CONFIG.SHEET_NAME) {
    return;
  }

  // 日記1件の処理を実行
  processJournalRow(sheet, rowNumber);
}


// ==========================================
// 2. 日記1件の分析・保存・通知
// ==========================================

function processJournalRow(sheet, rowNumber) {

  // 同時実行を防止
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    throw new Error("別の処理が実行中です");
  }

  try {

    // 管理用の列がなければ作成する
    const columns = prepareDiarySheet(sheet);

    const dateCol = columns[CONFIG.DATE_COLUMN];
    const diaryCol = columns[CONFIG.DIARY_COLUMN];

    if (!dateCol || !diaryCol) {
      throw new Error(
        "日記列またはタイムスタンプ列がありません"
      );
    }

    // 今回送信された行を取得
    const row = sheet.getRange(
      rowNumber,
      1,
      1,
      sheet.getLastColumn()
    ).getValues()[0];

    const timestamp = row[dateCol - 1];

    const diary = String(
      row[diaryCol - 1] || ""
    ).trim();

    if (!timestamp || !diary) {
      console.log("日記が空のためスキップ");
      return;
    }

    const date = formatDate(timestamp);

    // 処理状態・分析結果・Notion URLの列
    const statusCell = sheet.getRange(
      rowNumber,
      columns[CONFIG.STATUS_COLUMN]
    );

    const analysisCell = sheet.getRange(
      rowNumber,
      columns[CONFIG.ANALYSIS_COLUMN]
    );

    const notionCell = sheet.getRange(
      rowNumber,
      columns[CONFIG.NOTION_URL_COLUMN]
    );

    // 完了済みなら二重処理しない
    if (statusCell.getValue() === "完了") {
      console.log("すでに処理済みです");
      return;
    }

    // 保存済みデータを取得
    let analysis = String(
      analysisCell.getValue() || ""
    );

    let notionUrl = String(
      notionCell.getValue() || ""
    );

    // ======================================
    // Step 1. Geminiで分析
    // ======================================

    if (!analysis) {

      statusCell.setValue("Gemini分析中");
      SpreadsheetApp.flush();

      // Gemini.gsで定義した関数
      analysis = analyzeDiary(diary);

      // 分析結果をSheetsに保存
      analysisCell.setValue(analysis);
      SpreadsheetApp.flush();

      console.log("Gemini分析完了");
    }

    // ======================================
    // Step 2. Notionに保存
    // ======================================

    if (!notionUrl) {

      statusCell.setValue("Notion保存中");
      SpreadsheetApp.flush();

      // Notion.gsで定義した関数
      notionUrl = saveToNotion(date, analysis);

      // 作成したNotionページのURLを保存
      notionCell.setValue(notionUrl);
      SpreadsheetApp.flush();

      console.log("Notion保存完了");
    }

    // ======================================
    // Step 3. Gmailで通知
    // ======================================

    statusCell.setValue("メール送信中");
    SpreadsheetApp.flush();

    // Email.gsで定義した関数
    sendAnalysisEmail(
      date,
      analysis,
      notionUrl
    );

    // ======================================
    // Step 4. 完了
    // ======================================

    statusCell.setValue("完了");
    statusCell.clearNote();

    console.log("日記の分析・保存・通知が完了しました");

  } catch (error) {

    // エラーをログに表示
    console.error(error);

    // Sheetsにエラー状態を記録
    try {

      const columns = getColumnMap(sheet);
      const statusCol = columns[CONFIG.STATUS_COLUMN];

      if (statusCol) {

        const cell = sheet.getRange(
          rowNumber,
          statusCol
        );

        cell.setValue("エラー");
        cell.setNote(String(error));
      }

    } catch (logError) {
      console.error(logError);
    }

    throw error;

  } finally {
    lock.releaseLock();
  }
}


// ==========================================
// 3. フォーム送信トリガー設定
// ==========================================

function setupFormTrigger() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 古いフォーム送信トリガーを削除
  const obsoleteFunctions = [
    "onFormSubmit",
    "onJournalSubmit"
  ];

  ScriptApp.getProjectTriggers()
    .filter(trigger =>
      obsoleteFunctions.includes(
        trigger.getHandlerFunction()
      )
    )
    .forEach(trigger =>
      ScriptApp.deleteTrigger(trigger)
    );

  // 新しいフォーム送信トリガーを作成
  ScriptApp.newTrigger("onJournalSubmit")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  console.log("フォーム送信トリガー設定完了");
}


// ==========================================
// 4. 最新の日記で手動テスト
// ==========================================

function testLatestJournal() {

  const sheet = getDiarySheet();

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error("日記データがありません");
  }

  // 最新行を対象に本番処理を実行
  processJournalRow(
    sheet,
    lastRow
  );
}


// ==========================================
// 5. 設定確認テスト
// ==========================================

function testJournalSettings() {

  const sheet = getDiarySheet();

  // 必要な列を作成・確認
  const columns = prepareDiarySheet(sheet);

  console.log("シート名:", sheet.getName());
  console.log("列一覧:", JSON.stringify(columns));

  // CBTプロンプトの取得確認
  const prompt = getCBTPrompt();

  console.log("プロンプト文字数:", prompt.length);

  // 秘密情報の存在確認
  const requiredSecrets = [
    "GEMINI_API_KEY",
    "NOTION_TOKEN",
    "NOTION_DATABASE_ID",
    "JOURNAL_EMAIL"
  ];

  requiredSecrets.forEach(key => {
    getSecret(key);
    console.log(`${key}: 設定済み`);
  });

  console.log("設定確認完了");
}
