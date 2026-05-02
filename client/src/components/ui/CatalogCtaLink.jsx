import { Link } from 'react-router-dom'

/**
 * Refined “browse catalog” control — glass outline, accent micro-icon, no loud gradients.
 */
export default function CatalogCtaLink({ to = '/shop/all', children = 'Full catalog', className = '' }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-3 rounded-full border border-white/[0.14] bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)] py-2 pl-5 pr-2 text-[13px] font-bold tracking-wide text-[var(--color-text)] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-md transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--color-accent)_42%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] hover:shadow-[0_8px_28px_-12px_color-mix(in_srgb,var(--color-accent)_45%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] active:translate-y-0 ${className}`}
    >
      <span className="font-bold text-white">{children}</span>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-[var(--color-accent)] transition-[background-color,border-color,color,transform] duration-300 group-hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] group-hover:text-[var(--color-text)] group-hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
        aria-hidden
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  )
}
