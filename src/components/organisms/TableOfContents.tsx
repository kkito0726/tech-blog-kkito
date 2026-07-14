import { useMemo } from 'react'
import { useActiveHeading } from '../../hooks/useActiveHeading'
import type { TocItem } from '../../types/post'

interface TableOfContentsProps {
  items: readonly TocItem[]
}

/** 目次。grepの出力風で、読んでいる行が点灯する（EDGE-103: 見出しなしなら非表示） */
export function TableOfContents({ items }: TableOfContentsProps) {
  const ids = useMemo(() => items.map((item) => item.id), [items])
  const activeId = useActiveHeading(ids)

  if (items.length === 0) return null

  return (
    <nav aria-label="目次" className="rounded-md border border-line bg-panel/60 p-5">
      <p className="prompt-line text-[11px] text-dim">grep &quot;^##&quot; index.md</p>
      <ul className="mt-4 space-y-2 text-[12px] leading-relaxed">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`flex gap-2 transition-colors duration-150 ${
                  isActive ? 'glow text-green' : 'text-dim hover:text-fg'
                }`}
              >
                <span aria-hidden="true" className="flex-none opacity-70">
                  {item.depth === 2 ? '##' : ' ###'}
                </span>
                <span>{item.text}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
