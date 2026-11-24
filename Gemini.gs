
function analyzeDiary(diary) {

  // Google Sheetsから最新プロンプトを取得
  const prompt = getCBTPrompt();

  const apiKey = getSecret("GEMINI_API_KEY");

  const url =
    "https://generativelanguage.googleapis.com/" +
    `v1beta/models/${CONFIG.MODEL}:generateContent`;

  // プロンプトをシステム指示として渡し、
  // 日記本文は別の入力として扱う
  const payload = {
    systemInstruction: {
      parts: [{ text: prompt }]
    },
    contents: [{
      role: "user",
      parts: [{
        text: `以下の日記を分析してください。\n\n${diary}`
      }]
    }],
    generationConfig: {
      maxOutputTokens: 4000
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-goog-api-key": apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const result = JSON.parse(response.getContentText());

  if (response.getResponseCode() !== 200) {
    throw new Error(
      "Gemini API Error: " + JSON.stringify(result)
    );
  }

  const parts = result.candidates?.[0]?.content?.parts || [];

  const analysis = parts
    .map(part => part.text || "")
    .join("");

  if (!analysis.trim()) {
    throw new Error("Geminiの分析結果が空です");
  }

  return analysis;
}
