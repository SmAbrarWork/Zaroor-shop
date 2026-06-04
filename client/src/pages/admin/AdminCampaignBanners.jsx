import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../utils/api'
import { ADMIN_INPUT, ADMIN_SELECT, ADMIN_TEXTAREA } from '../../utils/adminClasses.js'

const empty = {
  eyebrow: '',
  title: '',
  subtitle: '',
  image: '',
  ctaLabel: '',
  ctaHref: '',
  sortOrder: 0,
  enabled: true,
  glassStyle: 'medium',
  textAnimation: 'fadeUp',
}

export default function AdminCampaignBanners() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)

  const loadEvents = () => {
    api.get('/admin/events').then(({ data }) => setEvents(data.data)).catch(() => {})
  }

  const loadRows = () => {
    if (!eventId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    api
      .get('/admin/campaign-banners', { params: { eventId } })
      .then(({ data }) => {
        setRows(data.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        toast.error('Could not load banners')
      })
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    loadRows()
  }, [eventId])

  const reset = () => {
    setForm(empty)
    setEditingId(null)
    setShowForm(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!eventId) {
      toast.error('Select an event')
      return
    }
    try {
      if (editingId) {
        await api.put(`/admin/campaign-banners/${editingId}`, form)
        toast.success('Banner updated')
      } else {
        await api.post('/admin/campaign-banners', { ...form, event: eventId })
        toast.success('Banner created')
      }
      reset()
      loadRows()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
  }

  const edit = (b) => {
    setEditingId(b._id)
    setForm({
      eyebrow: b.eyebrow || '',
      title: b.title || '',
      subtitle: b.subtitle || '',
      image: b.image || '',
      ctaLabel: b.ctaLabel || '',
      ctaHref: b.ctaHref || '',
      sortOrder: b.sortOrder ?? 0,
      enabled: b.enabled !== false,
      glassStyle: b.glassStyle || 'medium',
      textAnimation: b.textAnimation || 'fadeUp',
    })
    setShowForm(true)
  }

  const remove = async (id) => {
    if (!confirm('Delete this banner?')) return
    try {
      await api.delete(`/admin/campaign-banners/${id}`)
      toast.success('Removed')
      loadRows()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Campaign banners</h2>
        <p className="mt-1 text-sm text-white/50">
          Full-width promo slides on the home page — glass panels, smooth transitions, and text motion. Scoped per event (like Shopify sections per theme context).
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-white/40">Event</label>
        <select
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value)
            reset()
          }}
          className={`${ADMIN_SELECT} min-w-[240px]`}
        >
          <option value="">Select event…</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!eventId}
          onClick={() => {
            reset()
            setShowForm(true)
          }}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-40"
        >
          New banner
        </button>
      </div>

      {showForm && eventId ? (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-white/15 bg-slate-900/40 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-white/55">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={`${ADMIN_INPUT} mt-1 w-full`}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-white/55">Eyebrow (small line above title)</span>
              <input
                value={form.eyebrow}
                onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
                className={`${ADMIN_INPUT} mt-1 w-full`}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-white/55">Subtitle</span>
              <textarea
                rows={2}
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                className={`${ADMIN_TEXTAREA} mt-1 w-full`}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-white/55">Background image URL</span>
              <input
                required
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className={`${ADMIN_INPUT} mt-1 w-full`}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-white/55">CTA label</span>
              <input
                value={form.ctaLabel}
                onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                className={`${ADMIN_INPUT} mt-1 w-full`}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-white/55">CTA link (e.g. /shop/shirts or https://…)</span>
              <input
                value={form.ctaHref}
                onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
                className={`${ADMIN_INPUT} mt-1 w-full`}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-white/55">Sort order</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                className={`${ADMIN_INPUT} mt-1 w-full`}
              />
            </label>
            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              />
              <span className="text-sm text-white/80">Enabled</span>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-white/55">Glass panel</span>
              <select
                value={form.glassStyle}
                onChange={(e) => setForm((f) => ({ ...f, glassStyle: e.target.value }))}
                className={`${ADMIN_SELECT} mt-1 w-full`}
              >
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-white/55">Text animation</span>
              <select
                value={form.textAnimation}
                onChange={(e) => setForm((f) => ({ ...f, textAnimation: e.target.value }))}
                className={`${ADMIN_SELECT} mt-1 w-full`}
              >
                <option value="fadeUp">Fade up</option>
                <option value="fade">Fade</option>
                <option value="slideRight">Slide from left</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={reset} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-white/50">Loading…</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((b) => (
            <li
              key={b._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div>
                <p className="font-semibold text-white">{b.title}</p>
                <p className="text-xs text-white/45">
                  order {b.sortOrder} · {b.enabled ? 'on' : 'off'} · {b.glassStyle} · {b.textAnimation}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => edit(b)} className="text-sm text-sky-400 hover:underline">
                  Edit
                </button>
                <button type="button" onClick={() => remove(b._id)} className="text-sm text-rose-400 hover:underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
