interface ArticleBodyProps {
  html: string
}

/**
 * 変換済み記事HTMLの描画。
 * htmlはビルド時のremark/rehypeパイプライン産で、生HTMLは通さない（NFR-101）。
 */
export function ArticleBody({ html }: ArticleBodyProps) {
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
}
