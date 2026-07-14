import { site } from '../../config/site'

interface HeroProps {
  postCount: number
}

/** トップページの扉。縦書きの標語と署名的な紹介文 */
export function Hero({ postCount }: HeroProps) {
  return (
    <section className="mx-auto flex max-w-5xl items-stretch justify-between gap-8 px-5 pb-16 pt-14 sm:px-8 md:pb-24 md:pt-20">
      <div className="flex max-w-md flex-col justify-between gap-10">
        <div>
          <p className="reveal font-mono text-[11px] tracking-[0.3em] text-vermilion" style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
            TECH JOURNAL — 全{postCount}篇
          </p>
          <div className="brush-rule mt-4 h-px w-24 bg-vermilion" />
          <p className="reveal mt-8 text-sm leading-loose text-ink-soft" style={{ '--reveal-delay': '200ms' } as React.CSSProperties}>
            {site.description}
            <br />
            マークダウンを一枚置くだけで、頁が増えていく。
          </p>
        </div>
        <h1
          className="reveal font-display text-4xl font-black leading-tight tracking-wide md:hidden"
          style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
        >
          {site.tagline}
        </h1>
        <a
          href="#index"
          className="reveal hidden items-center gap-4 font-mono text-[11px] tracking-[0.3em] text-ink-soft transition-colors hover:text-vermilion md:inline-flex"
          style={{ '--reveal-delay': '350ms' } as React.CSSProperties}
        >
          <span className="scroll-cue" aria-hidden="true" />
          索引へ
        </a>
      </div>
      <h1
        className="vertical-text reveal hidden min-h-[16rem] select-none font-display text-6xl font-black md:block lg:text-7xl"
        style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
        aria-label={site.tagline}
      >
        {site.tagline}
      </h1>
    </section>
  )
}
