import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../utils/api'
import { ADMIN_INPUT } from '../../utils/adminClasses.js'

export default function AdminShopSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [freeShippingMinQty, setFreeShippingMinQty] = useState('')
  const [paymentMethods, setPaymentMethods] = useState({
    cod: true,
    jazzcash: false,
    easypaisa: false,
  })

  const load = () => {
    setLoading(true)
    api
      .get('/admin/shop-settings')
      .then(({ data }) => {
        const q = data.data?.freeShippingMinQty
        setFreeShippingMinQty(q != null && q >= 1 ? String(q) : '')
        setPaymentMethods({
          cod: data.data?.paymentMethods?.cod !== false,
          jazzcash: data.data?.paymentMethods?.jazzcash === true,
          easypaisa: data.data?.paymentMethods?.easypaisa === true,
        })
      })
      .catch(() => toast.error('Could not load settings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/admin/shop-settings', {
        freeShippingMinQty: freeShippingMinQty.trim() === '' ? null : Number(freeShippingMinQty),
        paymentMethods,
      })
      toast.success('Shop settings saved')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-white/50">Loading…</p>

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold">Shop settings</h2>
        <p className="mt-1 text-sm text-white/50">
          Store-wide rules for checkout. Shipping is normally per product × zone unless a product hits the free-shipping quantity below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/15 bg-slate-900/40 p-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/55">
            Free shipping — minimum quantity of one product
          </label>
          <p className="mt-1 text-xs text-white/45">
            Customer must reach this many units for <strong className="text-white/70">at least one product</strong> (all sizes/colours of that product count together).
            Example: <strong className="text-white/70">4</strong> means four units of the same product in one line, or 2+2 split across two variants—still one product. Then
            <strong className="text-white/70"> shipping is PKR 0</strong>. Leave empty to turn off.
          </p>
          <input
            type="number"
            min={1}
            step={1}
            placeholder="e.g. 4 — leave empty to disable"
            value={freeShippingMinQty}
            onChange={(e) => setFreeShippingMinQty(e.target.value)}
            className={`${ADMIN_INPUT} mt-3 w-full max-w-xs`}
          />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
            Payment methods
          </p>
          <p className="mt-1 text-xs text-white/45">
            Control which methods customers can select at checkout.
          </p>
          <div className="mt-3 space-y-2 text-sm">
            {[
              { key: 'cod', label: 'Cash on delivery' },
              { key: 'jazzcash', label: 'JazzCash' },
              { key: 'easypaisa', label: 'Easypaisa' },
            ].map((m) => (
              <label key={m.key} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2">
                <span className="text-white/80">{m.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(paymentMethods[m.key])}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setPaymentMethods((prev) => ({ ...prev, [m.key]: checked }))
                  }}
                />
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
