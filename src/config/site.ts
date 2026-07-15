/** サイト全体の設定（REQ-405: base / REQ-007: OGP用絶対URL） */
export const site = {
  title: 'kkito blog',
  tagline: '書いて、残す。',
  description: 'Vite + React で自作した静的ブログ。Web技術の実験と記録。',
  author: 'kkito',
  siteUrl: 'https://kkito0726.github.io/tech-blog-kkito/',
  repositoryUrl: 'https://github.com/kkito0726/tech-blog-kkito',
} as const

/** ページタイトルを「記事名 | サイト名」形式で組み立てる */
export function pageTitle(title?: string): string {
  return title ? `${title} | ${site.title}` : site.title
}

/** サイト内パスからOGP用の絶対URLを組み立てる */
export function absoluteUrl(path: string): string {
  return new URL(path.replace(/^\//, ''), site.siteUrl).toString()
}
