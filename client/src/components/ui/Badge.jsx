export default function Badge({ children }) {
  return (
    <span className="rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-text)]">
      {children}
    </span>
  )
}
