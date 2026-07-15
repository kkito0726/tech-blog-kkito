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
      <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8 md:py-32">
        <p className="reveal glow text-5xl font-bold text-red sm:text-6xl">404</p>
        <div
          className="reveal mt-6 space-y-6 sm:text-sm"
          style={{ '--reveal-delay': '150ms' } as React.CSSProperties}
        >
          <p className="text-base font-bold text-fg sm:text-lg">
            お探しのページは見つかりませんでした
          </p>
          <p className="max-w-md text-[13px] leading-relaxed text-dim">
            URLが間違っているか、ページが移動・削除された可能性があります。
          </p>
          <p className="text-[11px] text-dim opacity-60">
            cat: ./requested-page: No such file or directory
          </p>
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded border border-line px-4 py-2 text-[13px] text-dim transition-colors hover:border-green hover:text-green"
          >
            <span aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            トップページに戻る
          </Link>
        </div>
      </section>
    </>
  )
}
