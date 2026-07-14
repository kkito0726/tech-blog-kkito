import { useEffect, useState } from 'react'

/**
 * 表示中の見出しIDを追跡する（目次のアクティブ表示用）。
 * IntersectionObserverが使えないSSR環境では何もしない。
 */
export function useActiveHeading(headingIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (headingIds.length === 0 || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-10% 0px -70% 0px' },
    )

    const headings = headingIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    headings.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [headingIds])

  return activeId
}
