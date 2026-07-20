# kkito blog

Vite + React + TypeScript で自作した個人テックブログ。

**公開URL**: https://kkito0726.github.io/tech-blog-kkito/

Markdownファイルを1枚置いて `main` にpushするだけで、GitHub Actionsがビルドして GitHub Pages へ公開します。

## 特徴

- **執筆はMarkdownだけ** — CMSも管理画面も不要。frontmatter付きの `index.md` を置いてpushするだけ
- **表示処理はビルド時に完結** — シンタックスハイライトもMermaid図もビルド時にHTML/SVG化するため、閲覧時のJavaScriptは最小限
- **壊れた記事は公開されない** — frontmatterの不備・画像の欠落・Mermaid構文エラーはビルドを失敗させ、デプロイを止める
- **ライト/ダークテーマ** — OS設定に追従しつつ手動切替も可能（選択はlocalStorageに保存）
- **目次の自動生成** — 見出しから生成し、読んでいる位置をハイライト
- **下書き** — `draft: true` の記事は本番ビルドから除外（開発サーバーでは表示）

## 技術スタック

| 領域 | 採用技術 |
| --- | --- |
| ビルドツール | Vite |
| UI | React 19 + TypeScript |
| スタイリング | TailwindCSS v4 |
| 静的サイト生成 | vite-react-ssg |
| Markdown変換 | unified（remark / rehype） |
| frontmatter検証 | Zod |
| シンタックスハイライト | Shiki（ビルド時） |
| 図表 | Mermaid（ビルド時にSVG化 / Playwright） |
| テスト | Vitest |
| ホスティング | GitHub Pages |
| CI/CD | GitHub Actions |

## セットアップ

Node.js 22 以上が必要です。

```bash
npm ci
```

`postinstall` でMermaidのレンダリングに使うChromium（Playwright）が自動でインストールされます。

## コマンド

```bash
npm run dev        # 開発サーバー（下書きも表示される）
npm run build      # 本番ビルド（frontmatter検証・画像チェックを兼ねる）
npm run preview    # ビルド結果をローカル配信して本番相当を確認
npm test           # ユニットテスト（Vitest）
npm run typecheck  # 型チェック（tsc --noEmit）
```

## 記事を書く

記事は `content/posts/` 配下に **1記事1フォルダ** で置きます。

```
content/posts/2026-07-20-my-new-post/
├── index.md       ← 本文（このファイル名で固定）
└── diagram.png    ← 画像は同じフォルダに置き、相対パスで参照
```

```markdown
---
title: 記事のタイトル
date: 2026-07-20
description: 一覧やSNSシェアに使われる説明文
---

## 見出し

ここに本文を書いていく。
```

フォルダ名から日付プレフィックスを除いた部分がURLになります（`/posts/my-new-post/`）。

詳しい書き方・使えるMarkdown記法・つまずきどころは **[docs/WRITING_GUIDE.md](docs/WRITING_GUIDE.md)** を参照してください。

## ディレクトリ構成

```
.
├── content/posts/            # 記事（1記事1フォルダ）
├── plugins/                  # ビルド時のコンテンツ処理
│   ├── vite-plugin-markdown-posts.ts   # Markdown → HTML変換のViteプラグイン
│   └── mermaid-renderer.ts             # MermaidのSVG化とキャッシュ
├── src/
│   ├── components/           # Atomicデザイン（atoms/molecules/organisms/templates）
│   ├── pages/                # ルート単位のページ
│   ├── lib/                  # 記事コレクションのロジック
│   ├── hooks/                # useTheme / useActiveHeading
│   ├── config/site.ts        # サイト設定（タイトル・URL等）
│   ├── styles/global.css     # デザイントークンと記事本文のスタイル
│   └── routes.tsx            # ルート定義
├── tests/                    # ユニットテスト
├── scripts/copy-404.mjs      # GitHub Pages用に404.htmlを配置
└── docs/                     # ドキュメント（下記）
```

## ドキュメント

| ファイル | 内容 |
| --- | --- |
| [docs/WRITING_GUIDE.md](docs/WRITING_GUIDE.md) | 記事執筆ガイド（記事を書くたびに参照） |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | ブランチ運用・コミット規約・PRの出し方 |
| [docs/spec/](docs/spec/personal-tech-blog/) | 要件定義（EARS記法・ユーザーストーリー・受け入れ基準） |
| [docs/design/](docs/design/personal-tech-blog/) | 技術設計（アーキテクチャ・データフロー・型定義） |

## デプロイ

`main` への push をトリガーに [.github/workflows/deploy.yml](.github/workflows/deploy.yml) が実行されます。

```
push → ビルド（検証込み）→ GitHub Pages へデプロイ
```

ビルドが失敗した場合はデプロイされず、既存の公開サイトが維持されます。

## ライセンス

記事本文の著作権は著者に帰属します。
