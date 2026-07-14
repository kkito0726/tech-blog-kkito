import { useMemo } from 'react'
import { useActiveHeading } from '../../hooks/useActiveHeading'
import type { TocItem } from '../../types/post'

interface TableOfContentsProps {
  items: readonly TocItem[]
}

/** 目次。読んでいる位置に朱の栞が付く（EDGE-103: 見出しなしなら非表示） */
export function TableOfContents({ items }: TableOfContentsProps) {
  const ids = useMemo(() => items.map((item) => item.id), [items])
  const activeId = useActiveHeading(ids)

  if (items.length === 0) return null

  return (
    <nav aria-label="目次" className="border-l border-line pl-5">
      <p className="font-mono text-[11px] tracking-[0.3em] text-ink-soft">目次 ── CONTENTS</p>
      <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <li key={item.id} className={item.depth === 3 ? 'pl-4' : ''}>
              <a
                href={`#${item.id}`}
                className={`relative block transition-colors duration-200 ${
                  isActive ? 'text-vermilion' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -left-[calc(1.25rem+1px)] top-0 h-full w-[2px] bg-vermilion"
                  />
                )}
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
