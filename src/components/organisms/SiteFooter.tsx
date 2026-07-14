import { site } from '../../config/site'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.22em] text-ink-soft">
          © 2026 {site.author} — {site.tagline}
        </p>
        <a
          href={site.repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] tracking-[0.22em] text-ink-soft underline decoration-vermilion underline-offset-4 transition-colors hover:text-vermilion"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
