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

  // =============================
  // 1. フォーム送信されたデータを取得
  // =============================

  // 例：
  // A列 = タイムスタンプ
  // B列 = ジャーナル本文

  const timestamp = e.values[0];
  const journal = e.values[1];

  if (!journal) {
    throw new Error("ジャーナル本文がありません。");
  }


  // =============================
  // 2. 日付を作る
  // =============================

  const date = new Date(timestamp);

  const formattedDate = Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );

  const title = formattedDate + " Daily";


  // =============================
  // 3. Notion設定
  // =============================

  const properties = PropertiesService.getScriptProperties();

  const notionToken =
    properties.getProperty("NOTION_TOKEN");

  const databaseId =
    properties.getProperty("NOTION_DATABASE_ID");


  // =============================
  // 4. Notionへ送るデータ
  // =============================

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
        multi_select: [
          {
            name: "Daily"
          }
        ]
      }
    },

    children: [

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
      },

      {
        object: "block",
        type: "paragraph",

        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: journal
              }
            }
          ]
        }
      }
    ]
  };


  // =============================
  // 5. Notion APIへ送信
  // =============================

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


  // =============================
  // 6. エラーチェック
  // =============================

  const statusCode = response.getResponseCode();

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(
      "Notion API エラー: " + response.getContentText()
    );
  }
}
