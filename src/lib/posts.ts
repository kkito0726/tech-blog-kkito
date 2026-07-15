import type { Post, PostModule } from '../types/post'
import { assertUniqueSlugs, deriveSlug, excludeDrafts, sortPostsByDateDesc } from './postCollection'

const FOLDER_PATTERN = /^\/content\/posts\/([^/]+)\/index\.md$/

const modules = import.meta.glob<PostModule>('/content/posts/*/index.md', { eager: true })

function toPost(key: string, module: PostModule): Post {
  const matched = FOLDER_PATTERN.exec(key)
  if (!matched) {
    throw new Error(`記事パスが規約に一致しません: ${key}`)
  }
  const folderName = matched[1]
  return {
    ...module.frontmatter,
    slug: deriveSlug(folderName),
    folderName,
    html: module.html,
    toc: module.toc,
    readingMinutes: module.readingMinutes,
  }
}

function buildPosts(): readonly Post[] {
  const all = Object.entries(modules).map(([key, module]) => toPost(key, module))
  assertUniqueSlugs(all)
  const visible = excludeDrafts(all, import.meta.env.DEV)
  return sortPostsByDateDesc(visible)
}

/** 公開対象の記事（公開日降順）。開発時のみdraftも含む */
export const posts: readonly Post[] = buildPosts()

export function findPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}
