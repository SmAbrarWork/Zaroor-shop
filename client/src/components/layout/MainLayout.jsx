import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-primary)] text-[var(--color-text)] transition-colors duration-500">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
