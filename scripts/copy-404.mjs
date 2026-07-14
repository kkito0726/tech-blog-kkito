/**
 * GitHub Pagesはルート直下の404.htmlを404ページとして配信するため、
 * SSGが生成した404ルートの成果物を dist/404.html に配置する。
 */
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const candidates = [resolve(dist, '404', 'index.html'), resolve(dist, '404.html')]
const source = candidates.find((path) => existsSync(path))

if (!source) {
  throw new Error('404ページの生成物が見つかりません。routes.tsxの404ルートを確認してください。')
}

copyFileSync(source, resolve(dist, '404.html'))
console.warn('[postbuild] dist/404.html を配置しました')
