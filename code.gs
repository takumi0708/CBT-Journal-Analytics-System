/*
流れ
ーフォームからスプレッドシートに保存されたデータを取得
ー必要な日付情報に加工
ーnotion API とnotion DBと接続
ー必要なフォーマットにしてデータ形成
ーAPI通じて、JSONに変換して送信
ーエラーハンドリング
*/

function onFormSubmit(e) {
  // =========================
  // 1. フォーム回答を取得
  // =========================

  const timestamp = e.values[0];
  const journal = e.values[1];

  if (!journal) {
    throw new Error("ジャーナル本文がありません。");
  }

  // =========================
  // 2. 日付を作成
  // =========================

  const date = new Date(timestamp);

  const formattedDate = Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );

  const title = formattedDate + " Daily";

  // =========================
  // 3. Script Properties取得
  // =========================

  const properties =
    PropertiesService.getScriptProperties();

  const notionToken =
    properties.getProperty("NOTION_TOKEN");

  const databaseId =
    properties.getProperty("NOTION_DATABASE_ID");

  if (!notionToken) {
    throw new Error("NOTION_TOKEN がありません。");
  }

  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID がありません。");
  }

  // =========================
  // 4. ジャーナルを2000文字以下に分割
  // =========================

  const journalChunks = splitText(journal, 1900);

  // Journal見出し
  const children = [
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "Journal"
            }
          }
        ]
      }
    }
  ];

  // 分割した本文をparagraphとして追加
  journalChunks.forEach(chunk => {
    children.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: chunk
            }
          }
        ]
      }
    });
  });

  // =========================
  // 5. Notionへ送るデータ
  // =========================

  const payload = {
    parent: {
      database_id: databaseId
    },

    properties: {
      "タイトル": {
        title: [
          {
            text: {
              content: title
            }
          }
        ]
      },

      "日付": {
        date: {
          start: formattedDate
        }
      },

      "種別": {
        select: {
          name: "Daily"
        }
      }
    },

    children: children
  };

  // =========================
  // 6. Notion APIへ送信
  // =========================

  const response = UrlFetchApp.fetch(
    "https://api.notion.com/v1/pages",
    {
      method: "post",

      headers: {
        "Authorization": "Bearer " + notionToken,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },

      payload: JSON.stringify(payload),

      muteHttpExceptions: true
    }
  );

  // =========================
  // 7. 結果確認
  // =========================

  const statusCode =
    response.getResponseCode();

  const responseText =
    response.getContentText();

  Logger.log(
    "statusCode: " + statusCode
  );

  Logger.log(
    responseText
  );

  if (
    statusCode < 200 ||
    statusCode >= 300
  ) {
    throw new Error(
      "Notion API エラー: " +
      responseText
    );
  }

  Logger.log(
    "Notionへの保存に成功しました。"
  );
}


// ====================================
// 長い文章を指定文字数以下に分割する
// ====================================

function splitText(text, maxLength) {
  const chunks = [];

  for (
    let i = 0;
    i < text.length;
    i += maxLength
  ) {
    chunks.push(
      text.substring(
        i,
        i + maxLength
      )
    );
  }

  return chunks;
}
