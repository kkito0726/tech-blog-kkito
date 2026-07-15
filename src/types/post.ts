/** 記事frontmatter（ビルド時にZodで検証済みの正規化データ） */
export interface PostFrontmatter {
  title: string
  /** ISO形式 YYYY-MM-DD */
  date: string
  description?: string
  draft: boolean
}

/** 目次項目（h2/h3から抽出） */
export interface TocItem {
  id: string
  text: string
  depth: 2 | 3
}

/** マークダウン変換プラグインが生成するモジュールの形 */
export interface PostModule {
  frontmatter: PostFrontmatter
  toc: TocItem[]
  readingMinutes: number
  html: string
}

/** 一覧・ソートに使う記事サマリー */
export interface PostSummary extends PostFrontmatter {
  slug: string
  folderName: string
  readingMinutes: number
}

/** 記事詳細 */
export interface Post extends PostSummary {
  html: string
  toc: readonly TocItem[]
}
