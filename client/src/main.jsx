import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import App from './App.jsx'
import { store } from './app/store'
import { fetchEvents } from './features/event/eventSlice'
import { fetchProducts } from './features/products/productSlice'
import { loadUser } from './features/auth/authSlice'
import { initAnalytics, initMetaPixel } from './utils/tracking'
import './styles/globals.css'

store.dispatch(fetchEvents())
store.dispatch(fetchProducts())
store.dispatch(loadUser())
initAnalytics()
initMetaPixel()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          richColors
          closeButton
          theme="dark"
          expand
          toastOptions={{
            duration: 4000,
            classNames: {
              toast:
                'group backdrop-blur-md shadow-2xl ring-1 ring-[color-mix(in_srgb,var(--color-accent)_22%,transparent)]',
              title: 'font-semibold tracking-tight text-[var(--color-text)]',
              description: 'text-sm',
              actionButton:
                '!bg-[var(--color-accent)] !text-[var(--toast-action-fg)] font-semibold hover:opacity-95',
              cancelButton:
                '!border-[color-mix(in_srgb,var(--color-text)_22%,transparent)] !bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] !text-[var(--color-text)]',
              closeButton:
                '!border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] !bg-[color-mix(in_srgb,var(--color-surface)_75%,transparent)] !text-[var(--color-text)] hover:!opacity-90',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
