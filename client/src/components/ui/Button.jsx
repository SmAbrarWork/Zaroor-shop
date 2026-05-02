export default function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none motion-reduce:hover:translate-y-0'

  const variants = {
    primary:
      'bg-[var(--color-accent)] text-[var(--toast-action-fg)] shadow-[0_10px_28px_color-mix(in_srgb,var(--color-accent)_32%,transparent)] hover:brightness-110',
    ghost:
      'border border-white/30 bg-white/5 text-[var(--color-text)] hover:border-white/45 hover:bg-white/[0.09]',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
