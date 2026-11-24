# CBT Journal Analytics

## 概要
日々の日記を生成AIが認知行動療法（CBT）の観点から分析し、自己理解を支援するアプリケーション。

## 開発経緯
- 日記や音声記録を文章として蓄積する習慣があった。
- 記録するだけでなく、自己理解に活用したいと考えた。
- 研究室で得た認知行動療法の知見を生成AIと組み合わせ、自動分析システムを開発した。

## 使用技術

| 技術 | 役割 |
|---|---|
| Google Forms | 日記入力 |
| Google Sheets | 日記・プロンプト管理 |
| Google Apps Script | 自動処理・API連携 |
| Gemini API | CBTに基づく日記分析 |
| Notion API | レポート保存 |
| Gmail | 分析結果の通知 |

## 主な機能
- フォーム送信をトリガーとした自動分析
- Google Sheetsから分析プロンプトを外部管理
- Gemini APIによるCBT分析
- Notionへの分析結果の自動保存
- Gmailによる分析通知・入力リマインダー

## システム構成

```text
Google Forms
    ↓
Google Sheets
    ↓
Google Apps Script
    ↓
Gemini API
    ↓
Notion + Gmail
```

## セキュリティ
APIキーはGASのスクリプトプロパティで管理し、ソースコードには含めない。Gemini APIは有料枠を利用する。

※ AIによる分析は自己理解を支援するためのものであり、医学的診断を目的としない。