import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { formatCurrencyPKR } from '../../utils/dateUtils'

const emptyProduct = {
  name: '',
  slug: '',
  event: '',
  productType: 'shirt',
  initialPrice: '',
  discountedPrice: '',
  discountPercent: '',
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
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [optionInput, setOptionInput] = useState({ colors: '', sizes: '', waistSizes: '' })

  const clearForm = () => {
    setForm(emptyProduct)
    setEditing(null)
    setError('')
    setSuccess('')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
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

    const payload = {
      name: form.name,
      slug: form.slug,
      event: form.event || null,
      productType: form.productType,
      initialPrice: Number(form.initialPrice),
      discountedPrice: form.discountedPrice === '' ? null : Number(form.discountedPrice),
      discountPercent: form.discountPercent === '' ? null : Number(form.discountPercent),
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
      setSuccess(editing ? 'Product updated successfully.' : 'Product created successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
    }
  }

  const handleEdit = (product) => {
    setEditing(product._id)
    setForm({
      name: product.name,
      slug: product.slug,
      event: product.event?._id || '',
      productType: product.productType || 'shirt',
      image: product.image,
      initialPrice: product.initialPrice ?? product.price,
      discountedPrice: product.discountedPrice ?? '',
      discountPercent: product.discountPercent ?? '',
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
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/admin/products/${id}`)
    fetchProducts()
  }

  if (loading) return <p className="text-sm text-white/50">Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Products ({products.length})</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            clearForm()
          }}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>
      {success && (
        <p className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          {success}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {error && <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-300 sm:col-span-2">{error}</p>}
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30">
            <option value="">No Event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>{event.name}</option>
            ))}
          </select>
          <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30">
            <option value="shirt">Shirt</option>
            <option value="pants">Pants</option>
            <option value="other">Other</option>
          </select>
          <input value={form.initialPrice} onChange={(e) => setForm({ ...form, initialPrice: e.target.value })} placeholder="Initial Price (PKR)" type="number" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <input value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} placeholder="Discounted Price (optional)" type="number" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <input value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} placeholder="Discount % (optional)" type="number" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30 sm:col-span-2 xl:col-span-3" />
          <div className="space-y-2 sm:col-span-2 xl:col-span-3">
            <p className="text-xs text-white/60">Colors</p>
            <div className="flex gap-2">
              <input value={optionInput.colors} onChange={(e) => setOptionInput({ ...optionInput, colors: e.target.value })} placeholder="Type color and press Add" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
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
              <input value={optionInput.sizes} onChange={(e) => setOptionInput({ ...optionInput, sizes: e.target.value })} placeholder="Type size and press Add" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
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
              <input value={optionInput.waistSizes} onChange={(e) => setOptionInput({ ...optionInput, waistSizes: e.target.value })} placeholder="Type waist size number (e.g. 30)" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
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
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma-separated)" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30 sm:col-span-2 xl:col-span-3" />
          <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 sm:col-span-2 xl:col-span-3">
            <p className="text-xs text-white/60">Variant stock</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <input value={form.variantColor} onChange={(e) => setForm({ ...form, variantColor: e.target.value })} placeholder="Color" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-white/30" />
              <input value={form.variantSize} onChange={(e) => setForm({ ...form, variantSize: e.target.value })} placeholder="Size" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-white/30" />
              <input value={form.variantWaistSize} onChange={(e) => setForm({ ...form, variantWaistSize: e.target.value })} placeholder="Waist size" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-white/30" />
              <input value={form.variantQty} onChange={(e) => setForm({ ...form, variantQty: e.target.value })} placeholder="Stock" type="number" min="0" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-white/30" />
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
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30 sm:col-span-2 xl:col-span-3" />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 sm:col-span-2 xl:col-span-3">
            {editing ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs text-white/50">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Event</th>
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
      </div>
    </div>
  )
}
