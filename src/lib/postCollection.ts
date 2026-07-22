/**
 * 記事コレクションの純粋関数群。
 * import.meta.glob への依存を持たないため単体テスト可能。
 */

const DATE_PREFIX_PATTERN = /^\d{4}-\d{2}-\d{2}-/

interface SluggedEntry {
  slug: string
  folderName: string
}

interface SortableEntry {
  date: string
  folderName: string
}

/** フォルダ名（YYYY-MM-DD-slug）から日付プレフィックスを除いたスラッグを導出する（REQ-012） */
export function deriveSlug(folderName: string): string {
  return folderName.replace(DATE_PREFIX_PATTERN, '')
}

/** スラッグ重複を検出し、重複フォルダ名を含むエラーを投げる（EDGE-002） */
export function assertUniqueSlugs(entries: readonly SluggedEntry[]): void {
  const bySlug = entries.reduce<Map<string, string[]>>((accumulator, entry) => {
    const folders = accumulator.get(entry.slug) ?? []
    return new Map(accumulator).set(entry.slug, [...folders, entry.folderName])
  }, new Map())

  const duplicated = [...bySlug.entries()].filter(([, folders]) => folders.length > 1)
  if (duplicated.length > 0) {
    const details = duplicated
      .map(([slug, folders]) => `"${slug}" ← ${folders.join(', ')}`)
      .join(' / ')
    throw new Error(`記事スラッグが重複しています: ${details}`)
  }
}

/** 公開日の降順、同日はフォルダ名の降順で並べた新しい配列を返す（REQ-003 / EDGE-104） */
export function sortPostsByDateDesc<T extends SortableEntry>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return a.folderName < b.folderName ? 1 : -1
  })
}

/**
 * 記事本文の相対リンク（../<slug>/ など）を、base付きの絶対パスへ解決する。
 *
 * 記事は `${base}posts/<slug>/` で配信される。相対リンクをそのまま出力すると、
 * 解決の起点が「今いるページのURLの末尾スラッシュの有無」に左右される。
 * 一覧からクリックした直後のURLは末尾スラッシュなし（/posts/mea-viewer）に
 * なるため、../foo/ が posts/ ごと1階層余計に上がって 404 になる。
 * これを避けるため、記事自身のURLを起点に絶対パスへ畳んでおく。
 *
 * base・外部URL・アンカー・ルート相対は対象外（そのまま返す）。
 */
export function resolvePostHref(href: string, base: string, slug: string): string {
  if (!/^\.\.?\//.test(href)) return href
  const origin = 'https://blog.invalid'
  const from = new URL(`${base}posts/${slug}/`, origin)
  return new URL(href, from).pathname
}

/**
 * 本番で404になるルート相対リンクかどうかを判定する。
 *
 * `/` から始まるがサイトのbase（/tech-blog-kkito/）で始まらないリンクは、
 * ドメイン直下を指してしまい本番でだけ壊れる。base付きの絶対パスや
 * プロトコル相対（//example.com）は正しいので対象外。
 */
export function isBrokenRootRelativeHref(href: string, base: string): boolean {
  return href.startsWith('/') && !href.startsWith('//') && !href.startsWith(base)
}

/** draft記事を除外した新しい配列を返す。includeDraftsがtrue（開発時）はそのまま返す（REQ-102） */
export function excludeDrafts<T extends { draft: boolean }>(
  entries: readonly T[],
  includeDrafts: boolean,
): T[] {
  return includeDrafts ? [...entries] : entries.filter((entry) => !entry.draft)
}
