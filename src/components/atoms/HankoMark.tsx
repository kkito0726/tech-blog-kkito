interface HankoMarkProps {
  className?: string
}

/** 落款（ハンコ）風のブランドマーク */
export function HankoMark({ className = '' }: HankoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-7 w-7 flex-none items-center justify-center rounded-[6px] bg-vermilion font-display text-sm font-bold text-vermilion-ink ${className}`}
    >
      記
    </span>
  )
}
