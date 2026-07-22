import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import rehypeShiki from '@shikijs/rehype'
import matter from 'gray-matter'
import type { Element, Root, Text } from 'hast'
import { toString as hastToString } from 'hast-util-to-string'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import type { Plugin } from 'vite'
import { z } from 'zod'
import {
  deriveSlug,
  isBrokenRootRelativeHref,
  resolvePostHref,
} from '../src/lib/postCollection'
import type { PostFrontmatter, TocItem } from '../src/types/post'
import { basename } from 'node:path'
import { buildMermaidWrapperHtml, renderMermaidDiagrams } from './mermaid-renderer'

const POST_FILE_PATTERN = /\/content\/posts\/[^/]+\/index\.md$/
const RELATIVE_SRC_PATTERN = /^\.\.?\//
const IMAGE_PLACEHOLDER = (index: number) => `__BLOG_IMG_${index}__`
const MERMAID_PLACEHOLDER = (index: number) => `__BLOG_MERMAID_${index}__`
/** 日本語テックブログの平均的な読了速度（文字/分） */
const CHARS_PER_MINUTE = 550

const frontmatterSchema = z.object({
  title: z.string().min(1, 'title は必須です'),
  date: z.union([z.date(), z.string().min(1)], { message: 'date は必須です' }),
  description: z.string().optional(),
  draft: z.boolean().optional().default(false),
})

function normalizeDate(value: Date | string, file: string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`[markdown-posts] ${file}: date "${String(value)}" を日付として解釈できません`)
  }
  return date.toISOString().slice(0, 10)
}

function parseFrontmatter(raw: unknown, file: string): PostFrontmatter {
  const result = frontmatterSchema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join(', ')
    throw new Error(`[markdown-posts] ${file}: frontmatterが不正です — ${issues}`)
  }
  return {
    title: result.data.title,
    date: normalizeDate(result.data.date, file),
    description: result.data.description,
    draft: result.data.draft,
  }
}

/** h2/h3見出しからTOCを抽出するrehypeプラグイン */
function rehypeCollectToc(toc: TocItem[]) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'h2' && node.tagName !== 'h3') return
      const id = node.properties?.id
      if (typeof id !== 'string') return
      toc.push({
        id,
        text: hastToString(node),
        depth: node.tagName === 'h2' ? 2 : 3,
      })
    })
  }
}

/**
 * 相対パス画像をViteアセットとして解決するrehypeプラグイン。
 * 参照先が存在しない場合はビルドエラー（REQ-011）。
 */
function rehypeResolveImages(images: string[], markdownDir: string, file: string) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img' || typeof node.properties?.src !== 'string') return
      const src = node.properties.src
      if (!RELATIVE_SRC_PATTERN.test(src)) return
      if (!existsSync(resolve(markdownDir, src))) {
        throw new Error(`[markdown-posts] ${file}: 参照先画像 "${src}" が存在しません`)
      }
      const index = images.length
      images.push(src)
      node.properties.src = IMAGE_PLACEHOLDER(index)
      node.properties.loading = 'lazy'
    })
  }
}

/**
 * 記事本文の相対リンク（../<slug>/ など）を、base付きの絶対パスへ解決するrehypeプラグイン。
 *
 * 相対リンクは「今いるページのURLの末尾スラッシュの有無」で解決結果が変わる。
 * 一覧からクリックした直後は末尾スラッシュなしのURL（/posts/mea-viewer）になり、
 * ../foo/ が posts/ ごと1階層余計に上がって 404 になる。記事自身のURLを起点に
 * 絶対パスへ畳んでおくことで、どの入り方でも正しく解決されるようにする。
 */
function rehypeResolveLinks(base: string, slug: string) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a' || typeof node.properties?.href !== 'string') return
      node.properties.href = resolvePostHref(node.properties.href, base, slug)
    })
  }
}

/**
 * 本文中のルート相対リンク（/posts/... など）を検出してビルドを失敗させるrehypeプラグイン。
 *
 * このサイトはGitHub Pagesのサブパス（/tech-blog-kkito/）で配信されるが、
 * Markdownに直接書いた `/posts/foo/` はViteのbaseが付かず、ドメイン直下を
 * 指してしまい本番でだけ404になる。ローカルのプレビューでもビルドでも
 * 気づけないため、ここで弾く。相対リンクは rehypeResolveLinks が base付きの
 * 絶対パスへ解決済みなので、それらはこのチェックを通過する。
 */
function rehypeCheckLinks(base: string, file: string) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a' || typeof node.properties?.href !== 'string') return
      const href = node.properties.href
      if (!isBrokenRootRelativeHref(href, base)) return
      throw new Error(
        `[markdown-posts] ${file}: ルート相対リンク "${href}" は本番（GitHub Pages）で404になります。\n` +
          `  記事間のリンクは相対パスで書いてください（例: ../<slug>/ ）。外部サイトは https:// から書いてください。`,
      )
    })
  }
}

/**
 * ```mermaid コードブロックを抽出し、プレースホルダーのテキストノードに置き換える
 * rehypeプラグイン。実際のSVG化はunifiedのパイプライン外（非同期）で行うため、
 * ここではソースコードの回収と印付けのみを行う。
 */
function rehypeExtractMermaid(diagrams: string[]) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'pre' || !parent || typeof index !== 'number') return
      const codeChild = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      )
      const classNames = codeChild?.properties?.className
      const isMermaid = Array.isArray(classNames) && classNames.includes('language-mermaid')
      if (!codeChild || !isMermaid) return

      const textChild = codeChild.children.find(
        (child): child is Text => child.type === 'text',
      )
      const diagramIndex = diagrams.length
      diagrams.push(textChild?.value ?? '')
      const placeholder: Text = { type: 'text', value: MERMAID_PLACEHOLDER(diagramIndex) }
      parent.children[index] = placeholder
    })
  }
}

function estimateReadingMinutes(markdownBody: string): number {
  const plainLength = markdownBody.replace(/\s/g, '').length
  return Math.max(1, Math.round(plainLength / CHARS_PER_MINUTE))
}

/** プレースホルダー入りHTMLを、画像import変数と連結したJS式に変換する */
function buildHtmlExpression(html: string): string {
  const segments = html.split(/__BLOG_IMG_(\d+)__/)
  return segments
    .map((segment, index) => (index % 2 === 0 ? JSON.stringify(segment) : `__blogImg${segment}`))
    .filter((expression) => expression !== '""')
    .join(' + ')
}

/**
 * content/posts/{folder}/index.md を
 * { frontmatter, toc, readingMinutes, html } を named export するJSモジュールへ変換する。
 * 変換はすべてビルド時（Node側）に完結し、クライアントにはHTML文字列のみ届く。
 */
export function markdownPostsPlugin(): Plugin {
  // Viteのbase（GitHub Pagesのサブパス）。リンク解決に使う。configResolvedで確定する
  let base = '/'
  return {
    name: 'blog:markdown-posts',
    enforce: 'pre',
    configResolved(config) {
      base = config.base
    },
    async transform(code, id) {
      const [filepath] = id.split('?')
      if (!POST_FILE_PATTERN.test(filepath)) return null

      const { data, content } = matter(code)
      const frontmatter = parseFrontmatter(data, filepath)
      const slug = deriveSlug(basename(dirname(filepath)))
      const toc: TocItem[] = []
      const images: string[] = []
      const diagrams: string[] = []

      const processed = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeCollectToc(toc))
        .use(rehypeResolveImages(images, dirname(filepath), filepath))
        .use(rehypeResolveLinks(base, slug))
        .use(rehypeCheckLinks(base, filepath))
        .use(rehypeExtractMermaid(diagrams))
        .use(rehypeShiki, {
          themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
          defaultColor: false,
          onError: (error) => {
            console.warn(`[markdown-posts] ${filepath}: ハイライトをスキップしました —`, error)
          },
        })
        .use(rehypeStringify)
        .process(content)

      let htmlString = String(processed)
      if (diagrams.length > 0) {
        const { light, dark } = await renderMermaidDiagrams(diagrams, filepath)
        htmlString = diagrams.reduce(
          (html, _source, index) =>
            html.replaceAll(
              MERMAID_PLACEHOLDER(index),
              buildMermaidWrapperHtml(light[index], dark[index]),
            ),
          htmlString,
        )
      }

      const imports = images
        .map((src, index) => `import __blogImg${index} from ${JSON.stringify(src)};`)
        .join('\n')

      const moduleCode = [
        imports,
        `export const frontmatter = ${JSON.stringify(frontmatter)};`,
        `export const toc = ${JSON.stringify(toc)};`,
        `export const readingMinutes = ${estimateReadingMinutes(content)};`,
        `export const html = ${buildHtmlExpression(htmlString)};`,
      ]
        .filter(Boolean)
        .join('\n')

      return { code: moduleCode, map: null }
    },
  }
}
