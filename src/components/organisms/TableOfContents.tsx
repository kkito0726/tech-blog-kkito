import type { TocItem } from '../../types/post'
import { TocList } from '../molecules/TocList'

interface TableOfContentsProps {
  items: readonly TocItem[]
}

/** サイドバー用の目次パネル。grepの出力風（EDGE-103: 見出しなしなら非表示） */
export function TableOfContents({ items }: TableOfContentsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="目次" className="rounded-md border border-line bg-panel/60 p-5">
      <p className="prompt-line text-[11px] text-dim">grep &quot;^##&quot; index.md</p>
      <div className="mt-4">
        <TocList items={items} />
      </div>
    </nav>
  )
}
