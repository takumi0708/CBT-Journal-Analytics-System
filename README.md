# CBT-Journal-Analytics-System
Googleフォームに自由記述で日記を書き、その内容をGeminiで分析し、Notionへ自動保存するシステムです。
# CBT Journal Analysis System

Googleフォームに自由記述で日記を書き、その内容をGeminiで分析し、Notionへ自動保存するシステムです。

## 目的

日々のジャーナルをAIで分析し、

- 感情
- 自動思考
- 認知パターン
- 行動
- 背景
- 気づき
- 次にできること

などを整理します。一番は、自分の認知を客観的に評価することが目的。また、長期的な自分の思考のトレンド、変化を記録し評価するため。

また、月末・年末には一定期間のジャーナルをまとめて分析し、思考や感情の変化を振り返れるレポートを自分のメールに配信する。

## 全体構成

```text
Google Form
    ↓
Google Spreadsheet
    ↓
Google Apps Script
    ↓
Gemini API
    ↓
Notion
```

月次・年次処理では、Spreadsheetから対象期間のジャーナルを取得し、Geminiでまとめて分析します。

```text
Spreadsheet
    ↓
GAS
    ↓
Gemini
    ↓
Notion
    ↓
Gmail（必要に応じて）
```

## 使用技術

- Google Forms
- Google Spreadsheet
- Google Apps Script
- Gemini API
- Notion API
- Gmail

## 分析タイミング

### Daily

フォーム送信ごとに、そのジャーナル1件をGeminiで分析します。

分析結果はNotionへ保存します。

将来的には、Notionで保存した内容に対して、NotionのAIエージェントなどを利用し、さらに活用できる方向を模索している。

### Monthly

月末に、その月のジャーナルをすべて取得して分析します。

主に以下を分析します。

- 感情の傾向
- 思考の傾向
- 行動の傾向
- 繰り返しているパターン
- 変化した部分

### Yearly

年末に、その年のジャーナルをまとめて分析します。

主に以下を分析します。

- 1年間のトレンドその変化
- 繰り返した思考
- 改善した部分
- 残っているパターン

## Google Form

設問は1つだけにします。

> 今日考えたこと、感じたこと、起きたことなどを自由に書いてください。

## Notion

以下のプロパティを使用します。

| プロパティ | 型 |
| --- | --- |
| タイトル | Title |
| 日付 | Date |
| 種別 | Select |
| notion AI | Summary |

## 開発方針

まず各機能を個別に動作確認し、その後自動化します。

1. Google Form → Spreadsheet
2. GASからSpreadsheetを読む
3. GAS → Gemini API
4. Geminiの回答をログに表示
5. GAS → Notion API
6. フォーム送信時に自動実行
7. 月次処理
8. 年次処理
9. Gmail送信

## 開発環境

Google Spreadsheetから以下を開いて開発します。

```text
拡張機能
↓
Apps Script
```

GASエディタ上で実装・動作確認を行い、コードはGitHubでも管理します。
