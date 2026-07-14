interface ReadingTimeProps {
  minutes: number
  className?: string
}

/** 読了目安時間の表示 */
export function ReadingTime({ minutes, className = '' }: ReadingTimeProps) {
  return (
    <span className={`font-mono text-xs tracking-[0.18em] ${className}`}>約{minutes}分</span>
  )
}
