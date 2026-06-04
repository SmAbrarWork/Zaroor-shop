import { Link } from 'react-router-dom'

/**
 * Refined “browse catalog” control — glass outline, accent micro-icon, no loud gradients.
 */
export default function CatalogCtaLink({ to = '/shop/all', children = 'Full catalog', className = '' }) {
  return (
    <Link
      to={to}
      className={`group inline-flex min-h-11 w-full max-w-full items-center justify-between gap-2 rounded-full border border-white/[0.14] bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)] py-2 pl-4 pr-1.5 text-xs font-bold tracking-wide text-[var(--color-text)] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-md transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--color-accent)_42%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] hover:shadow-[0_8px_28px_-12px_color-mix(in_srgb,var(--color-accent)_45%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] active:translate-y-0 sm:w-auto sm:justify-center sm:gap-3 sm:py-2 sm:pl-5 sm:pr-2 sm:text-[13px] ${className}`}
    >
      <span className="min-w-0 truncate font-bold text-white">{children}</span>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-[var(--color-accent)] transition-[background-color,border-color,color,transform] duration-300 group-hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] group-hover:text-[var(--color-text)] group-hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-accent)_25%,transparent)] sm:h-9 sm:w-9"
        aria-hidden
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  )
}
