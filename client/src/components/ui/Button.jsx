export default function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5'

  const variants = {
    primary: 'bg-[var(--color-accent)] text-slate-950',
    ghost: 'border border-white/30 bg-white/5 text-[var(--color-text)]',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
