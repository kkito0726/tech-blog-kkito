---
title: （下書き）検索機能の実装メモ
date: 2026-07-13
description: MiniSearchでのbigramトークナイズ検討メモ。まだ公開しない。
draft: true
---

## MiniSearchの日本語対応

日本語は分かち書きがないため、bigramでトークナイズする方針。

```typescript
function bigramTokenize(text: string): string[] {
  const normalized = text.normalize('NFKC').toLowerCase()
  return Array.from({ length: Math.max(normalized.length - 1, 1) }, (_, i) =>
    normalized.slice(i, i + 2),
  )
}
```

この記事は `draft: true` なので、本番ビルドでは一覧にも詳細にも現れないはず。
