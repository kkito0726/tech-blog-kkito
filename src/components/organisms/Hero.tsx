import { site } from '../../config/site'

/** トップページの扉。シェルセッションが記事索引（lsの出力）へと続く */
export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-4 pt-16 sm:px-8 md:pt-24">
      <h1
        className="reveal glow text-4xl font-bold tracking-tight text-green sm:text-6xl md:text-7xl"
        style={{ '--reveal-delay': '60ms' } as React.CSSProperties}
      >
        kkito.log
        <span aria-hidden="true" className="block-cursor" />
      </h1>

      <div className="mt-12 space-y-6 text-[13px] leading-relaxed sm:text-sm">
        <div className="reveal" style={{ '--reveal-delay': '350ms' } as React.CSSProperties}>
          <p className="prompt-line text-dim">whoami</p>
          <p className="mt-1.5 text-fg">{site.author} — software engineer</p>
        </div>
        <p
          className="prompt-line reveal text-dim"
          style={{ '--reveal-delay': '550ms' } as React.CSSProperties}
        >
          ls -la ./posts/ <span className="text-amber">--sort=date</span>
        </p>
      </div>
    </section>
  )
}
