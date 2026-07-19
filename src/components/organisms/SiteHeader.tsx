import { Link } from 'react-router-dom'
import { site } from '../../config/site'
import { GitHubIcon } from '../atoms/GitHubIcon'
import { ThemeToggle } from '../molecules/ThemeToggle'

/** ターミナルウィンドウのタイトルバー */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-shell/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green/80" />
          </span>
          <Link to="/" className="text-[13px] text-dim transition-colors hover:text-green">
            <span className="text-green">kkito@blog</span>
            <span>:</span>
            <span className="text-fg">~</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${site.author} のGitHubアカウント`}
            className="text-dim transition-colors duration-200 hover:text-green"
          >
            <GitHubIcon className="h-5 w-5" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
