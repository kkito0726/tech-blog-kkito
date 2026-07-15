interface ReadingTimeProps {
  minutes: number
  className?: string
}

/** 読了目安時間の表示 */
export function ReadingTime({ minutes, className = '' }: ReadingTimeProps) {
  return <span className={`text-xs ${className}`}>~{minutes}min</span>
}
