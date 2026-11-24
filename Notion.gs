
/**
 * Notion.gs
 *
 * GeminiによるCBT分析結果を
 * Notionの「CBT Journal Reports」に保存する。
 *
 * 必要なスクリプトプロパティ：
 * - NOTION_TOKEN
 * - NOTION_DATABASE_ID
 *
 * Notionのデータベース構造：
 * - タイトル（title）
 * - 日付（date）
 * - 種別（select）
 *
 * Summary 1（Notion AI）は使用しない。
 */


// ==========================================
// 1. 長い文章を分割する
// ==========================================

/**
 * Notionのrich_textには文字数制限があるため、
 * 分析結果を分割する。
 *
 * @param {string} text 分析結果
 * @param {number} size 分割する文字数
 * @return {string[]} 分割した文字列
 */
function splitText(text, size = 1800) {

  const chunks = [];
  let current = "";

  // UTF-16コード単位で2000を超えないよう分割
  for (const char of text) {

    if (current.length + char.length > size) {
      chunks.push(current);
      current = "";
    }

    current += char;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}


// ==========================================
// 2. MarkdownをNotionブロックに変換
// ==========================================

/**
 * GeminiのMarkdown形式の出力を
 * Notionの見出し・段落ブロックに変換する。
 *
 * 対応形式：
 * # 見出し1
 * ## 見出し2
 * ### 見出し3
 * 通常の文章
 *
 * @param {string} markdown Geminiの分析結果
 * @return {Object[]} Notionブロック配列
 */
function markdownToNotionBlocks(markdown) {

  const blocks = [];

  const lines = markdown.split(/\r?\n/);

  for (const line of lines) {

    // 空行はスキップ
    if (!line.trim()) continue;

    let type = "paragraph";
    let content = line;

    // Markdownの見出しを判定
    if (line.startsWith("### ")) {
      type = "heading_3";
      content = line.slice(4);

    } else if (line.startsWith("## ")) {
      type = "heading_2";
      content = line.slice(3);

    } else if (line.startsWith("# ")) {
      type = "heading_1";
      content = line.slice(2);
    }

    // Notionのrich_text形式に変換
    const richText = splitText(content).map(chunk => ({
      type: "text",
      text: {
        content: chunk
      }
    }));

    blocks.push({
      object: "block",
      type: type,
      [type]: {
        rich_text: richText
      }
    });
  }

  return blocks;
}


// ==========================================
// 3. Notionに分析結果を保存
// ==========================================

/**
 * Geminiの分析結果をNotionに保存する。
 *
 * @param {string} date YYYY-MM-DD形式の日付
 * @param {string} analysis Geminiの分析結果
 * @return {string} 作成したNotionページのURL
 */
function saveToNotion(date, analysis) {

  // ----------------------------------------
  // ① 認証情報を取得
  // ----------------------------------------

  const token = getSecret("NOTION_TOKEN");

  const databaseId = getSecret("NOTION_DATABASE_ID");

  if (!analysis || !analysis.trim()) {
    throw new Error("分析結果が空です");
  }


  // ----------------------------------------
  // ② Geminiの分析結果をブロックに変換
  // ----------------------------------------

  const children = markdownToNotionBlocks(analysis);

  // Notion APIは1回の作成リクエストで
  // 子ブロックを最大100個まで指定可能
  if (children.length > 100) {
    throw new Error(
      "Notionのブロック数が100個を超えています"
    );
  }


  // ----------------------------------------
  // ③ Notionデータベースのプロパティ
  // ----------------------------------------

  // CONFIGの名前に依存せず、
  // 実際のNotionプロパティ名を明示する
  const properties = {

    // タイトル列
    "タイトル": {
      title: [{
        text: {
          content: `${date} Daily`
        }
      }]
    },

    // 日付列
    "日付": {
      date: {
        start: date
      }
    },

    // 種別列
    "種別": {
      select: {
        name: "Daily"
      }
    }

  };


  // ----------------------------------------
  // ④ Notion APIへ送信するデータ
  // ----------------------------------------

  const payload = {
    parent: {
      database_id: databaseId
    },

    properties: properties,

    // 分析結果をページ本文に保存
    children: children
  };


  // ----------------------------------------
  // ⑤ Notion APIを呼び出す
  // ----------------------------------------

  const url = "https://api.notion.com/v1/pages";

  const response = UrlFetchApp.fetch(url, {

    method: "post",

    contentType: "application/json",

    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28"
    },

    payload: JSON.stringify(payload),

    // エラー時にもレスポンスを取得
    muteHttpExceptions: true

  });


  // ----------------------------------------
  // ⑥ APIレスポンスを確認
  // ----------------------------------------

  const status = response.getResponseCode();

  const responseText = response.getContentText();

  if (status !== 200) {
    throw new Error(
      `Notion API エラー (${status}): ${responseText}`
    );
  }


  // ----------------------------------------
  // ⑦ 作成したページのURLを返す
  // ----------------------------------------

  const result = JSON.parse(responseText);

  console.log("Notion保存成功");

  return result.url;
}
