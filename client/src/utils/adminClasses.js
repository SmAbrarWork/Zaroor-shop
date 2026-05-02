/** Shared Tailwind classes for admin UI — pair `ADMIN_SELECT` with `.admin-select` in globals.css for readable native dropdown options. */
export const ADMIN_SELECT =
  'admin-select min-h-[40px] rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/25'

export const ADMIN_INPUT =
  'rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-500/20'

export const ADMIN_TEXTAREA = `${ADMIN_INPUT} resize-y`
