import { useTheme } from '../../hooks/useTheme'

/** 昼/夜切り替え。日輪と月をひとつの円で表現したトグル */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え'}
      className="group inline-flex items-center gap-2.5 rounded-full border border-line px-3.5 py-1.5 transition-colors duration-300 hover:border-vermilion"
    >
      <span
        aria-hidden="true"
        className="relative block h-3.5 w-3.5 overflow-hidden rounded-full border border-current transition-transform duration-500 group-hover:rotate-180"
      >
        <span
          className={`absolute inset-0 bg-current transition-transform duration-500 ${
            isDark ? 'translate-x-1/2' : 'translate-x-0'
          }`}
        />
      </span>
      <span className="font-mono text-[11px] tracking-[0.22em]">{isDark ? '夜' : '昼'}</span>
    </button>
  )
}
