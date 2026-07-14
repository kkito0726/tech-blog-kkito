import { useTheme } from '../../hooks/useTheme'

/** テーマ切り替え。CLIのオプションフラグ風 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え'}
      className="rounded border border-line px-3 py-1.5 text-[11px] text-dim transition-colors duration-200 hover:border-green hover:text-green"
    >
      --theme={isDark ? 'dark' : 'light'}
    </button>
  )
}
