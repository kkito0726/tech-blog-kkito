import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

function readCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/**
 * テーマの状態と切り替え。初期適用はindex.htmlのインラインスクリプトが担い（FOUC防止）、
 * このフックはトグル操作と永続化（REQ-201）のみを担当する。
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(readCurrentTheme())
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      try {
        localStorage.setItem('theme', next)
      } catch {
        /* プライベートモード等では永続化しない */
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
