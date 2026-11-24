
function testGemini() {

  // ① スクリプトプロパティからAPIキーを取得
  const apiKey = PropertiesService
    .getScriptProperties()
    .getProperty("GEMINI_API_KEY");

  if (!apiKey) {
    throw new Error("GEMINI_API_KEYが設定されていません");
  }

  // ② テスト用の日記
  const diary = `
    今日は研究が思うように進まなかった。
    周囲と比較して焦りを感じた。
    しかし、新しく理解できたこともあった。
  `;

  // ③ Geminiへの指示
  const prompt = `
    以下の日記を認知行動療法（CBT）の観点から分析してください。

    1. 感情
    2. 自動思考
    3. 認知の偏り
    4. 別の捉え方
    5. 次に取るべき行動

    【日記】
    ${diary}
  `;

  // ④ Gemini APIのURL
  const url =
  "https://generativelanguage.googleapis.com/" +
  "v1beta/models/gemini-3.8-flash:generateContent";

  // ⑤ APIに送信するデータ
  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  // ⑥ Gemini APIを呼び出す
  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-goog-api-key": apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  // ⑦ レスポンスをJSONからオブジェクトに変換
  const result = JSON.parse(response.getContentText());

  // エラーが発生した場合
  if (response.getResponseCode() !== 200) {
    throw new Error(JSON.stringify(result));
  }

  // ⑧ AIが生成した文章を取り出す
  const analysis = (result.candidates?.[0]?.content?.parts || [])
    .map(part => part.text || "")
    .join("");

  if (!analysis) {
    throw new Error("分析結果が空です: " + JSON.stringify(result));
  }

  // ⑨ 実行ログに表示
  console.log(analysis);
}
