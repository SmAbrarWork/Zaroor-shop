export default function AdminTableWrap({ children, hint = 'Swipe to see more columns' }) {
  return (
    <div className="relative -mx-1 sm:mx-0">
      {hint ? <p className="mb-1.5 px-1 text-[10px] text-white/35 sm:hidden">{hint}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-white/10 [scrollbar-width:thin]">
        {children}
      </div>
    </div>
  )
}
