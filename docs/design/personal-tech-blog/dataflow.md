# 個人テックブログ データフロー図

**作成日**: 2026-07-14
**関連アーキテクチャ**: [architecture.md](architecture.md)
**関連要件定義**: [requirements.md](../../spec/personal-tech-blog/requirements.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実なフロー
- 🟡 **黄信号**: EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測によるフロー
- 🔴 **赤信号**: EARS要件定義書・設計文書・ユーザヒアリングにない推測によるフロー

---

## システム全体のデータフロー 🔵

**信頼性**: 🔵 *要件定義・ユーザーストーリー1.2より*

```mermaid
flowchart LR
    A[執筆者] -->|"記事フォルダをpush"| B[GitHub main]
    B -->|pushトリガー| C[GitHub Actions]
    C -->|ビルド成功| D[GitHub Pages]
    C -.->|ビルド失敗| E[デプロイ中止<br/>既存サイト維持]
    D --> F[読者ブラウザ]
```

## 主要機能のデータフロー

### 機能1: 記事の自動公開（Phase 1） 🔵

**信頼性**: 🔵 *REQ-101/104/105・受け入れ基準TC-101より*

**関連要件**: REQ-101, REQ-104, REQ-105

```mermaid
sequenceDiagram
    participant W as 執筆者
    participant G as GitHub(main)
    participant A as GitHub Actions
    participant P as GitHub Pages

    W->>G: 記事フォルダ（index.md + 画像）をpush
    G->>A: workflowトリガー
    A->>A: npm ci
    A->>A: ビルド（vite-react-ssg build）
    Note over A: frontmatterのZod検証（REQ-104）<br/>スラッグ重複チェック（EDGE-002）<br/>画像参照解決・欠落検出（REQ-011）
    alt 検証・ビルド成功
        A->>P: actions/deploy-pagesでデプロイ
        P-->>W: 数分以内に公開反映
    else 検証・ビルド失敗
        A-->>W: ワークフロー失敗通知（デプロイなし: REQ-105）
    end
```

**詳細ステップ**:
1. 執筆者が `content/posts/YYYY-MM-DD-<slug>/index.md`（+画像）をmainにpush
2. GitHub Actionsがビルドを開始し、Zodでfrontmatter（title/date必須）を検証
3. `draft: true` の記事を除外（REQ-102）した上で全ページを静的生成
4. 成功時のみGitHub Pagesへデプロイ

### 機能2: ビルド時コンテンツ処理パイプライン（Phase 1） 🔵

**信頼性**: 🔵 *REQ-004〜007/011・ヒアリングQ3より（内部順序は🟡）*

**関連要件**: REQ-004, REQ-005, REQ-006, REQ-007, REQ-011, REQ-012

```mermaid
flowchart TD
    A["import.meta.glob<br/>content/posts/*/index.md"] --> B[gray-matter<br/>frontmatter分離]
    B --> C{Zodバリデーション<br/>title/date必須}
    C -->|違反| X[ビルドエラー<br/>ファイル名付きメッセージ]
    C -->|OK| D{draft: true?}
    D -->|Yes| Y[公開対象から除外]
    D -->|No| E[スラッグ導出<br/>フォルダ名から日付除去]
    E --> F{スラッグ重複?}
    F -->|Yes| X
    F -->|No| G[unified変換<br/>remark-parse → remark-gfm<br/>→ remark-rehype]
    G --> H["rehype-slug（見出しID）<br/>+ TOC抽出（h2/h3）"]
    H --> I["@shikijs/rehype<br/>コードハイライト"]
    I --> J[独自rehypeプラグイン<br/>相対画像パス→Viteアセット解決]
    J --> K{画像実在?}
    K -->|No| X
    K -->|Yes| L[記事HTML + メタデータ確定]
    L --> M[各ルートの静的HTML生成<br/>OGP/SEOメタタグ埋め込み]
    L --> N[MiniSearch検索インデックス<br/>JSON生成（Phase 2）]
```

### 機能3: 記事閲覧（Phase 1） 🔵

**信頼性**: 🔵 *ユーザーストーリー2.1/2.2・REQ-003〜006より*

**関連要件**: REQ-003, REQ-004, REQ-005, REQ-006, REQ-012

```mermaid
sequenceDiagram
    participant U as 読者
    participant P as GitHub Pages
    participant B as ブラウザ(React)

    U->>P: GET /tech-blog-kkito/
    P-->>B: 静的HTML（記事一覧: 公開日降順）
    B-->>U: 一覧表示（title/date/description）
    U->>P: GET /tech-blog-kkito/posts/{slug}/
    P-->>B: 静的HTML（ハイライト済み本文+TOC+OGPメタ）
    B-->>U: 記事表示
    U->>B: TOCの見出しをクリック
    B-->>U: 該当セクションへスクロール（アンカー遷移）
```

### 機能4: 記事検索（Phase 2） 🔵

**信頼性**: 🔵 *REQ-009・ヒアリングQ4より（遅延ロード戦略は🟡）*

**関連要件**: REQ-009, REQ-301

```mermaid
sequenceDiagram
    participant U as 読者
    participant B as ブラウザ(React)
    participant P as GitHub Pages

    U->>B: 検索ボックスをフォーカス
    B->>P: GET search-index.json（初回のみ・遅延ロード）
    P-->>B: MiniSearchインデックス
    U->>B: キーワード入力
    B->>B: MiniSearch検索（bigramトークナイズ・draft記事は含まれない）
    alt ヒットあり
        B-->>U: 該当記事リスト表示
    else ヒットなし
        B-->>U: 「該当する記事がありません」（EDGE-102）
    end
```

### 機能5: テーマ切替（Phase 2） 🔵

**信頼性**: 🔵 *REQ-010/201/202より（実装方式は🟡）*

**関連要件**: REQ-010, REQ-201, REQ-202

```mermaid
flowchart TD
    A[ページロード] --> B{localStorageに<br/>テーマ保存あり?}
    B -->|あり| C[保存テーマを適用]
    B -->|なし| D{prefers-color-scheme<br/>= dark?}
    D -->|Yes| E[ダークテーマ適用]
    D -->|No| F[ライトテーマ適用]
    C & E & F --> G[html要素にclass付与<br/>Tailwind dark:variant有効化]
    G --> H[ユーザーがトグル操作]
    H --> I[Contextでテーマ更新<br/>+ localStorage保存]
    I --> G
```

**備考**: FOUC（テーマちらつき）防止のため、テーマ判定スクリプトを`<head>`内にインラインで埋め込む 🟡 *SSGサイトの定石からの妥当な推測*

## データ処理パターン

### ビルド時処理（同期） 🔵

**信頼性**: 🔵 *アーキテクチャ設計より*

記事の収集・検証・変換・インデックス生成はすべてビルド時に完結する。実行時のデータ取得は検索インデックスJSONのfetchのみ。

### クライアント処理 🟡

**信頼性**: 🟡 *機能要件からの妥当な推測*

テーマ切替と検索のみクライアントJSで動作。それ以外は静的HTMLで完結し、ハイドレーション後もデータ通信は発生しない。

## エラーハンドリングフロー 🔵

**信頼性**: 🔵 *REQ-103〜105・EDGE-001/002・ヒアリングQ5より*

```mermaid
flowchart TD
    A[エラー発生] --> B{発生タイミング}
    B -->|ビルド時| C{エラー種別}
    C -->|frontmatter不正| D[ファイル名付きエラーで失敗]
    C -->|スラッグ重複| E[重複フォルダ名付きエラーで失敗]
    C -->|参照画像欠落| F[ファイル名付きエラーで失敗]
    D & E & F --> G[Actionsワークフロー失敗<br/>デプロイ中止・既存サイト維持]
    B -->|実行時| H{エラー種別}
    H -->|存在しないURL| I[静的404ページ表示]
    H -->|検索インデックス取得失敗| J[検索UIにエラーメッセージ表示<br/>閲覧機能には影響なし]
```

**信頼性**: 検索インデックス取得失敗時の挙動のみ 🟡 *妥当な推測*

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **型定義**: [interfaces.ts](interfaces.ts)
- **要件定義**: [requirements.md](../../spec/personal-tech-blog/requirements.md)

## 信頼性レベルサマリー

- 🔵 青信号: 8件（67%)
- 🟡 黄信号: 4件（33%)
- 🔴 赤信号: 0件（0%)

**品質評価**: 高品質
