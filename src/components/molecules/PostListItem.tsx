import { Link } from 'react-router-dom'
import type { PostSummary } from '../../types/post'
import { DateLabel } from '../atoms/DateLabel'
import { ReadingTime } from '../atoms/ReadingTime'

interface PostListItemProps {
  post: PostSummary
  index: number
}

/** 記事索引の1エントリ。ls -la の出力風 */
export function PostListItem({ post, index }: PostListItemProps) {
  return (
    <li
      className="reveal border-t border-line first:border-t-0"
      style={{ '--reveal-delay': `${index * 110 + 750}ms` } as React.CSSProperties}
    >
      <Link
        to={`/posts/${post.slug}`}
        className="group relative block py-5 pl-5 transition-colors duration-200 hover:bg-green-wash sm:pl-7 md:py-6"
      >
        <span
          aria-hidden="true"
          className="absolute left-0 top-6 text-green opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:top-7"
        >
          &gt;
        </span>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-dim">
          <span aria-hidden="true" className="hidden text-xs sm:inline">
            -rw-r--r--
          </span>
          <DateLabel date={post.date} />
          <ReadingTime minutes={post.readingMinutes} />
          <span className="text-xs text-green/80">./{post.slug}/</span>
          {post.draft && (
            <span className="rounded-sm border border-amber px-1.5 py-0.5 text-[10px] text-amber">
              draft
            </span>
          )}
        </p>
        <h2 className="mt-2 text-base font-bold leading-snug text-fg transition-colors duration-200 group-hover:text-green sm:text-lg">
          <span className="group-hover:glow">{post.title}</span>
        </h2>
        {post.description && (
          <p className="mt-2 line-clamp-2 max-w-[40rem] text-[13px] leading-relaxed text-dim">
            {post.description}
          </p>
        )}
      </Link>
    </li>
  )
}
