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
              className={`block transition-colors duration-150 ${
                item.depth === 3 ? 'pl-4' : ''
              } ${isActive ? 'glow text-green' : 'text-dim hover:text-fg'}`}
            >
              {item.text}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
