export const applyEventTheme = (eventTheme) => {
  if (!eventTheme) return

  const root = document.documentElement
  root.style.setProperty('--color-primary', eventTheme.primary)
  root.style.setProperty('--color-accent', eventTheme.accent)
  root.style.setProperty('--color-text', eventTheme.text)
  root.style.setProperty('--color-surface', eventTheme.surface ?? eventTheme.primary)
}
