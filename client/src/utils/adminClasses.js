/** Shared Tailwind classes for admin UI — pair `ADMIN_SELECT` with `.admin-select` in globals.css for readable native dropdown options. */
export const ADMIN_SELECT =
  'admin-select min-h-[44px] rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/25'

export const ADMIN_INPUT =
  'min-h-[44px] rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-500/20'

export const ADMIN_TEXTAREA = `${ADMIN_INPUT} min-h-[88px] resize-y`

export const ADMIN_BTN =
  'inline-flex min-h-[40px] items-center justify-center rounded-lg px-3 py-2 text-xs font-medium transition-colors'

export const ADMIN_BTN_SECONDARY = `${ADMIN_BTN} border border-white/15 bg-white/5 text-white/80 hover:bg-white/10`

export const ADMIN_BTN_PRIMARY = `${ADMIN_BTN} bg-sky-600 text-white hover:bg-sky-500`

export const ADMIN_BTN_DANGER = `${ADMIN_BTN} text-red-400 hover:bg-red-500/10`

export const ADMIN_CARD =
  'rounded-xl border border-white/10 bg-white/[0.03] p-4'

export const ADMIN_STAT_CARD =
  'rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10'
