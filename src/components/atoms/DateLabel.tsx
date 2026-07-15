interface DateLabelProps {
  date: string
  className?: string
}

/** 公開日をISO表記のまま表示する（ターミナルのタイムスタンプ風） */
export function DateLabel({ date, className = '' }: DateLabelProps) {
  return (
    <time dateTime={date} className={`text-xs ${className}`}>
      {date}
    </time>
  )
}
