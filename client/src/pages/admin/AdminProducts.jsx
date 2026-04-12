import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { formatCurrencyPKR } from '../../utils/dateUtils'

const emptyProduct = { name: '', slug: '', price: '', image: '', description: '', tags: '', stock: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [showForm, setShowForm] = useState(false)

  const fetchProducts = () => {
    api.get('/admin/products').then(({ data }) => {
      setProducts(data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : form.tags,
    }
    if (editing) {
      await api.put(`/admin/products/${editing}`, payload)
    } else {
      await api.post('/admin/products', payload)
    }
    setShowForm(false)
    setEditing(null)
    setForm(emptyProduct)
    fetchProducts()
  }

  const handleEdit = (product) => {
    setEditing(product._id)
    setForm({
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      description: product.description,
      tags: product.tags.join(', '),
      stock: product.stock,
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Products ({products.length})</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyProduct) }}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (PKR)" type="number" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30" />
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30 sm:col-span-2" />
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma-separated)" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30 sm:col-span-2" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30 sm:col-span-2" />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 sm:col-span-2">
            {editing ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs text-white/50">
            <tr>
              <th className="px-4 py-2">Name</th>
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
                <td className="px-4 py-2">{formatCurrencyPKR(p.price)}</td>
                <td className="px-4 py-2">{p.stock}</td>
                <td className="px-4 py-2 text-xs text-white/50">{p.tags.join(', ')}</td>
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
