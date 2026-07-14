interface DateLabelProps {
  date: string
  className?: string
}

/** 公開日をモノスペース+ドット区切り（2026.07.14）で表示する */
export function DateLabel({ date, className = '' }: DateLabelProps) {
  return (
    <time dateTime={date} className={`font-mono text-xs tracking-[0.18em] ${className}`}>
      {date.replaceAll('-', '.')}
    </time>
  )
}
