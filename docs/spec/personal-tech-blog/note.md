# 個人テックブログ コンテキストノート

**作成日**: 2026-07-14
**要件名**: personal-tech-blog

## プロジェクト概要

マークダウンで記事を書き、リポジトリにpushするだけでGitHub Actionsが自動ビルド・デプロイする個人テックブログ。

## プロジェクト状態

- 新規プロジェクト（作成時点でリポジトリは空、git未初期化）
- 既存のCLAUDE.md / README.md / 実装コードなし
- 本要件定義が最初の成果物

## 技術スタック（ユーザー指定）

| 区分 | 技術 |
|------|------|
| ビルドツール | Vite |
| UIフレームワーク | React |
| 言語 | TypeScript |
| スタイリング | TailwindCSS |
| 設計パターン | Atomicデザイン（atoms / molecules / organisms / templates / pages） |
| ホスティング | GitHub Pages |
| CI/CD | GitHub Actions |
| レンダリング方式 | 静的生成（SSG） |

## 開発ルール（ユーザーのグローバルルールより）

- イミュータブルなデータ操作を徹底（ミューテーション禁止）
- 小さなファイル分割（1ファイル200〜400行目安、最大800行）
- TDD（テストファースト、カバレッジ80%以上）
- Zod等による入力バリデーション
- コミットメッセージは Conventional Commits 形式

## スコープ整理（ヒアリング結果）

**含む**: 記事一覧・詳細表示、SSG、自動デプロイ、シンタックスハイライト、目次（TOC）、OGP・SEOメタタグ、記事検索、ダークモード、下書きフラグ

**含まない（Won't Have）**: タグ・カテゴリ分類、RSSフィード、コメント機能

## 記事ディレクトリ構成（追加ヒアリングで確定）

「1記事1フォルダ」方式（コロケーション）を採用。

```
content/
└── posts/
    ├── 2026-07-14-vite-ssg-setup/
    │   ├── index.md          ← 記事本文（frontmatter付き）
    │   ├── architecture.png  ← この記事専用の画像
    │   └── result-screen.png
    └── 2026-08-01-react-hooks/
        └── index.md          ← 画像なし記事はindex.mdのみ
```

- フォルダ名: `YYYY-MM-DD-<スラッグ>`（日付はソート・整理用）
- 記事URL: `/posts/<スラッグ>/`（日付プレフィックスはURLに含めない）
- 画像は記事フォルダ内に置き、本文から相対パス `![alt](./image.png)` で参照
- ビルド時に相対パスをハッシュ付きアセットURLへ解決（`import.meta.glob` + markdownプロセッサのプラグイン等。設計フェーズで選定）
- スラッグ重複はビルドエラーで検出

## 注意事項

- GitHub Pagesはサブパス配信（`https://<user>.github.io/<repo>/`）になるため、Viteの `base` 設定が必要
- SSGのため、SPAルーティングだけではOGPメタタグがクローラーに認識されない点に注意（ビルド時プリレンダリング必須）
- 段階的リリース方針: Phase 1（コア機能）→ Phase 2（検索・ダークモード）

## 関連文書

- [requirements.md](requirements.md)
- [interview-record.md](interview-record.md)
- [user-stories.md](user-stories.md)
- [acceptance-criteria.md](acceptance-criteria.md)
