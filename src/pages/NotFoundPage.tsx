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
          className="reveal mt-10 space-y-5 text-[13px] leading-relaxed sm:text-sm"
          style={{ '--reveal-delay': '250ms' } as React.CSSProperties}
        >
          <div>
            <p className="prompt-line text-dim">cat ./requested-page</p>
            <p className="mt-1.5 text-red">
              cat: ./requested-page: No such file or directory
            </p>
          </div>
          <p className="max-w-md text-dim">
            お探しの頁は存在しないか、別の場所へ移されたようです。
          </p>
          <Link
            to="/"
            className="prompt-line inline-block text-dim transition-colors hover:text-green"
          >
            cd ~<span aria-hidden="true" className="block-cursor" />
          </Link>
        </div>
      </section>
    </>
  )
}
