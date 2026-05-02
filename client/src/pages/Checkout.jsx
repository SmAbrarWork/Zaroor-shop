import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectIsAuthenticated } from '../features/auth/authSelectors'
import {
  selectCartItems,
  selectCartTotal,
  selectCartCount,
  selectCartLoading,
} from '../features/cart/cartSelectors'
import { fetchCart } from '../features/cart/cartSlice'
import { formatCurrencyPKR } from '../utils/dateUtils'
import api from '../utils/api'
import Button from '../components/ui/Button'
import SafeProductImage from '../components/ui/SafeProductImage'
import { ADMIN_SELECT } from '../utils/adminClasses.js'
import { SHIPPING_DESTINATIONS } from '../constants/shippingDestinations.js'
import { totalShippingForCartItems } from '../utils/shipping.js'

const PAYMENT_OPTIONS = [
  {
    id: 'cod',
    label: 'Cash on delivery',
    hint: 'Pay in cash when your order arrives at your door',
  },
  {
    id: 'jazzcash',
    label: 'JazzCash',
    hint: 'Mobile wallet — details shared after you place the order',
  },
  {
    id: 'easypaisa',
    label: 'Easypaisa',
    hint: 'Mobile wallet — details shared after you place the order',
  },
]

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const items = useAppSelector(selectCartItems)
  const total = useAppSelector(selectCartTotal)
  const count = useAppSelector(selectCartCount)
  const cartLoading = useAppSelector(selectCartLoading)

  const [submitting, setSubmitting] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [shippingDestination, setShippingDestination] = useState('karachi')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart())
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (!cartLoading && isAuthenticated && items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [cartLoading, isAuthenticated, items.length, navigate])

  const lineKey = (item) => {
    const pid = item.product?._id || item.product?.id
    const vk =
      item.variantKey ||
      [item.selectedOptions?.color || '', item.selectedOptions?.size || '', item.selectedOptions?.waistSize ?? ''].join('|')
    return `${pid}::${vk}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!paymentMethod) {
      toast.error('Choose a payment method')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
        },
        paymentMethod,
        shippingDestination,
      })
      const id = data?.data?._id
      if (id) {
        toast.success('Order placed', { description: 'Thank you — we will confirm soon.' })
        navigate(`/order/${id}`, { replace: true })
      } else {
        toast.error('Unexpected response from server')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order')
    } finally {
      setSubmitting(false)
    }
  }

  const paymentLabel = useMemo(
    () => PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)?.label ?? '',
    [paymentMethod]
  )

  const subtotal = total
  const shippingTotal = useMemo(
    () => totalShippingForCartItems(items, shippingDestination),
    [items, shippingDestination]
  )
  const grandTotal = subtotal + shippingTotal

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />
  }

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-6xl px-1 py-10 text-center text-sm text-white/50 sm:px-0">
        Loading your bag…
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 overflow-x-hidden pb-10">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Checkout</h1>
        <p className="text-xs text-white/50 sm:text-sm">
          <strong className="font-bold text-white/80">{count}</strong>{' '}
          {count === 1 ? 'item' : 'items'} · <strong className="font-bold text-white/80">Order total</strong>{' '}
          {formatCurrencyPKR(grandTotal)}
          {shippingTotal > 0 && (
            <span className="text-white/45"> ({formatCurrencyPKR(subtotal)} + {formatCurrencyPKR(shippingTotal)} shipping)</span>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] lg:items-start">
        <div className="min-w-0 space-y-8">
          <section className="rounded-2xl border border-white/12 bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)] p-4 sm:p-6">
            <h2 className="text-lg font-black">Shipping</h2>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">
              <strong className="font-bold text-white/85">Shipping zone</strong> sets per-item delivery rates from your bag.
              Then add your full delivery address below.
            </p>
            <label className="mt-5 block sm:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/70">Shipping destination</span>
              <select
                required
                value={shippingDestination}
                onChange={(e) => setShippingDestination(e.target.value)}
                className={`${ADMIN_SELECT} w-full min-h-[44px] rounded-xl`}
              >
                {SHIPPING_DESTINATIONS.map((z) => (
                  <option key={z.key} value={z.key}>
                    {z.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-white/40">
                Rates are set per product in admin (PKR per item). Match this to your city when possible.
              </span>
            </label>
            <p className="mt-6 text-xs font-bold text-white/75 sm:text-sm">Delivery address</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/70">Full name</span>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--color-accent)]"
                  placeholder="As on CNIC / delivery"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/70">Phone</span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--color-accent)]"
                  placeholder="03XX XXXXXXX"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/70">Street address</span>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                  className="w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--color-accent)]"
                  placeholder="House / flat, area, landmark"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/70">City</span>
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--color-accent)]"
                  placeholder="City"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-white/12 bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)] p-4 sm:p-6">
            <h2 className="text-lg font-black">Payment</h2>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">
              <strong className="font-bold text-white/85">Choose a method</strong> — instructions follow after you place the order.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors min-h-[88px] ${
                    paymentMethod === opt.id
                      ? 'border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]'
                      : 'border-white/12 bg-white/[0.04] hover:border-white/25'
                  }`}
                >
                  <span className="font-bold">{opt.label}</span>
                  <span className="mt-1 block text-xs text-white/45">{opt.hint}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              to="/cart"
              className="order-2 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-5 text-sm text-white/75 transition-colors hover:bg-white/5 sm:order-1"
            >
              Back to bag
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="order-1 min-h-[48px] w-full px-8 text-base font-semibold sm:order-2 sm:w-auto"
            >
              {submitting ? 'Placing order…' : `Place order · ${formatCurrencyPKR(grandTotal)}`}
            </Button>
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-white/12 bg-[color-mix(in_srgb,var(--color-surface)_65%,transparent)] p-4 shadow-lg sm:p-5 lg:sticky lg:top-24">
          <h3 className="text-base font-black">Order summary</h3>
          <ul className="max-h-[min(50vh,420px)] space-y-3 overflow-y-auto pr-1">
            {items.map((item) => {
              const product = item.product
              if (!product) return null
              const price = product.price ?? 0
              return (
                <li key={lineKey(item)} className="flex gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    <SafeProductImage src={product.image} alt={product.name} imgClassName="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold">{product.name}</p>
                    <p className="mt-0.5 text-xs text-white/45">
                      Qty {item.quantity} · {formatCurrencyPKR(price * item.quantity)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-white/55">Subtotal</span>
              <span className="tabular-nums font-medium">{formatCurrencyPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/55">Shipping</span>
              <span className={`tabular-nums font-medium ${shippingTotal === 0 ? 'text-emerald-400/95' : 'text-white/85'}`}>
                {shippingTotal === 0 ? 'PKR 0' : formatCurrencyPKR(shippingTotal)}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-base font-black">
              <span>Total</span>
              <span className="text-[var(--color-accent)] tabular-nums">{formatCurrencyPKR(grandTotal)}</span>
            </div>
          </div>
          {paymentLabel && (
            <p className="text-xs text-white/40">
              <span className="font-bold text-white/60">Payment</span>:{' '}
              <span className="font-semibold text-white/80">{paymentLabel}</span>
            </p>
          )}
        </aside>
      </form>
    </div>
  )
}
