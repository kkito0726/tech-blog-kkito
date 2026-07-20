import { describe, expect, it } from 'vitest'
import {
  assertUniqueSlugs,
  deriveSlug,
  excludeDrafts,
  isRootRelativeHref,
  sortPostsByDateDesc,
} from '../src/lib/postCollection'

describe('deriveSlug', () => {
  it('フォルダ名から日付プレフィックスを除いたスラッグを返す（REQ-012）', () => {
    expect(deriveSlug('2026-07-14-launching-this-blog')).toBe('launching-this-blog')
  })

  it('日付プレフィックスがない場合はそのまま返す', () => {
    expect(deriveSlug('no-date-folder')).toBe('no-date-folder')
  })
})

describe('assertUniqueSlugs', () => {
  it('スラッグが一意なら何も起きない', () => {
    expect(() =>
      assertUniqueSlugs([
        { slug: 'a', folderName: '2026-01-01-a' },
        { slug: 'b', folderName: '2026-01-02-b' },
      ]),
    ).not.toThrow()
  })

  it('日付除去後に重複するスラッグがあれば重複フォルダ名付きで失敗する（EDGE-002）', () => {
    expect(() =>
      assertUniqueSlugs([
        { slug: 'foo', folderName: '2026-01-01-foo' },
        { slug: 'foo', folderName: '2026-02-01-foo' },
      ]),
    ).toThrow(/2026-01-01-foo, 2026-02-01-foo/)
  })
})

describe('sortPostsByDateDesc', () => {
  it('公開日の降順で並ぶ（REQ-003）', () => {
    const sorted = sortPostsByDateDesc([
      { date: '2026-06-21', folderName: '2026-06-21-old' },
      { date: '2026-07-14', folderName: '2026-07-14-new' },
    ])
    expect(sorted.map((post) => post.folderName)).toEqual(['2026-07-14-new', '2026-06-21-old'])
  })

  it('同一公開日はフォルダ名の降順で安定する（EDGE-104）', () => {
    const sorted = sortPostsByDateDesc([
      { date: '2026-07-14', folderName: '2026-07-14-alpha' },
      { date: '2026-07-14', folderName: '2026-07-14-beta' },
    ])
    expect(sorted.map((post) => post.folderName)).toEqual([
      '2026-07-14-beta',
      '2026-07-14-alpha',
    ])
  })

  it('元の配列をミューテーションしない', () => {
    const original = [
      { date: '2026-06-21', folderName: '2026-06-21-old' },
      { date: '2026-07-14', folderName: '2026-07-14-new' },
    ]
    const snapshot = [...original]
    sortPostsByDateDesc(original)
    expect(original).toEqual(snapshot)
  })
})

describe('excludeDrafts', () => {
  const entries = [{ draft: false }, { draft: true }]

  it('本番相当（includeDrafts=false）ではdraftを除外する（REQ-102）', () => {
    expect(excludeDrafts(entries, false)).toEqual([{ draft: false }])
  })

  it('開発時（includeDrafts=true）はdraftも含む', () => {
    expect(excludeDrafts(entries, true)).toHaveLength(2)
  })
})

describe('isRootRelativeHref', () => {
  it('ルート相対リンクを検出する（baseが付かず本番で404になるため）', () => {
    expect(isRootRelativeHref('/posts/foo/')).toBe(true)
    expect(isRootRelativeHref('/')).toBe(true)
  })

  it('相対パスは許可する', () => {
    expect(isRootRelativeHref('../foo/')).toBe(false)
    expect(isRootRelativeHref('./image.png')).toBe(false)
  })

  it('外部URL・プロトコル相対・アンカーは許可する', () => {
    expect(isRootRelativeHref('https://example.com/posts/')).toBe(false)
    expect(isRootRelativeHref('//example.com/posts/')).toBe(false)
    expect(isRootRelativeHref('#heading')).toBe(false)
    expect(isRootRelativeHref('mailto:a@example.com')).toBe(false)
  })
})
