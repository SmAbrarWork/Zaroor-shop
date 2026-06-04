import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { selectIsAuthenticated } from '../features/auth/authSelectors'
import { formatCurrencyPKR } from '../utils/dateUtils'
import api from '../utils/api'
import Button from '../components/ui/Button'
import { labelForShippingKey } from '../constants/shippingDestinations.js'

const paymentLabel = (id) => {
  if (id === 'jazzcash') return 'JazzCash'
  if (id === 'easypaisa') return 'Easypaisa'
  if (id === 'cod') return 'Cash on delivery'
  return id || '—'
}

export default function OrderConfirmation() {
  const { id } = useParams()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id || !isAuthenticated) return
    let cancelled = false
    api
      .get(`/orders/${id}`)
      .then(({ data }) => {
        if (!cancelled) setOrder(data.data)
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `/order/${id}` }} />
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center text-sm text-white/50">
        Loading order…
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-white/12 bg-white/5 p-8 text-center">
        <p className="font-semibold">We couldn&apos;t load this order.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back to shop</Button>
        </Link>
      </div>
    )
  }

  const ship = order.shippingAddress || {}
  const itemsSubtotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0
  const shippingAmt = Number(order.shippingAmount) || 0

  return (
    <div className="mx-auto max-w-lg space-y-6 px-1 sm:px-0">
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-6 text-center sm:px-8">
        <p className="text-sm font-medium text-emerald-200/95">Thank you</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Order received</h1>
        <p className="mt-2 text-xs text-white/55 sm:text-sm">
          Reference <span className="font-mono text-white/80">{order._id?.slice(-10)}</span>
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/12 bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)] p-5 text-sm sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/55">Ship to</p>
          <p className="mt-1 font-bold">{ship.fullName}</p>
          <p className="mt-1 text-white/65">{ship.phone}</p>
          <p className="mt-2 text-white/65">{ship.address}</p>
          <p className="text-white/65">{ship.city}</p>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-white/55">Payment</p>
          <p className="mt-1 font-bold">{paymentLabel(order.paymentMethod)}</p>
          <p className="mt-1 text-xs text-white/45">
            {order.paymentMethod === 'cod'
              ? 'Have the exact amount ready — pay the delivery rider when your parcel arrives.'
              : 'Our team may contact you on your phone to complete payment.'}
          </p>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-white/55">Order breakdown</p>
          <div className="mt-2 space-y-1 text-sm text-white/70">
            <div className="flex justify-between gap-4">
              <span>Items subtotal</span>
              <span className="tabular-nums">{formatCurrencyPKR(itemsSubtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>
                Shipping ({order.shippingDestination ? labelForShippingKey(order.shippingDestination) : '—'})
                {order.freeShippingQualified ? (
                  <span className="ml-1 text-emerald-400/90">· promo</span>
                ) : null}
              </span>
              <span className="tabular-nums">
                {order.freeShippingQualified && shippingAmt === 0
                  ? 'Free'
                  : formatCurrencyPKR(shippingAmt)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/55">Order total</p>
          <p className="mt-1 text-xl font-black text-[var(--color-accent)]">{formatCurrencyPKR(order.totalAmount)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/" className="block sm:inline-flex">
          <Button className="w-full min-h-[44px] sm:w-auto">Continue shopping</Button>
        </Link>
      </div>
    </div>
  )
}
