import { Link, useParams } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { DateLabel } from '../components/atoms/DateLabel'
import { ReadingTime } from '../components/atoms/ReadingTime'
import { ArticleBody } from '../components/organisms/ArticleBody'
import { MobileToc } from '../components/organisms/MobileToc'
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
        <header className="reveal pb-4 pt-10 md:pt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-dim transition-colors hover:text-green"
          >
            <span aria-hidden="true">←</span>
            記事一覧に戻る
          </Link>
          <p className="prompt-line mt-4 break-words text-[11px] opacity-60 [overflow-wrap:anywhere] text-dim sm:text-[12px]">
            cat <span className="text-green">./posts/{post.slug}/</span>index.md
          </p>
          <h1 className="glow mt-3 max-w-[42rem] text-xl font-bold leading-snug text-green sm:text-2xl md:text-[1.75rem]">
            {post.title}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-dim">
            <span className="text-xs">--</span>
            <DateLabel date={post.date} />
            <ReadingTime minutes={post.readingMinutes} />
            {post.draft && (
              <span className="rounded-sm border border-amber px-1.5 py-0.5 text-[10px] text-amber">
                draft
              </span>
            )}
          </p>
          {post.description && (
            <p className="mt-4 max-w-[40rem] text-[13px] leading-loose text-dim">
              {post.description}
            </p>
          )}
          <div className="mt-6 max-w-[42rem] border-t border-dashed border-line" />
        </header>

        <div
          className="reveal grid gap-10 pb-16 pt-3 lg:grid-cols-[minmax(0,42rem)_1fr]"
          style={{ '--reveal-delay': '150ms' } as React.CSSProperties}
        >
          <article className="min-w-0">
            <MobileToc items={post.toc} />
            <ArticleBody html={post.html} />
            <footer className="mt-12 border-t border-dashed border-line pt-6">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded border border-line px-4 py-2 text-[13px] text-dim transition-colors hover:border-green hover:text-green"
              >
                <span aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">
                  ←
                </span>
                記事一覧に戻る
              </Link>
            </footer>
          </article>
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <TableOfContents items={post.toc} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
