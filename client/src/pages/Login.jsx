import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { login, register, loadUser, clearError, setToken } from '../features/auth/authSlice'
import { selectIsAuthenticated, selectAuthLoading, selectAuthError, selectUser } from '../features/auth/authSelectors'
import { fetchCart } from '../features/cart/cartSlice'
import { addToCartServer } from '../features/cart/cartSlice'
import Button from '../components/ui/Button'
import { API_ORIGIN } from '../utils/api'

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const loading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)

  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const rawFrom = location.state?.from
  const fromPath =
    typeof rawFrom === 'string'
      ? rawFrom
      : rawFrom && typeof rawFrom === 'object' && typeof rawFrom.pathname === 'string'
        ? rawFrom.pathname
        : '/'

  const resumeCheckout = fromPath === '/checkout'
  const resumeOrderView =
    typeof fromPath === 'string' && fromPath.startsWith('/order/')

  // Handle Google OAuth callback token
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      dispatch(setToken(token))
      dispatch(loadUser())
    }
    const err = searchParams.get('error')
    if (err) {
      dispatch(clearError())
      toast.error('Google sign-in did not complete', { description: 'Try again or use email.' })
    }
  }, [searchParams, dispatch])

  // Redirect after auth + sync guest cart
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest =
        fromPath && fromPath !== '/'
          ? fromPath
          : user.role === 'admin'
            ? '/admin'
            : '/'

      // Sync guest cart to server
      const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]')
      if (guestCart.length > 0) {
        const syncs = guestCart.map((item) => {
          const pid = item.product?._id || item.product?.id
          if (pid) {
            return dispatch(
              addToCartServer({
                productId: pid,
                quantity: item.quantity,
                selectedOptions: item.selectedOptions || {},
              })
            )
          }
          return null
        }).filter(Boolean)
        Promise.all(syncs).then(() => {
          localStorage.removeItem('guest_cart')
          dispatch(fetchCart())
        })
      } else {
        dispatch(fetchCart())
      }

      navigate(dest, { replace: true })
    }
  }, [isAuthenticated, user, navigate, fromPath, dispatch])

  useEffect(() => {
    return () => dispatch(clearError())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'login') {
      const result = await dispatch(login({ email, password }))
      if (login.rejected.match(result)) {
        toast.error(result.payload || 'Sign in failed')
      } else {
        toast.success('Welcome back', { description: 'Syncing your bag…' })
      }
    } else {
      const result = await dispatch(register({ name, email, password }))
      if (register.rejected.match(result)) {
        toast.error(result.payload || 'Could not create account')
      } else {
        toast.success('Account created', { description: "You're in — happy shopping." })
      }
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    dispatch(clearError())
  }

  const handleGoogle = () => {
    window.location.href = `${API_ORIGIN}/auth/google`
  }

  const suggestGoogle = typeof error === 'string' && error.toLowerCase().includes('google')

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* Tab switcher */}
      <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
        <button
          onClick={() => { setMode('login'); dispatch(clearError()) }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-[var(--color-accent)] text-black' : 'text-white/50 hover:text-white/80'}`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setMode('register'); dispatch(clearError()) }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${mode === 'register' ? 'bg-[var(--color-accent)] text-black' : 'text-white/50 hover:text-white/80'}`}
        >
          Create Account
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-black sm:text-3xl">
          {mode === 'login' ? 'Welcome Back' : 'Join the Drop'}
        </h2>
        <p className="mt-1 text-sm text-white/60">
          {resumeCheckout
            ? 'Sign in or create an account to finish checkout — shipping, and payment (cash on delivery, JazzCash, or Easypaisa).'
            : resumeOrderView
              ? 'Sign in to view your order confirmation.'
              : mode === 'login'
                ? 'Sign in to your account'
                : 'Create your account to start shopping'}
        </p>
      </div>

      {(resumeCheckout || resumeOrderView) && (
        <div className="rounded-xl border border-[var(--color-accent)]/25 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] px-4 py-3 text-center text-xs text-white/75 sm:text-sm">
          {resumeCheckout
            ? "You'll continue to checkout after signing in."
            : "You'll return to your order after signing in."}
        </div>
      )}

      {error && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            suggestGoogle
              ? 'border border-[var(--color-accent)]/35 bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-white/90'
              : 'border border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-[var(--color-accent)]"
              placeholder="Your name"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-[var(--color-accent)]"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'register' ? 6 : undefined}
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-[var(--color-accent)]"
            placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
          />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading
            ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
            : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--color-primary)] px-4 text-white/50">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className={`flex w-full items-center justify-center gap-3 rounded-full border px-6 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-white/10 ${
          suggestGoogle
            ? 'border-[var(--color-accent)]/50 bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] ring-2 ring-[var(--color-accent)]/30'
            : 'border-white/20 bg-white/5'
        }`}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-sm text-white/50">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button onClick={switchMode} className="text-[var(--color-accent)] underline">
          {mode === 'login' ? 'Create Account' : 'Sign In'}
        </button>
      </p>
    </div>
  )
}
