import { Link } from 'react-router-dom'
import type { PostSummary } from '../../types/post'
import { DateLabel } from '../atoms/DateLabel'
import { ReadingTime } from '../atoms/ReadingTime'

interface PostListItemProps {
  post: PostSummary
  index: number
}

/** 記事索引の1エントリ。通し番号 + 日付 + 明朝の表題 */
export function PostListItem({ post, index }: PostListItemProps) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <li className="reveal border-t border-line" style={{ '--reveal-delay': `${index * 90 + 250}ms` } as React.CSSProperties}>
      <Link
        to={`/posts/${post.slug}`}
        className="group grid grid-cols-[3.5rem_1fr] gap-x-4 py-7 sm:grid-cols-[4.5rem_1fr] sm:gap-x-8 md:py-9"
      >
        <span className="font-mono text-sm tracking-[0.2em] text-ink-soft transition-colors duration-300 group-hover:text-vermilion sm:text-base">
          {number}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-soft">
            <DateLabel date={post.date} />
            <ReadingTime minutes={post.readingMinutes} />
            {post.draft && (
              <span className="rounded-sm border border-vermilion px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] text-vermilion">
                下書き
              </span>
            )}
          </div>
          <h2 className="mt-2.5 font-display text-xl font-bold leading-snug sm:text-2xl">
            <span className="bg-gradient-to-r from-vermilion to-vermilion bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_2px]">
              {post.title}
            </span>
          </h2>
          {post.description && (
            <p className="mt-3 line-clamp-2 max-w-[42rem] text-sm leading-relaxed text-ink-soft">
              {post.description}
            </p>
          )}
        </div>
      </Link>
    </li>
  )
}
