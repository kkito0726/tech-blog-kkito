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
        <header className="reveal pb-4 pt-12 md:pt-16">
          <p className="prompt-line text-[12px] text-dim sm:text-[13px]">
            cat <span className="text-green">./posts/{post.slug}/</span>index.md
          </p>
          <h1 className="glow mt-7 max-w-[44rem] text-2xl font-bold leading-normal text-green sm:text-3xl md:text-[2.1rem]">
            {post.title}
          </h1>
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-dim">
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
            <p className="mt-5 max-w-[40rem] text-[13px] leading-loose text-dim">
              {post.description}
            </p>
          )}
          <div className="mt-8 max-w-[44rem] border-t border-dashed border-line" />
        </header>

        <div
          className="reveal grid gap-12 pb-20 pt-4 lg:grid-cols-[minmax(0,44rem)_1fr]"
          style={{ '--reveal-delay': '150ms' } as React.CSSProperties}
        >
          <article>
            <ArticleBody html={post.html} />
            <footer className="mt-16 border-t border-dashed border-line pt-7 text-[13px]">
              <p className="text-dim">
                <span aria-hidden="true">EOF</span>
              </p>
              <Link
                to="/"
                className="prompt-line mt-4 inline-block text-dim transition-colors hover:text-green"
              >
                cd ~<span aria-hidden="true" className="block-cursor" />
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
