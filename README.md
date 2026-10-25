# Journal Analysis System

Google Formで日記を書き、Notionに保存・分析するシステムです。

## 目的

- 日々、日記をDocumentに書くことが趣味だが、情報を活用できないか？と考えていて、このシステムを思いついた
- その日の思考を客観的に分析、長期の思考はトレンドで分析することで自分の方向性、短期では気づけない**自分の本質のようなも**のに触れれるのでは？という期待がある
- 将来的に自然言語分析を用いて、数値的に自分の思考、感情のトレンドをグラフで表したいと感じている

## 概要

```
(毎日 19時)
GAS → Gmail → Google Formリンク送信

Google Form
↓
Spreadsheet
↓
GAS
↓
Notion
↓
Notion AI / Notion Agent

毎月・毎年
ChatGPT
↓
Notion連携
↓
長期分析
↓
Notion保存 + Gmail送信
```

## 日次処理

毎日19時に、メールで自動送信されてきたGoogle Formに自由記述で入力します。これで、記入忘れの確率を下げれると思っている。

回答はSpreadsheetに保存され、GASを通じて、Notionへ自動登録されます。

Notionでは、

- Notion AI：自動要約
- Notion Agent：ページ内に `# 分析` を追加し、認知行動の枠組みで分析

を行います。

### 実際の日次分析の例

<img width="561" height="582" alt="image" src="https://github.com/user-attachments/assets/3ba57cb5-74d6-4406-bcc8-b6ee8691836c" />


## 月次・年次分析

ChatGPTからNotionのデータを読み取り、長期的な変化を分析します。

長期トレンドは、自分のニーズでもあるので性能の良いGPTを使いたかったため。

月次では、

- 月前半 / 中盤 / 後半
- 曜日ごとの傾向
- 繰り返している思考
- 改善した部分
- 残っているパターン

を分析します。

年次では、月次レポートを中心に1年間の変化を分析します。

作成したレポートはNotionに保存し、Gmailでも通知します。この辺りは、GPTにスケジューリングして作成した。MCPのすごさを感じますね。

<img width="803" height="326" alt="image" src="https://github.com/user-attachments/assets/423c82a8-ac1e-4cf4-9028-00510d9a213d" />


## MCP / Notion連携

MCPは、AIと外部サービスをつなぐための仕組みです。

このシステムでは、

```
ChatGPT
↓
MCP / Notion連携
↓
Notion
```

として、週間、年間レポートに関しては、ChatGPTが分析して、ChatGPTがMCPサーバーを通じて、Notion内のデータを読み書きします。

## 使用技術

| 技術 | 用途 |
| --- | --- |
| Google Form | 日記入力 |
| Spreadsheet | 回答保存 |
| GAS | 自動処理 |
| Notion API | Notionへの保存 |
| Notion AI / Agent | 日次分析 |
| ChatGPT | 月次・年次分析 |
| MCP / Notion連携 | ChatGPTとNotionの接続 |
| Gmail | 通知 |
| GitHub | コード管理 |

## 環境変数

秘密情報はコードに直接書かず、GASのScript Propertiesで管理します。

```
NOTION_TOKEN
NOTION_DATABASE_ID
JOURNAL_EMAIL
JOURNAL_FORM_URL
```
