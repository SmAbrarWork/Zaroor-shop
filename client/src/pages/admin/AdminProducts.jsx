import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../utils/api'
import { formatCurrencyPKR } from '../../utils/dateUtils'
import { ADMIN_INPUT, ADMIN_SELECT, ADMIN_TEXTAREA, ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY } from '../../utils/adminClasses.js'
import { SHIPPING_DESTINATIONS } from '../../constants/shippingDestinations.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminTableWrap from '../../components/admin/AdminTableWrap.jsx'

const emptyShippingByDest = () =>
  Object.fromEntries(SHIPPING_DESTINATIONS.map((d) => [d.key, '']))

const emptyProduct = {
  name: '',
  slug: '',
  event: '',
  category: '',
  isHotDrop: false,
  hotDropOrder: 0,
  productType: 'shirt',
  initialPrice: '',
  discountedPrice: '',
  image: '',
  description: '',
  tags: '',
  stock: '',
  colors: [],
  sizes: [],
  waistSizes: [],
  variantColor: '',
  variantSize: '',
  variantWaistSize: '',
  variantQty: '',
  variantStock: [],
  shippingByDest: emptyShippingByDest(),
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [optionInput, setOptionInput] = useState({ colors: '', sizes: '', waistSizes: '' })
  const [categoriesForEvent, setCategoriesForEvent] = useState([])

  const clearForm = () => {
    setForm(emptyProduct)
    setEditing(null)
    setError('')
    setOptionInput({ colors: '', sizes: '', waistSizes: '' })
  }

  const addOption = (field) => {
    const rawValue = optionInput[field].trim()
    if (!rawValue) return
    const value = field === 'waistSizes' ? Number(rawValue) : rawValue
    if (field === 'waistSizes' && (!Number.isFinite(value) || value <= 0)) {
      setError('Waist size must be a positive number')
      return
    }
    setForm((prev) => {
      if (prev[field].includes(value)) return prev
      return { ...prev, [field]: [...prev[field], value] }
    })
    setError('')
    setOptionInput((prev) => ({ ...prev, [field]: '' }))
  }

  const removeOption = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value),
      variantStock: (prev.variantStock || []).filter((entry) => entry[field === 'waistSizes' ? 'waistSize' : field.slice(0, -1)] !== value),
    }))
  }

  const addVariantRow = () => {
    const color = form.variantColor.trim()
    const size = form.variantSize.trim()
    const waistSize = form.variantWaistSize === '' ? null : Number(form.variantWaistSize)
    const stock = Number(form.variantQty)
    if (!Number.isFinite(stock) || stock < 0) {
      setError('Variant stock must be a non-negative number')
      return
    }
    if (form.productType === 'shirt' && !size) {
      setError('Shirt variant must have a size')
      return
    }
    if (form.productType === 'pants' && waistSize === null) {
      setError('Pants variant must have a waist size')
      return
    }
    if (waistSize !== null && (!Number.isFinite(waistSize) || waistSize <= 0)) {
      setError('Waist size must be a positive number')
      return
    }
    const key = `${color}|${size}|${waistSize ?? ''}`
    const existing = (form.variantStock || []).some((entry) => `${entry.color || ''}|${entry.size || ''}|${entry.waistSize ?? ''}` === key)
    if (existing) {
      setError('This variant row already exists')
      return
    }
    setError('')
    setForm((prev) => ({
      ...prev,
      variantStock: [...(prev.variantStock || []), { color, size, waistSize, stock }],
      variantColor: '',
      variantSize: '',
      variantWaistSize: '',
      variantQty: '',
    }))
  }

  const removeVariantRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      variantStock: prev.variantStock.filter((_, index) => index !== idx),
    }))
  }

  const fetchProducts = () => {
    api.get('/admin/products').then(({ data }) => {
      setProducts(data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const fetchEvents = () => {
    api.get('/admin/events').then(({ data }) => {
      setEvents(data.data)
    }).catch(() => {})
  }

  useEffect(() => {
    fetchProducts()
    fetchEvents()
  }, [])

  useEffect(() => {
    if (!form.event) {
      setCategoriesForEvent([])
      return
    }
    api
      .get('/admin/categories', { params: { eventId: form.event } })
      .then(({ data }) => setCategoriesForEvent(data.data || []))
      .catch(() => setCategoriesForEvent([]))
  }, [form.event])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const selectedEvent = events.find((ev) => ev._id === form.event)
    const tags = typeof form.tags === 'string'
      ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : form.tags
    if (selectedEvent?.slug && !tags.includes(selectedEvent.slug)) {
      tags.push(selectedEvent.slug)
    }

    const variantStock = (form.variantStock || []).map((entry) => ({
      color: entry.color || '',
      size: entry.size || '',
      waistSize: entry.waistSize ?? null,
      stock: Number(entry.stock ?? 0),
    }))

    const shippingRates = SHIPPING_DESTINATIONS.map((d) => {
      const raw = form.shippingByDest?.[d.key]?.toString().trim()
      if (raw === '' || raw === undefined) return null
      const cost = Number(raw)
      if (!Number.isFinite(cost) || cost < 0) return null
      return { destination: d.key, cost: Math.round(cost) }
    }).filter(Boolean)

    const payload = {
      name: form.name,
      slug: form.slug,
      event: form.event || null,
      category: form.category || null,
      isHotDrop: Boolean(form.isHotDrop),
      hotDropOrder: Number(form.hotDropOrder) || 0,
      productType: form.productType,
      initialPrice: Number(form.initialPrice),
      discountedPrice: form.discountedPrice === '' ? null : Number(form.discountedPrice),
      stock: Number(form.stock),
      image: form.image,
      description: form.description,
      tags,
      options: {
        colors: form.colors,
        sizes: form.sizes,
        waistSizes: form.waistSizes,
      },
      variantStock,
      shippingRates,
    }
    if (payload.productType === 'shirt' && payload.options.sizes.length === 0) {
      setError('Shirt products need at least one size')
      return
    }
    if (payload.productType === 'pants' && payload.options.waistSizes.length === 0) {
      setError('Pants products need at least one waist size')
      return
    }
    if (variantStock.some((entry) => Number.isNaN(entry.stock) || entry.stock < 0)) {
      setError('Variant stock must be a non-negative number')
      return
    }
    try {
      if (editing) {
        await api.put(`/admin/products/${editing}`, payload)
      } else {
        await api.post('/admin/products', payload)
      }
      setShowForm(false)
      clearForm()
      fetchProducts()
      toast.success(editing ? 'Product updated' : 'Product published', {
        description: payload.name,
      })
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save product'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleEdit = (product) => {
    setEditing(product._id)
    setForm({
      name: product.name,
      slug: product.slug,
      event: product.event?._id || '',
      category: product.category?._id || '',
      isHotDrop: Boolean(product.isHotDrop),
      hotDropOrder: product.hotDropOrder ?? 0,
      productType: product.productType || 'shirt',
      image: product.image,
      initialPrice: product.initialPrice ?? product.price,
      discountedPrice: product.discountedPrice ?? '',
      description: product.description,
      tags: product.tags?.join(', ') || '',
      stock: product.stock,
      colors: product.options?.colors || [],
      sizes: product.options?.sizes || [],
      waistSizes: product.options?.waistSizes || [],
      variantColor: '',
      variantSize: '',
      variantWaistSize: '',
      variantQty: '',
      variantStock: product.variantStock || [],
      shippingByDest: (() => {
        const m = emptyShippingByDest()
        for (const r of product.shippingRates || []) {
          if (r?.destination) m[r.destination] = String(r.cost ?? '')
        }
        return m
      })(),
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      fetchProducts()
      toast.success('Product removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete product')
    }
  }

  if (loading) return <p className="text-sm text-white/50">Loading...</p>

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] p-4 text-sm text-white/80">
        <p className="font-semibold text-white/95">Storefront workflow</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-white/70">
          <li>
            <strong className="text-white/85">Event</strong> — locks this product to one campaign (Azadi, Anime, etc.).
          </li>
          <li>
            <strong className="text-white/85">Category</strong> — controls where it appears under the shop menu (e.g. Street bottoms). Same category name can exist per event without mixing.
          </li>
          <li>
            <strong className="text-white/85">Hot drop</strong> — only these show on the home page strip; use order for left-to-right priority. Everything else is reached via Full catalog or category tabs.
          </li>
          <li>Product images are shown in a fixed tile — large uploads are cropped to fit.</li>
          <li>
            <strong className="text-white/85">Shipping (PKR per item)</strong> — set rates per destination zone; checkout adds (rate × quantity) per product.
          </li>
        </ol>
      </div>
      <AdminPageHeader title="Products" count={products.length}>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm)
            clearForm()
          }}
          className={ADMIN_BTN_SECONDARY}
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </AdminPageHeader>
      {showForm && (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-white/15 bg-slate-900/40 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {error && <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-300 sm:col-span-2">{error}</p>}
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required className={ADMIN_INPUT} />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" required className={ADMIN_INPUT} />
          <select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value, category: '' })} className={`${ADMIN_SELECT} w-full`}>
            <option value="">No Event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>{event.name}</option>
            ))}
          </select>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={`${ADMIN_SELECT} w-full`}
            disabled={!form.event}
          >
            <option value="">No category</option>
            {categoriesForEvent.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.isHotDrop}
              onChange={(e) => setForm({ ...form, isHotDrop: e.target.checked })}
            />
            Hot drop (featured strip)
          </label>
          <input
            type="number"
            min={0}
            value={form.hotDropOrder}
            onChange={(e) => setForm({ ...form, hotDropOrder: e.target.value })}
            placeholder="Hot drop order"
            title="Lower numbers appear first in Hot drops"
            className={ADMIN_INPUT}
          />
          <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} className={`${ADMIN_SELECT} w-full`}>
            <option value="shirt">Shirt</option>
            <option value="pants">Pants</option>
            <option value="other">Other</option>
          </select>
          <input value={form.initialPrice} onChange={(e) => setForm({ ...form, initialPrice: e.target.value })} placeholder="Initial Price (PKR)" type="number" required className={ADMIN_INPUT} />
          <input value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} placeholder="Discounted Price (optional)" type="number" className={ADMIN_INPUT} />
          <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" className={ADMIN_INPUT} />
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" required className={`${ADMIN_INPUT} sm:col-span-2 xl:col-span-3`} />
          <div className="space-y-2 sm:col-span-2 xl:col-span-3">
            <p className="text-xs text-white/60">Colors</p>
            <div className="flex gap-2">
              <input value={optionInput.colors} onChange={(e) => setOptionInput({ ...optionInput, colors: e.target.value })} placeholder="Type color and press Add" className={`${ADMIN_INPUT} flex-1`} />
              <button type="button" onClick={() => addOption('colors')} className="rounded-lg border border-white/20 px-3 text-xs">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.colors.map((value) => (
                <button type="button" key={value} onClick={() => removeOption('colors', value)} className="rounded-full border border-white/20 px-2 py-1 text-xs hover:border-red-400/60">
                  {value} ×
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2 xl:col-span-3">
            <p className="text-xs text-white/60">Sizes (for shirts)</p>
            <div className="flex gap-2">
              <input value={optionInput.sizes} onChange={(e) => setOptionInput({ ...optionInput, sizes: e.target.value })} placeholder="Type size and press Add" className={`${ADMIN_INPUT} flex-1`} />
              <button type="button" onClick={() => addOption('sizes')} className="rounded-lg border border-white/20 px-3 text-xs">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.sizes.map((value) => (
                <button type="button" key={value} onClick={() => removeOption('sizes', value)} className="rounded-full border border-white/20 px-2 py-1 text-xs hover:border-red-400/60">
                  {value} ×
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2 xl:col-span-3">
            <p className="text-xs text-white/60">Waist sizes (for pants)</p>
            <div className="flex gap-2">
              <input value={optionInput.waistSizes} onChange={(e) => setOptionInput({ ...optionInput, waistSizes: e.target.value })} placeholder="Type waist size number (e.g. 30)" className={`${ADMIN_INPUT} flex-1`} />
              <button type="button" onClick={() => addOption('waistSizes')} className="rounded-lg border border-white/20 px-3 text-xs">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.waistSizes.map((value) => (
                <button type="button" key={value} onClick={() => removeOption('waistSizes', value)} className="rounded-full border border-white/20 px-2 py-1 text-xs hover:border-red-400/60">
                  {value} ×
                </button>
              ))}
            </div>
          </div>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma-separated)" className={`${ADMIN_INPUT} sm:col-span-2 xl:col-span-3`} />
          <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 sm:col-span-2 xl:col-span-3">
            <p className="text-xs text-white/60">Variant stock</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <input value={form.variantColor} onChange={(e) => setForm({ ...form, variantColor: e.target.value })} placeholder="Color" className={`${ADMIN_INPUT} py-2 text-xs`} />
              <input value={form.variantSize} onChange={(e) => setForm({ ...form, variantSize: e.target.value })} placeholder="Size" className={`${ADMIN_INPUT} py-2 text-xs`} />
              <input value={form.variantWaistSize} onChange={(e) => setForm({ ...form, variantWaistSize: e.target.value })} placeholder="Waist size" className={`${ADMIN_INPUT} py-2 text-xs`} />
              <input value={form.variantQty} onChange={(e) => setForm({ ...form, variantQty: e.target.value })} placeholder="Stock" type="number" min="0" className={`${ADMIN_INPUT} py-2 text-xs`} />
              <button type="button" onClick={addVariantRow} className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/5">Add Variant</button>
            </div>
            {(form.variantStock || []).length > 0 && (
              <div className="space-y-1">
                {form.variantStock.map((entry, idx) => (
                  <div key={`${entry.color}-${entry.size}-${entry.waistSize}-${idx}`} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs">
                    <span>{entry.color || '-'} / {entry.size || '-'} / {entry.waistSize ?? '-'} / stock: {entry.stock}</span>
                    <button type="button" onClick={() => removeVariantRow(idx)} className="text-red-300 hover:text-red-200">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2 xl:col-span-3">
            <p className="text-xs font-semibold text-white/85">Shipping cost (PKR per item, by destination)</p>
            <p className="text-[11px] text-white/45">
              Set how much to charge per quantity unit for each zone. Checkout sums these × qty. Leave blank for PKR 0.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SHIPPING_DESTINATIONS.map((d) => (
                <label key={d.key} className="block">
                  <span className="text-[11px] text-white/55">{d.label}</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.shippingByDest[d.key] ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        shippingByDest: { ...form.shippingByDest, [d.key]: e.target.value },
                      })}
                    placeholder="0"
                    className={`${ADMIN_INPUT} mt-0.5 w-full py-2 text-sm`}
                  />
                </label>
              ))}
            </div>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (shows on product cards and detail page)" rows={3} className={`${ADMIN_TEXTAREA} sm:col-span-2 xl:col-span-3`} />
          <button type="submit" className={`${ADMIN_BTN_PRIMARY} sm:col-span-2 xl:col-span-3`}>
            {editing ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <AdminTableWrap>
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs text-white/50">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Event</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Hot</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-white/5">
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-xs text-white/60">{p.event?.name || '-'}</td>
                <td className="px-4 py-2 text-xs text-white/55">{p.category?.name || '—'}</td>
                <td className="px-4 py-2 text-xs">{p.isHotDrop ? <span className="text-amber-300">Yes</span> : '—'}</td>
                <td className="px-4 py-2 text-xs uppercase text-white/60">{p.productType || 'other'}</td>
                <td className="px-4 py-2">
                  {p.discountedPrice
                    ? <span>{formatCurrencyPKR(p.discountedPrice)} <span className="text-xs text-emerald-300">({p.discountPercent}% OFF)</span></span>
                    : formatCurrencyPKR(p.initialPrice || p.price)}
                </td>
                <td className="px-4 py-2">{p.stock}</td>
                <td className="px-4 py-2 text-xs text-white/50">{(p.tags || []).join(', ')}</td>
                <td className="flex gap-2 px-4 py-2">
                  <button onClick={() => handleEdit(p)} className="text-xs text-blue-400 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="text-xs text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableWrap>
    </div>
  )
}
