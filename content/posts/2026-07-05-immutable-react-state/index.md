---
title: Reactの状態はなぜイミュータブルであるべきか
date: 2026-07-05
description: 「ミューテーションするとReactが再レンダリングしてくれない」の一歩先へ。参照の同一性と、スプレッド構文・toSorted等の実践パターンを整理する。
---

Reactの状態をミューテーション（破壊的変更）してはいけない、というのはよく知られたルールだ。しかし「なぜ」を参照の同一性から説明できると、応用が利くようになる。

## Reactは参照しか見ていない

Reactが「状態が変わったか」を判断する材料は、`Object.is` による参照比較だけだ。中身をどれだけ書き換えても、参照が同じなら「変わっていない」と見なされる。

```typescript
// WRONG: 参照が変わらないため再レンダリングされない
function addTodo(todos: Todo[], todo: Todo) {
  todos.push(todo)
  return todos
}

// CORRECT: 新しい配列を返す
function addTodo(todos: readonly Todo[], todo: Todo): Todo[] {
  return [...todos, todo]
}
```

これはReactの手抜きではなく設計だ。深い比較は高くつくが、参照比較は一瞬で終わる。イミュータブルに書くことは、その高速な変更検知に乗るための契約だと言える。

## 配列の新しい標準メソッド

ES2023で、配列に非破壊版のメソッドが揃った。`sort` や `reverse` のうっかりミューテーションは、これで過去のものにできる。

| 破壊的 | 非破壊（ES2023） |
| ------ | ---------------- |
| `sort()` | `toSorted()` |
| `reverse()` | `toReversed()` |
| `splice()` | `toSpliced()` |
| `arr[i] = x` | `with(i, x)` |

```typescript
const sorted = posts.toSorted((a, b) => (a.date < b.date ? 1 : -1))
// posts自体は元の順序のまま
```

## ネストしたオブジェクトの更新

ネストが深いときはスプレッドの連打になるが、これは「どの階層の参照が変わるのか」を明示する行為でもある。

```typescript
function updateProfileName(user: User, name: string): User {
  return {
    ...user,
    profile: {
      ...user.profile,
      name,
    },
  }
}
```

つらくなってきたらデータ構造が深すぎるサインだ。まず正規化を検討し、それでも必要ならImmerのようなライブラリを選べばいい。

## まとめ

- Reactの変更検知は参照比較。イミュータブルはその契約
- `toSorted` / `toSpliced` / `with` で破壊的メソッドを置き換える
- 深いスプレッドがつらいなら、まずデータ構造を疑う
