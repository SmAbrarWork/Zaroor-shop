/**
 * Convert hex color to sRGB 0–255 triple.
 */
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null
  let h = hex.trim().replace('#', '')
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('')
  }
  if (h.length !== 6) return null
  const n = parseInt(h, 16)
  if (Number.isNaN(n)) return null
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * WCAG relative luminance (approx.) — returns 0–1.
 */
function relativeLuminanceRgb([r, g, b]) {
  const lin = [r, g, b].map((c) => {
    const x = c / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

/**
 * Readable label color on top of an accent-filled button.
 */
function contrastOnAccent(accentHex) {
  const rgb = hexToRgb(accentHex)
  if (!rgb) return '#0f172a'
  const L = relativeLuminanceRgb(rgb)
  return L > 0.45 ? '#0f172a' : '#fafafa'
}

export const applyEventTheme = (eventTheme) => {
  if (!eventTheme) return

  const root = document.documentElement
  root.style.setProperty('--color-primary', eventTheme.primary)
  root.style.setProperty('--color-accent', eventTheme.accent)
  root.style.setProperty('--color-text', eventTheme.text)
  root.style.setProperty('--color-surface', eventTheme.surface ?? eventTheme.primary)
  root.style.setProperty('--toast-action-fg', contrastOnAccent(eventTheme.accent))
}
