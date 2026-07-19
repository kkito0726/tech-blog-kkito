import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createMermaidRenderer } from 'mermaid-isomorphic'
import type { MermaidConfig } from 'mermaid'

/**
 * ビルドごとの全再描画を避けるためのディスクキャッシュ。
 * node_modules配下なので既存の.gitignore（node_modules/）でそのまま除外される。
 * CI(GitHub Actions)でも効かせたい場合は、このディレクトリを actions/cache 等で
 * ワークフロー間に永続化する必要がある（デプロイワークフロー整備時に対応）。
 */
const CACHE_DIR = resolve(process.cwd(), 'node_modules/.cache/mermaid-diagrams')
/** テーマ配色やSVGの後処理を変更した際はここを更新し、古いキャッシュを無効化する */
const CACHE_VERSION = 'v2'

type ThemeMode = 'light' | 'dark'

/**
 * src/styles/global.css の --c-* トークンと手動で同期させている。
 * CSS変数をビルド時Node処理から直接参照できないための妥協。
 */
const PALETTE: Record<ThemeMode, Record<string, string>> = {
  light: {
    shell: '#f2efe6',
    panel: '#e8e4d5',
    fg: '#26322c',
    dim: '#5f6a63',
    line: '#d2cebc',
    green: '#0c7c4c',
    amber: '#8f5a07',
  },
  dark: {
    shell: '#0a0f0d',
    panel: '#101915',
    fg: '#c6d5cb',
    dim: '#75887d',
    line: '#1d2b24',
    green: '#3fe081',
    amber: '#f0b357',
  },
}

function mermaidConfigFor(mode: ThemeMode): MermaidConfig {
  const c = PALETTE[mode]
  return {
    theme: 'base',
    fontFamily: '"JetBrains Mono", "M PLUS 1 Code", monospace',
    themeVariables: {
      background: c.panel,
      primaryColor: c.line,
      primaryTextColor: c.fg,
      primaryBorderColor: c.green,
      secondaryColor: c.panel,
      tertiaryColor: c.shell,
      lineColor: c.dim,
      textColor: c.fg,
      mainBkg: c.line,
      nodeBorder: c.green,
      clusterBkg: c.panel,
      clusterBorder: c.line,
      defaultLinkColor: c.dim,
      titleColor: c.green,
      edgeLabelBackground: c.shell,
      // シーケンス図
      actorBkg: c.line,
      actorBorder: c.green,
      actorTextColor: c.fg,
      actorLineColor: c.dim,
      signalColor: c.fg,
      signalTextColor: c.fg,
      labelBoxBkgColor: c.panel,
      labelBoxBorderColor: c.line,
      labelTextColor: c.fg,
      loopTextColor: c.fg,
      noteBkgColor: c.panel,
      noteBorderColor: c.amber,
      noteTextColor: c.fg,
      activationBorderColor: c.green,
      activationBkgColor: c.panel,
      sequenceNumberColor: c.shell,
    },
  }
}

let renderer: ReturnType<typeof createMermaidRenderer> | null = null
function getRenderer() {
  renderer ??= createMermaidRenderer()
  return renderer
}

function diagramHash(source: string, mode: ThemeMode): string {
  return createHash('sha256').update(CACHE_VERSION).update(mode).update(source).digest('hex')
}

function cachePath(hash: string): string {
  return resolve(CACHE_DIR, `${hash}.svg`)
}

/**
 * SVGのid（既定では mermaid-0 など）を図ごとに一意な値へ書き換える。
 *
 * Mermaidが生成するSVGは内部に <style> を持ち、`#mermaid-0 .node rect { fill: ... }`
 * のように自分のidで規則を限定している。ライト用とダーク用、あるいは複数の図で
 * idが重複すると、DOM上あとに現れたSVGの規則が先のSVGにも適用され、配色が壊れる。
 * バッチやキャッシュの状況に関係なく一意にするため、内容のハッシュからidを作る。
 */
function makeIdsUnique(svg: string, hash: string): string {
  const matched = /<svg[^>]*\bid="([^"]+)"/.exec(svg)
  if (!matched) return svg
  return svg.replaceAll(matched[1], `mmd-${hash.slice(0, 12)}`)
}

function readCache(path: string): string | null {
  return existsSync(path) ? readFileSync(path, 'utf-8') : null
}

function writeCache(path: string, svg: string): void {
  mkdirSync(CACHE_DIR, { recursive: true })
  writeFileSync(path, svg, 'utf-8')
}

function snippet(source: string): string {
  const oneLine = source.trim().replace(/\s+/g, ' ')
  return oneLine.length > 80 ? `${oneLine.slice(0, 80)}…` : oneLine
}

function describeReason(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason)
}

/** 指定テーマの未キャッシュ分だけレンダリングし、結果をキャッシュへ書き込む */
async function renderTheme(diagrams: string[], mode: ThemeMode, file: string): Promise<string[]> {
  const hashes = diagrams.map((source) => diagramHash(source, mode))
  const paths = hashes.map(cachePath)
  const results = paths.map((path) => readCache(path))

  const missingIndexes = results.reduce<number[]>((acc, cached, index) => {
    if (cached === null) acc.push(index)
    return acc
  }, [])

  if (missingIndexes.length > 0) {
    const missingSources = missingIndexes.map((index) => diagrams[index])
    const rendered = await getRenderer()(missingSources, { mermaidConfig: mermaidConfigFor(mode) })

    rendered.forEach((settled, i) => {
      const diagramIndex = missingIndexes[i]
      if (settled.status === 'rejected') {
        throw new Error(
          `[markdown-posts] ${file}: Mermaid図のレンダリングに失敗しました（${mode}） — ` +
            `${describeReason(settled.reason)}\n  diagram: ${snippet(diagrams[diagramIndex])}`,
        )
      }
      const svg = makeIdsUnique(settled.value.svg, hashes[diagramIndex])
      results[diagramIndex] = svg
      writeCache(paths[diagramIndex], svg)
    })
  }

  return results as string[]
}

/**
 * Mermaidのダイアグラム文字列の配列から、ライト/ダークそれぞれのSVGを生成する。
 * 変更のない図はディスクキャッシュから読み込み、ヘッドレスブラウザでの
 * 再レンダリングをスキップする。
 */
export async function renderMermaidDiagrams(
  diagrams: string[],
  file: string,
): Promise<{ light: string[]; dark: string[] }> {
  if (diagrams.length === 0) return { light: [], dark: [] }

  const [light, dark] = await Promise.all([
    renderTheme(diagrams, 'light', file),
    renderTheme(diagrams, 'dark', file),
  ])

  return { light, dark }
}

/** ライト/ダーク両方のSVGを埋め込み、CSSの.darkクラスで表示を切り替えるラッパーHTML */
export function buildMermaidWrapperHtml(lightSvg: string, darkSvg: string): string {
  return (
    `<div class="mermaid-diagram">` +
    `<div class="mermaid-diagram-light">${lightSvg}</div>` +
    `<div class="mermaid-diagram-dark">${darkSvg}</div>` +
    `</div>`
  )
}
