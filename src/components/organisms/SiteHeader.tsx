import { Link } from 'react-router-dom'
import { site } from '../../config/site'
import { HankoMark } from '../atoms/HankoMark'
import { ThemeToggle } from '../molecules/ThemeToggle'

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="group inline-flex items-center gap-3">
          <HankoMark className="transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-display text-lg font-bold tracking-[0.08em]">{site.title}</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
