
// スプレッドシートを取得
function getDiarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    throw new Error("日記のシートが見つかりません");
  }

  return sheet;
}


// 列名から列番号を取得
// GASのgetRangeは1列目を1として扱う
function getColumnMap(sheet) {

  const headers = sheet.getRange(
    1, 1, 1, sheet.getLastColumn()
  ).getValues()[0];

  const map = {};

  headers.forEach((name, index) => {
    map[String(name).trim()] = index + 1;
  });

  return map;
}


// 処理状態を保存する列を用意
function prepareDiarySheet(sheet) {

  const required = [
    CONFIG.STATUS_COLUMN,
    CONFIG.ANALYSIS_COLUMN,
    CONFIG.NOTION_URL_COLUMN
  ];

  let columns = getColumnMap(sheet);

  required.forEach(name => {

    if (!columns[name]) {
      const nextCol = sheet.getLastColumn() + 1;

      sheet.getRange(1, nextCol).setValue(name);

      columns[name] = nextCol;
    }

  });

  return columns;
}


// 今日の最新日記を1件取得
function getTodayDiary() {

  const sheet = getDiarySheet();
  const columns = prepareDiarySheet(sheet);

  const dateCol = columns[CONFIG.DATE_COLUMN];
  const diaryCol = columns[CONFIG.DIARY_COLUMN];

  if (!dateCol || !diaryCol) {
    throw new Error("日記またはタイムスタンプ列がありません");
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return null;

  const rows = sheet.getRange(
    2, 1,
    lastRow - 1,
    sheet.getLastColumn()
  ).getValues();

  const today = formatDate(new Date());

  // 下から探して今日の最新の記録を取得
  for (let i = rows.length - 1; i >= 0; i--) {

    const row = rows[i];

    const timestamp = row[dateCol - 1];
    const diary = String(row[diaryCol - 1] || "").trim();

    if (!timestamp || !diary) continue;
    if (formatDate(timestamp) !== today) continue;

    return {
      date: today,
      diary: diary,
      rowNumber: i + 2,
      sheet: sheet,
      columns: columns,

      status: row[columns[CONFIG.STATUS_COLUMN] - 1],
      analysis: row[columns[CONFIG.ANALYSIS_COLUMN] - 1],
      notionUrl: row[columns[CONFIG.NOTION_URL_COLUMN] - 1]
    };
  }

  return null;
}


// 処理結果を指定の列に保存
// 分析状態などを書き込む
function updateDiary(data, columnName, value) {

  const col = data.columns[columnName];

  if (!col) {
    throw new Error(`列が存在しません: ${columnName}`);
  }

  data.sheet.getRange(
    data.rowNumber,
    col
  ).setValue(value);

  SpreadsheetApp.flush();
}
