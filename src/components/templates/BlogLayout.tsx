import { Outlet, ScrollRestoration } from 'react-router-dom'
import { SiteFooter } from '../organisms/SiteFooter'
import { SiteHeader } from '../organisms/SiteHeader'

/** 全ページ共通の骨格 */
export function BlogLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  )
}
