export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 transition-[border-color,color] duration-300 ease-out">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <strong className="font-bold text-white/85">Built for campaign commerce</strong>
          <span className="text-white/60"> and event-based drops.</span>
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm">
          <span className="font-bold text-white/80">Shopify-ready</span>
          <span className="font-bold text-white/80">Meta Pixel-ready</span>
          <span className="font-bold text-white/80">COD &amp; JazzCash</span>
        </div>
      </div>
    </footer>
  )
}
