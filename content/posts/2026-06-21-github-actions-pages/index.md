---
title: GitHub ActionsからGitHub Pagesへデプロイする最小構成
date: 2026-06-21
description: gh-pagesブランチはもう要らない。actions/deploy-pagesを使った公式ルートの最小ワークフローと、権限まわりの注意点をまとめる。
---

かつてGitHub Pagesへのデプロイといえば `gh-pages` ブランチへの成果物pushだったが、現在は公式のActions経由デプロイが使える。ビルド成果物をアーティファクトとしてアップロードし、そのままPagesへ流し込む方式だ。

## 最小のワークフロー

必要なのはこれだけ。ビルドが失敗すればdeployジョブは実行されず、壊れたサイトが公開されることはない。

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## 権限は最小限に

`permissions` はワークフロー全体でデフォルト付与せず、必要な3つだけを明示する。

- `contents: read` — チェックアウトに必要
- `pages: write` — Pagesへのデプロイに必要
- `id-token: write` — OIDCによるデプロイ検証に必要

## ハマりどころ

1. リポジトリ設定の Pages で **Source を「GitHub Actions」に変更**しておく。初期値のままだとdeployジョブが失敗する
2. サブパス配信（`/リポジトリ名/`）になるため、ビルドツール側でbase pathの設定を忘れない
3. `environment: github-pages` を付けないと `deploy-pages` が動かない

> デプロイの仕組みは一度整えてしまえば意識から消える。消えるからこそ、最初に最小で正しく組んでおきたい。
