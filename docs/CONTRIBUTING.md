# このリポジトリの開発フロー

`main` ブランチへの直接pushは行わず、すべての変更（コード・記事どちらも）はブランチを切ってPull Requestを作成する運用とする。

## 1. ブランチを作る

`main` を最新化してからブランチを切る。

```bash
git checkout main
git pull --ff-only
git checkout -b <種別>/<内容が分かる短い名前>
```

### ブランチ名の種別（プレフィックス）

| プレフィックス | 用途 | 例 |
|---|---|---|
| `feat/` | 新機能・画面の追加 | `feat/blog-ui`, `feat/search` |
| `fix/` | 不具合修正・UI調整 | `fix/mobile-overflow` |
| `docs/` | ドキュメント・記事の追加（設計文書・記事執筆もここ） | `docs/contributing-and-writing-guide` |
| `chore/` | 依存更新・設定変更など | `chore/upgrade-vite` |
| `ci/` | GitHub Actions等CI設定 | `ci/deploy-pages` |

記事の追加も `docs/` プレフィックスを使う（例: `docs/post-react-server-components`）。

## 2. コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) 形式を使う。

```
<type>: <変更内容の要約>

<任意の本文。「何を」より「なぜ」を書く>
```

| type | 意味 |
|---|---|
| `feat` | 新機能 |
| `fix` | 不具合修正 |
| `docs` | ドキュメント・記事の追加/更新 |
| `refactor` | 挙動を変えないコード整理 |
| `test` | テストの追加/修正 |
| `chore` | ビルド設定・依存関係など |
| `perf` | パフォーマンス改善 |
| `ci` | CI/CD設定 |

1つのPRの中で複数回コミットしてよい（レビュー指摘やデザイン調整のたびに `fix:` コミットを積み重ねる運用で問題ない）。マージ時はGitHubのデフォルト（マージコミット）でよく、squashは必須ではない。

## 3. PRを出す前のローカル確認

```bash
npm run typecheck   # tsc --noEmit
npm test             # vitest run
npm run build         # 本番ビルド（frontmatter不正・画像欠落等はここでエラーになる）
```

記事だけの変更でも `npm run build` は必ず通す。frontmatterの必須項目漏れや画像パスの誤りはビルド時エラーとして検出される（詳細は [WRITING_GUIDE.md](WRITING_GUIDE.md) を参照）。

## 4. PRの作成

```bash
git push -u origin <ブランチ名>
gh pr create --title "<type>: <要約>" --body "..."
```

PR本文には最低限以下を含める。

```markdown
## 概要
<何を・なぜ変更したか>

## 変更内容
<主要な変更点の箇条書き>

## テスト・検証
- [ ] typecheck / test / build がローカルで通ることを確認
- [ ] （UI変更がある場合）スクリーンショットで見た目を確認
```

## 5. マージ後のローカル同期

PRがマージされたら、ローカルの `main` を最新化し、マージ済みブランチを削除する。

```bash
git checkout main
git pull --ff-only
git branch -d <マージ済みブランチ名>
```

## 参考: これまでのPR

- PR #1: 要件定義・技術設計文書（`docs/design-personal-tech-blog`）
- PR #2: ブログ画面実装（`feat/blog-ui`）— 複数回の `fix:` コミットを積み重ねてから1つのPRとしてマージ
