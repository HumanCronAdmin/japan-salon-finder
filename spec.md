# サービス仕様書: Japan Salon Finder

## 基本情報
- **サービス名:** Japan Salon Finder
- **タグライン:** Find English-friendly hair salons in Japan
- **一言で:** 日本在住外国人の「英語が通じる美容室どこ？」を解決するディレクトリ検索ツール
- **対象ニーズ:** Reddit頻出（r/japanlife, r/Tokyo, r/Osaka — 各都市で月複数回質問される定番トピック）
- **種類:** 静的サイト
- **デプロイ先:** GitHub Pages

### Redditエビデンス
- https://reddit.com/r/Osaka/comments/1rccc2x/does_anyone_know_a_foreigner_friendly_hair_salon/
- r/japanlife, r/Tokyo, r/Osaka で繰り返し投稿される定番質問

---

## 使うコード

### メインリポジトリ
- **URL:** 自作（該当リポなし）
- **選んだ理由:** 既存リポは汎用店舗検索かフルスタック構成。英語対応美容室に特化した軽量静的ディレクトリは存在しない
- **ライセンス:** MIT（自作）

### 使用ライブラリ（CDN）
- **Tailwind CSS** — モバイルファーストUI
- **Vanilla JS** — フィルタ・検索（外部ライブラリ不要、データ量100件以下）

---

## 核となる機能（1つだけ）

**都市を選ぶ → 英語対応レベル・価格帯・性別でフィルタ → 美容室が見つかる**

---

## コア機能詳細

### フィルタ項目
| フィルタ | 値 | UI |
|---|---|---|
| City | Tokyo, Osaka, Kyoto, Nagoya, Fukuoka, Yokohama, Sapporo, Other | ドロップダウン |
| English Level | Fluent, Conversational, Basic, Staff Available | チップ選択 |
| Price Range | Budget (< ¥4,000), Mid (¥4,000-8,000), Premium (¥8,000+) | チップ選択 |
| Gender | All, Men, Women, Unisex | チップ選択 |
| Hair Type | All, Textured/Curly, Asian Specialist, Color Specialist | チップ選択 |

### 表示情報
- サロン名、エリア（最寄り駅）、価格帯、英語対応レベル
- Hot Pepper Beauty / Google Maps リンク（外部遷移）
- Reddit / コミュニティでの推薦元（ソース明記）

---

## データスキーマ

```json
{
  "id": "tokyo-001",
  "name": "Salon Name",
  "city": "Tokyo",
  "area": "Shibuya",
  "nearest_station": "Shibuya Station",
  "english_level": "fluent",
  "price_range": "mid",
  "cut_price_yen": 5500,
  "gender": "unisex",
  "hair_types": ["textured", "color"],
  "hot_pepper_url": "https://beauty.hotpepper.jp/...",
  "google_maps_url": "https://maps.google.com/...",
  "website_url": "https://...",
  "source": "reddit:r/Tokyo",
  "source_url": "https://reddit.com/r/Tokyo/comments/...",
  "verified_date": "2026-04-13",
  "notes": "Walk-ins OK, English menu available"
}
```

---

## データ収集アプローチ

### ソース（優先順）
1. **Reddit推薦** — r/japanlife, r/Tokyo, r/Osaka, r/japanresidents の過去投稿から実名で推薦されたサロンを収集
2. **Google Maps** — "English hair salon [city]" で検索、英語レビューのある店舗を抽出
3. **Hot Pepper Beauty** — 「外国人対応」「English OK」タグのあるサロンを確認

### 収集手順
1. Gemini APIでReddit過去投稿を分析 → サロン名リスト生成
2. 各サロンのHot Pepper Beauty / Google Maps URLを手動確認
3. 価格・英語対応・エリア情報を公式ページから取得
4. `data/salons.json` に格納

### データ品質ルール
- **ダミーデータ禁止。** 実在サロンの公開情報のみ
- URL掲載前にHTTP生存確認必須
- Reddit推薦元のスレッドURLを`source_url`に記録
- 初期データ: 30〜50件（Tokyo 15+, Osaka 10+, 他都市各3-5）

---

## プロジェクト構成

```
projects/japan-salon-finder/
├── spec.md
├── index.html         ← メイン（HTML200行制限）
├── js/app.js          ← フィルタロジック+UI生成
├── js/data.js         ← salons配列（動的生成用）
├── css/style.css      ← Tailwind補助のカスタムスタイル
├── data/salons.json   ← サロンデータ
├── robots.txt
└── sitemap.xml
```

### 実装
| ファイル | 内容 |
|---|---|
| `index.html` | フィルタUI+結果コンテナ+FAQ。Tailwind CDN |
| `js/app.js` | フィルタイベント、結果レンダリング、URLパラメータ連携 |
| `js/data.js` | salons配列（salons.jsonから生成 or 直接記述） |
| `css/style.css` | Tailwindで賄えないスタイルのみ |

### レスポンシブ
- 480px以下：1カラム、タップ44px以上
- 768px以上：2カラムグリッド

---

## 収益モデル
- **初期:** 無料公開（ユーザー獲得・Reddit信頼構築）
- **収益化1:** Hot Pepper Beautyアフィリエイト（予約リンク経由）
- **収益化2:** Google AdSense（トラフィック月1,000UV到達後）
- **将来:** サロン掲載料（有料プレミアム枠）

---

## ビルド手順

1. Gemini APIでReddit過去投稿分析 → サロンリスト作成
2. 各サロンのURL・価格・英語対応を公式サイトで確認
3. index.html + app.js + data.js 実装（フィルタ+カード表示）
4. モバイル表示・フィルタ動作テスト → GitHub Pagesデプロイ

---

## publish向け情報
- **URL:** https://humancronadmin.github.io/japan-salon-finder/
- **訴求:** "Stop asking Reddit where to get a haircut. Search 50+ English-friendly salons in Japan."
- **投稿先:** r/japanlife, r/Tokyo, r/Osaka, r/movingtojapan, r/japanresidents
- **SEO:** 既存Japan Expatツール群から相互リンク。都市別ページで将来ロングテール展開
