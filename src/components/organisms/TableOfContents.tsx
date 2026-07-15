import type { TocItem } from '../../types/post'
import { TocList } from '../molecules/TocList'

interface TableOfContentsProps {
  items: readonly TocItem[]
}

/** サイドバー用の目次パネル（EDGE-103: 見出しなしなら非表示） */
export function TableOfContents({ items }: TableOfContentsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="目次" className="rounded-md border border-line bg-panel/60 p-5">
      <p className="flex items-baseline gap-2">
        <span className="text-sm font-bold text-green">目次</span>
        <span className="text-[10px] text-dim opacity-70">grep &quot;^##&quot; index.md</span>
      </p>
      <div className="mt-4">
        <TocList items={items} />
      </div>
    </nav>
  )
}
