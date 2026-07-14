import { Link, useParams } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { DateLabel } from '../components/atoms/DateLabel'
import { ReadingTime } from '../components/atoms/ReadingTime'
import { ArticleBody } from '../components/organisms/ArticleBody'
import { TableOfContents } from '../components/organisms/TableOfContents'
import { absoluteUrl, pageTitle, site } from '../config/site'
import { findPost } from '../lib/posts'
import { NotFoundPage } from './NotFoundPage'

export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? findPost(slug) : undefined

  if (!post) {
    return <NotFoundPage />
  }

  return (
    <>
      <Head>
        <title>{pageTitle(post.title)}</title>
        {post.description && <meta name="description" content={post.description} />}
        <meta property="og:title" content={post.title} />
        {post.description && <meta property="og:description" content={post.description} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={absoluteUrl(`/posts/${post.slug}/`)} />
        <meta property="og:site_name" content={site.title} />
        <meta property="article:published_time" content={post.date} />
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <header className="reveal py-14 md:py-20">
          <nav className="font-mono text-[11px] tracking-[0.25em] text-ink-soft">
            <Link to="/" className="transition-colors hover:text-vermilion">
              索引
            </Link>
            <span aria-hidden="true" className="mx-3 text-vermilion">
              /
            </span>
            <span>本文</span>
          </nav>
          <h1 className="mt-8 max-w-[46rem] font-display text-3xl font-black leading-[1.4] tracking-wide sm:text-4xl md:text-[2.75rem]">
            {post.title}
          </h1>
          <div className="brush-rule mt-8 h-px w-full max-w-[46rem] bg-line" />
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-ink-soft">
            <DateLabel date={post.date} />
            <ReadingTime minutes={post.readingMinutes} />
            {post.draft && (
              <span className="rounded-sm border border-vermilion px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] text-vermilion">
                下書き
              </span>
            )}
          </div>
          {post.description && (
            <p className="mt-6 max-w-[42rem] text-sm leading-loose text-ink-soft">
              {post.description}
            </p>
          )}
        </header>

        <div className="reveal grid gap-14 pb-20 lg:grid-cols-[minmax(0,46rem)_1fr]" style={{ '--reveal-delay': '150ms' } as React.CSSProperties}>
          <article>
            <ArticleBody html={post.html} />
            <footer className="mt-20 border-t border-line pt-8">
              <Link
                to="/"
                className="group inline-flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-ink-soft transition-colors hover:text-vermilion"
              >
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                索引へ戻る
              </Link>
            </footer>
          </article>
          <aside className="hidden lg:block">
            <div className="sticky top-10">
              <TableOfContents items={post.toc} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
