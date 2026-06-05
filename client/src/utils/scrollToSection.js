/** Scroll to a page section by id; accounts for sticky header via scroll-margin on targets. */
export function scrollToSection(id, { behavior = 'smooth' } = {}) {
  if (!id) return false
  const el = document.getElementById(id)
  if (!el) return false
  el.scrollIntoView({ behavior, block: 'start' })
  return true
}

/** Parse `/#shop-hot-drops`, `#shop-hot-drops`, or `/shop#x` style hrefs. */
export function parseHashHref(href) {
  const raw = (href || '').trim()
  if (!raw.includes('#')) return null
  if (raw.startsWith('#')) return { pathname: '/', hash: raw.slice(1) }
  const hashIndex = raw.indexOf('#')
  const pathname = raw.slice(0, hashIndex) || '/'
  const hash = raw.slice(hashIndex + 1)
  if (!hash) return null
  return { pathname, hash }
}
