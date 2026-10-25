# Journal Analysis System

Googleフォームに日記を書き、Notionに保存・分析するジャーナルシステムです。

## 全体構成

```text
Google Form
↓
Google Spreadsheet
↓
Google Apps Script
↓
Notion
↓
Notion AIでDaily分析
```

月末・年末は、GPTがNotion内のデータをMCP経由で参照して長期分析を行います。

```text
Notion
↓
MCP
↓
GPT
↓
月次 / 年次レポート
↓
Notion保存
↓
Gmail送信
```

## 使用技術

- Google Forms
- Google Spreadsheet
- Google Apps Script
- Notion
- Notion AI
- Notion MCP
- GPT
- Gmail

## Daily

フォームに日記を自由記述します。

GASでNotionへ保存し、Notion AIで以下を整理します。

- 状況
- 感情
- 自動思考
- 認知パターン
- 行動
- 背景
- 気づき
- 次にできること

## Monthly

その月のジャーナルとDaily分析をGPTが参照し、月次レポートを作成します。

主に以下を分析します。

- 感情・思考・行動の傾向
- 繰り返しているパターン
- 月内での思考の変化
- 改善した部分
- 残っているパターン
- 来月観察したいこと

レポートはNotionへ保存し、Gmailにも送信します。

## Yearly

月次レポートを中心に1年間を分析します。

主に以下を分析します。

- 1年間の思考の変化
- 感情の変化
- 行動・習慣の変化
- 長期間繰り返したパターン
- 改善した部分
- 残っている課題
- 1年前との比較

レポートはNotionへ保存し、Gmailにも送信します。

## 役割

| 技術 | 役割 |
|---|---|
| Google Form | 日記入力 |
| Spreadsheet | 一時保存 |
| GAS | Notionへの転送・自動処理 |
| Notion | データ・レポート保存 |
| Notion AI | Daily分析 |
| MCP | GPTとNotionを接続 |
| GPT | 月次・年次分析 |
| Gmail | レポート通知 |
