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
import type { PostFrontmatter, TocItem } from '../src/types/post'
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
  return {
    name: 'blog:markdown-posts',
    enforce: 'pre',
    async transform(code, id) {
      const [filepath] = id.split('?')
      if (!POST_FILE_PATTERN.test(filepath)) return null

      const { data, content } = matter(code)
      const frontmatter = parseFrontmatter(data, filepath)
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
