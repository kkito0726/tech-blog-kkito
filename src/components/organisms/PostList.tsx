import type { PostSummary } from '../../types/post'
import { PostListItem } from '../molecules/PostListItem'

interface PostListProps {
  posts: readonly PostSummary[]
}

/** 記事索引。目次組みの一覧（EDGE-101: 0件時は空状態を表示） */
export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-5 sm:px-8">
        <p className="border-t border-line py-16 text-center font-display text-ink-soft">
          まだ記事がありません。最初の一篇をお待ちください。
        </p>
      </section>
    )
  }

  return (
    <section id="index" className="mx-auto max-w-5xl px-5 sm:px-8" aria-label="記事一覧">
      <div className="flex items-baseline justify-between pb-4">
        <h2 className="font-mono text-[11px] tracking-[0.3em] text-ink-soft">INDEX ── 索引</h2>
      </div>
      <ol className="border-b border-line">
        {posts.map((post, index) => (
          <PostListItem key={post.slug} post={post} index={index} />
        ))}
      </ol>
    </section>
  )
}
