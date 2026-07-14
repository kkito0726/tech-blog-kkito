import type { TocItem } from '../../types/post'
import { TocList } from '../molecules/TocList'

interface MobileTocProps {
  items: readonly TocItem[]
}

/** モバイル用の折りたたみ目次。記事本文の前に置く（lg以上では非表示） */
export function MobileToc({ items }: MobileTocProps) {
  if (items.length === 0) return null

  return (
    <details className="group mb-10 rounded-md border border-line bg-panel/60 lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[12px] text-dim [&::-webkit-details-marker]:hidden">
        <span className="prompt-line">grep &quot;^##&quot; index.md</span>
        <span
          aria-hidden="true"
          className="text-green transition-transform duration-200 group-open:rotate-90"
        >
          ▸
        </span>
      </summary>
      <div className="border-t border-dashed border-line px-5 py-4">
        <TocList items={items} />
      </div>
    </details>
  )
}
