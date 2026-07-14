import { useMemo } from 'react'
import { useActiveHeading } from '../../hooks/useActiveHeading'
import type { TocItem } from '../../types/post'

interface TocListProps {
  items: readonly TocItem[]
}

/** 目次のリスト本体。読んでいる見出しが点灯する */
export function TocList({ items }: TocListProps) {
  const ids = useMemo(() => items.map((item) => item.id), [items])
  const activeId = useActiveHeading(ids)

  return (
    <ul className="space-y-2 text-[12px] leading-relaxed">
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
                {item.depth === 2 ? '##' : ' ###'}
              </span>
              <span>{item.text}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
