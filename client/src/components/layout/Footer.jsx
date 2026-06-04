import { Link } from 'react-router-dom'

const footerLink =
  'text-sm text-white/65 transition-colors hover:text-white'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-14 border-t border-white/12 bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)] transition-[border-color,color,background-color] duration-300 ease-out">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <section className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">Zaroor</p>
            <h3 className="text-lg font-black text-white">Drops-first streetwear for Pakistan</h3>
            <p className="text-sm leading-relaxed text-white/60">
              Limited campaign releases, fast checkout, and cash-on-delivery trust for daily online shoppers.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                COD active
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
                Free shipping promos
              </span>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/80">Shop</h4>
            <div className="mt-3 space-y-2">
              <Link to="/" className={footerLink}>Hot drops</Link>
              <Link to="/shop/all" className={footerLink}>Browse categories</Link>
              <Link to="/shop/shirts" className={footerLink}>Shirts</Link>
              <Link to="/cart" className={footerLink}>Your bag</Link>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/80">Customer Care</h4>
            <div className="mt-3 space-y-2">
              <Link to="/checkout" className={footerLink}>How checkout works</Link>
              <Link to="/login" className={footerLink}>Track your orders</Link>
              <p className="text-sm text-white/55">Delivery timeline: 2-5 working days (major cities)</p>
              <p className="text-sm text-white/55">Support hours: Mon-Sat, 11AM-8PM</p>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/80">Contact</h4>
            <div className="mt-3 space-y-2 text-sm">
              <a href="mailto:zaroor.shop1@gmail.com" className={footerLink}>zaroor.shop1@gmail.com</a>
              <a href="tel:+923000000000" className={footerLink}>+92 300 0000000</a>
              <p className="text-white/55">Pakistan nationwide shipping</p>
              <p className="text-white/55">Payments: Cash on delivery (live)</p>
              <p className="text-white/45">JazzCash / Easypaisa: Coming soon</p>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Zaroor. All rights reserved.</p>
          <p>Built for campaign commerce and fast conversion-focused drops.</p>
        </div>
      </div>
    </footer>
  )
}
