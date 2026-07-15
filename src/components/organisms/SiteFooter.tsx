import { site } from '../../config/site'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-7 sm:px-8">
        <p className="text-[11px] text-dim">
          [process exited with code 0] © 2026 {site.author}
        </p>
        <a
          href={site.repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-dim underline decoration-green/60 underline-offset-4 transition-colors hover:text-green"
        >
          view source on github ↗
        </a>
      </div>
    </footer>
  )
}
