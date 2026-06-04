export default function AdminPageHeader({ title, count, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <h2 className="text-lg font-bold sm:text-xl">
        {title}
        {count != null && <span className="text-white/50"> ({count})</span>}
      </h2>
      {children ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">{children}</div> : null}
    </div>
  )
}
