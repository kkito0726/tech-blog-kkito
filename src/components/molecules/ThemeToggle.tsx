import { useTheme } from '../../hooks/useTheme'

/** テーマ切り替え。主ラベルは平易な日本語、コマンド表記は副次的な演出に留める */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
      className="group flex items-center gap-2 rounded border border-line px-3 py-1.5 text-dim transition-colors duration-200 hover:border-green hover:text-green"
    >
      <span
        aria-hidden="true"
        className={`block h-3 w-3 flex-none rounded-full border border-current transition-colors duration-200 ${
          isDark ? 'bg-current' : 'bg-transparent'
        }`}
      />
      <span className="text-[12px]">{isDark ? 'ダークモード' : 'ライトモード'}</span>
    </button>
  )
}
