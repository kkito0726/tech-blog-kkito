import type { PostSummary } from '../../types/post'
import { PostListItem } from '../molecules/PostListItem'

interface PostListProps {
  posts: readonly PostSummary[]
}

/** 記事索引。Heroのlsコマンドの出力として続く（EDGE-101: 0件時は空状態を表示） */
export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <section id="index" className="mx-auto max-w-5xl px-5 sm:px-8" aria-label="記事一覧">
        <p className="py-14 text-[13px] text-dim">
          ls: ./posts/ にはまだ何もありません。最初の一篇をお待ちください。
        </p>
      </section>
    )
  }

  return (
    <section id="index" className="mx-auto max-w-5xl px-5 pt-2 sm:px-8" aria-label="記事一覧">
      <ol
        className="reveal border-b border-line"
        style={{ '--reveal-delay': '750ms' } as React.CSSProperties}
      >
        {posts.map((post, index) => (
          <PostListItem key={post.slug} post={post} index={index} />
        ))}
      </ol>
      <p
        className="reveal pt-5 text-right text-[11px] text-dim"
        style={{ '--reveal-delay': '900ms' } as React.CSSProperties}
      >
        total {posts.length} posts
      </p>
    </section>
  )
}
