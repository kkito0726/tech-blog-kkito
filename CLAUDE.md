# CLAUDE.md

このリポジトリで作業するときの指示。

## プロジェクト概要

Vite + React + TypeScript + TailwindCSS で自作した個人テックブログ。記事はMarkdownで書き、`main` へのpushでGitHub Actionsがビルドして GitHub Pages へ自動デプロイする。

**設計の核**: 表示に必要な処理（Markdown変換・シンタックスハイライト・Mermaid図のSVG化）はすべて**ビルド時に完結**させ、クライアントに送るJavaScriptを最小限に保つ。この方針を崩す変更（クライアントサイドでのレンダリング追加など）は避けること。

## コマンド

```bash
npm run dev        # 開発サーバー（draft記事も表示される）
npm run build      # 本番ビルド。frontmatter検証・画像存在チェックも兼ねる
npm run preview    # ビルド結果を配信（本番相当の確認）
npm test           # Vitest
npm run typecheck  # tsc --noEmit
```

変更後は **`npm run typecheck` と `npm run build` を必ず通す**こと。記事だけの変更でもビルドは通す（検証を兼ねているため）。

## 作業の進め方

**`main` へ直接コミットしない。必ずブランチを切ってPRを作成する。**

```bash
git checkout main && git pull --ff-only
git checkout -b <type>/<内容>     # feat / fix / docs / chore / ci
# 作業 → commit
git push -u origin <branch>
gh pr create --base main --title "..." --body "..."
```

コミットメッセージは Conventional Commits（`feat:` `fix:` `docs:` `refactor:` `test:` `chore:` `ci:`）。詳細は [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)。

## アーキテクチャ

### コンテンツパイプライン（ビルド時）

`plugins/vite-plugin-markdown-posts.ts` がViteの `transform` フックで `content/posts/*/index.md` を処理し、`{ frontmatter, toc, readingMinutes, html }` をexportするJSモジュールへ変換する。

```
index.md
 → gray-matter（frontmatter分離）
 → Zod検証（title/date必須。欠けたらビルドエラー）
 → unified: remark-parse → remark-gfm → remark-rehype
 → rehype-slug（見出しID）→ TOC抽出（h2/h3）
 → 相対パス画像の解決（存在しなければビルドエラー）
 → Mermaidブロックを抽出しプレースホルダー化
 → Shikiハイライト（vitesse-light / vitesse-dark）
 → rehype-stringify
 → MermaidのSVGを文字列置換で埋め込み
```

この `transform` フックは **dev / build 両方で動く**。devでMermaidが表示されるのは、開発サーバー（Node側）で同じ処理が走っているため。

### 記事コレクション

- `src/lib/postCollection.ts` — 純粋関数（スラッグ導出・重複検出・draft除外・ソート）。テスト対象
- `src/lib/posts.ts` — `import.meta.glob` で記事を集約。`import.meta.env.DEV` でdraftの扱いを切り替え

URLは `content/posts/YYYY-MM-DD-<slug>/` から日付プレフィックスを除いた `/posts/<slug>/`。日付を除いたスラッグが重複するとビルドエラー。

### UI

Atomicデザイン: `atoms → molecules → organisms → templates → pages`。新規コンポーネントは適切な階層に置くこと。

## 落とし穴（重要）

過去に実際に踏んだ問題。同じ轍を踏まないこと。

### 1. 日本語の括弧と太字（`**`）

太字の内側が `「` `（` で始まる/終わると強調が成立せず、`**` がそのまま表示される。**ビルドは成功してしまう**ので気づけない。

```markdown
❌ 文中で**「括弧」の状態**になった     # ** がそのまま出る
✅ 文中で「**括弧の中だけ**」の状態になった
```

記事を書いたら `grep -o '\*\*[^*]\{0,30\}' dist/posts/<slug>/index.html` で崩れを確認できる。詳細は [docs/WRITING_GUIDE.md](docs/WRITING_GUIDE.md)。

### 2. Mermaidのパレットは `global.css` と手動同期

`plugins/mermaid-renderer.ts` の `PALETTE` は `src/styles/global.css` の `--c-*` トークンのコピー。CSS変数をNode側から参照できないための妥協。**どちらか一方を変えたら必ず両方を更新**し、`CACHE_VERSION` を上げて古いキャッシュを無効化すること。

### 3. MermaidのSVGはidを一意にする必要がある

MermaidのSVGは内部に `<style>` を持ち `#mermaid-0 .node rect {...}` と自分のidで規則を限定する。ライト用とダーク用が同じidだと、DOM上あとに来る方の規則が先の方にも適用されて配色が壊れる。`makeIdsUnique()` が内容ハッシュから一意なidを振っている。**この処理を外さないこと**。

### 4. Shikiのspanに `background-color` を指定しない

Shikiはトークンごとに `<span>` を出す。そこに背景色を指定すると、文字のある部分にだけテーマ背景色が乗り、コードブロックの背景と食い違う。`.shiki span` には **`color` のみ**指定する。背景は `.article-body pre` の `--c-panel` に一本化している。

### 5. デザイントークンはコントラストAA（4.5:1）を維持

`--c-dim` と `--c-amber` は本文・目次・メタ情報に使われる。変更する場合は背景色に対して 4.5:1 以上を保つこと（過去にAA未満だったため調整した経緯がある）。

### 6. 記事本文のリンクはルート相対で書かない

GitHub Pagesのサブパス配信のため、Markdownに直接書いた `/posts/foo/` には `base` が付かず、本番でだけ404になる。記事間は相対パス（`../<slug>/`）で書く。ビルド時に `rehypeCheckLinks` が検出してエラーにする。

### 7. draft記事はdevでは見える

`draft: true` の記事は `npm run dev` では表示され、`npm run build` では除外される。「消えない」と思ったら本番ビルドで確認すること。

## 設定まわり

- **base path**: GitHub Pagesのサブパス配信のため `vite.config.ts` に `base: '/tech-blog-kkito/'`。リポジトリ名を変えたら要更新
- **URL形式**: `ssgOptions.dirStyle: 'nested'` で `/posts/<slug>/` を出力
- **404**: `scripts/copy-404.mjs`（postbuild）が `dist/404.html` を配置。GitHub Pagesの仕様上必要
- **Chromium**: `postinstall` で `playwright install --with-deps chromium` が走る。MermaidのSVG化に必要
- **Mermaidキャッシュ**: `node_modules/.cache/mermaid-diagrams/`。CIでは `actions/cache` で永続化している

## ドキュメント

| ファイル | 用途 |
| --- | --- |
| [docs/WRITING_GUIDE.md](docs/WRITING_GUIDE.md) | 記事執筆ガイド。記事関連の作業前に読むこと |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | ブランチ運用・コミット規約 |
| [docs/spec/](docs/spec/personal-tech-blog/) | 要件定義（EARS記法） |
| [docs/design/](docs/design/personal-tech-blog/) | 技術設計 |

## コードスタイル

- イミュータブルに書く（配列は `toSorted` 等の非破壊メソッドかスプレッドで新しい値を返す）
- 1ファイルは小さく保つ（200〜400行目安）
- コメントは「何をしているか」ではなく「なぜそうしているか」を書く
- 記事・ドキュメント・UIの文言はすべて日本語
