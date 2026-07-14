import { Link } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { pageTitle } from '../config/site'

export function NotFoundPage() {
  return (
    <>
      <Head>
        <title>{pageTitle('404 Not Found')}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <section className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-5 py-24 sm:px-8 md:py-32">
        <div className="reveal max-w-md">
          <p className="font-mono text-[11px] tracking-[0.3em] text-vermilion">404 — NOT FOUND</p>
          <div className="brush-rule mt-4 h-px w-24 bg-vermilion" />
          <p className="mt-8 text-sm leading-loose text-ink-soft">
            お探しの頁は、綴じられていないか、別の場所へ移されたようです。
          </p>
          <Link
            to="/"
            className="group mt-10 inline-flex items-center gap-3 font-mono text-xs tracking-[0.25em] transition-colors hover:text-vermilion"
          >
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            索引へ戻る
          </Link>
        </div>
        <p
          className="vertical-text reveal hidden select-none font-display text-5xl font-black text-ink-soft/40 md:block"
          style={{ '--reveal-delay': '150ms' } as React.CSSProperties}
          aria-hidden="true"
        >
          頁が見つかりません
        </p>
      </section>
    </>
  )
}
