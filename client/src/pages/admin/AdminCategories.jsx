import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../utils/api'
import { ADMIN_INPUT, ADMIN_SELECT, ADMIN_TEXTAREA } from '../../utils/adminClasses.js'

const emptyForm = { name: '', slug: '', description: '', sortOrder: 0 }

export default function AdminCategories() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const loadEvents = () => {
    api.get('/admin/events').then(({ data }) => setEvents(data.data)).catch(() => {})
  }

  const loadCategories = () => {
    if (!eventId) {
      setCategories([])
      setLoading(false)
      return
    }
    setLoading(true)
    api
      .get('/admin/categories', { params: { eventId } })
      .then(({ data }) => {
        setCategories(data.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    loadCategories()
  }, [eventId])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!eventId) {
      toast.error('Select an event first')
      return
    }
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, form)
        toast.success('Category updated', { description: form.name })
      } else {
        await api.post('/admin/categories', { ...form, event: eventId })
        toast.success('Category created', { description: form.name })
      }
      resetForm()
      loadCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category')
    }
  }

  const handleEdit = (c) => {
    setEditingId(c._id)
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      sortOrder: c.sortOrder ?? 0,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Products using it will become uncategorized.')) return
    try {
      await api.delete(`/admin/categories/${id}`)
      toast.success('Category removed')
      loadCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-xl font-bold">Categories</h2>
          <p className="text-sm text-white/50">
            Categories belong to a single campaign. Shoppers only see categories for the event they’re viewing — nothing mixes between drops.
          </p>
          <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-4 text-sm text-white/80">
            <p className="font-semibold text-sky-100/95">Recommended order</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-white/70">
              <li>Create or select an <strong>event</strong> first (Events).</li>
              <li>Add <strong>categories</strong> here for that event (e.g. Hero tees, Street bottoms).</li>
              <li>In <strong>Products</strong>, assign each product to an event + category; mark a few as <strong>Hot drops</strong> for the home page.</li>
            </ol>
            <p className="mt-2 text-xs text-white/55">The shop menu lists these categories so customers can open e.g. Street bottoms and see only that event’s items.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-white/40">Event</label>
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value)
              resetForm()
            }}
            className={`${ADMIN_SELECT} min-w-[220px]`}
          >
            <option value="">Select event…</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {eventId && (
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm)
            if (showForm) resetForm()
            else {
              setEditingId(null)
              setForm(emptyForm)
            }
          }}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
        >
          {showForm ? 'Cancel' : '+ Add category'}
        </button>
      )}

      {showForm && eventId && (
        <form onSubmit={handleSubmit} className="grid max-w-2xl gap-3 rounded-xl border border-white/15 bg-slate-900/40 p-4 sm:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Display name (e.g. Graphic tees)"
            required
            className={`${ADMIN_INPUT} sm:col-span-2`}
          />
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="URL slug (optional — auto from name)"
            className={ADMIN_INPUT}
          />
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            placeholder="Sort order"
            className={ADMIN_INPUT}
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description (optional, shown on storefront)"
            rows={2}
            className={`${ADMIN_TEXTAREA} sm:col-span-2`}
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 sm:col-span-2">
            {editingId ? 'Update category' : 'Create category'}
          </button>
        </form>
      )}

      {!eventId ? (
        <p className="text-sm text-white/40">Choose an event to manage its categories.</p>
      ) : loading ? (
        <p className="text-sm text-white/50">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-white/40">No categories yet for this event.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs text-white/50">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-b border-white/5">
                  <td className="px-4 py-2 text-white/60">{c.sortOrder}</td>
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-white/50">{c.slug}</td>
                  <td className="max-w-xs truncate px-4 py-2 text-xs text-white/45">{c.description || '—'}</td>
                  <td className="flex gap-2 px-4 py-2">
                    <button type="button" onClick={() => handleEdit(c)} className="text-xs text-blue-400 hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(c._id)} className="text-xs text-red-400 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
