import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
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
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
