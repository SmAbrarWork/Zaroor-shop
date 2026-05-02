import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../utils/api'
import { ADMIN_INPUT, ADMIN_SELECT, ADMIN_TEXTAREA } from '../../utils/adminClasses.js'

const emptyEvent = {
  name: '',
  slug: '',
  heroTitle: '',
  heroSubtitle: '',
  heroImage: '',
  ctaLabel: 'Shop The Drop',
  campaignFocus: 'Urgency. Emotion. Action.',
  displayMode: 'text',
  bannerText: '',
  story: '',
  startDate: '',
  endDate: '',
  countdownDate: '',
  theme: { primary: '#020617', accent: '#f59e0b', text: '#ffffff', surface: '#0f172a' },
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyEvent)
  const [showForm, setShowForm] = useState(false)

  const fetchEvents = () => {
    api.get('/admin/events').then(({ data }) => {
      setEvents(data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchEvents() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/admin/events/${editing}`, form)
        toast.success('Event updated', { description: form.name })
      } else {
        await api.post('/admin/events', form)
        toast.success('Event created', { description: form.name })
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyEvent)
      fetchEvents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save event')
    }
  }

  const handleEdit = (event) => {
    setEditing(event._id)
    setForm({
      name: event.name,
      slug: event.slug,
      heroTitle: event.heroTitle || '',
      heroSubtitle: event.heroSubtitle || '',
      heroImage: event.heroImage || '',
      ctaLabel: event.ctaLabel || 'Shop The Drop',
      campaignFocus: event.campaignFocus || 'Urgency. Emotion. Action.',
      displayMode: event.displayMode || 'text',
      bannerText: event.bannerText || '',
      story: event.story || '',
      startDate: event.startDate?.slice(0, 10) || '',
      endDate: event.endDate?.slice(0, 10) || '',
      countdownDate: event.countdownDate?.slice(0, 16) || '',
      theme: event.theme || emptyEvent.theme,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    try {
      await api.delete(`/admin/events/${id}`)
      fetchEvents()
      toast.success('Event removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete event')
    }
  }

  if (loading) return <p className="text-sm text-white/50">Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Events ({events.length})</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyEvent) }}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
        >
          {showForm ? 'Cancel' : '+ Add Event'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-white/15 bg-slate-900/40 p-4 sm:grid-cols-2 xl:grid-cols-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required className={ADMIN_INPUT} />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" required className={ADMIN_INPUT} />
          <input value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} placeholder="Hero title (optional)" className={`${ADMIN_INPUT} xl:col-span-2`} />
          <input value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} placeholder="Hero subtitle (optional)" className={`${ADMIN_INPUT} sm:col-span-2 xl:col-span-3`} />
          <input value={form.heroImage} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} placeholder="Hero image URL (optional)" className={`${ADMIN_INPUT} sm:col-span-2 xl:col-span-3`} />
          <input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="CTA label" className={ADMIN_INPUT} />
          <input value={form.campaignFocus} onChange={(e) => setForm({ ...form, campaignFocus: e.target.value })} placeholder="Campaign focus" className={`${ADMIN_INPUT} sm:col-span-2`} />
          <select value={form.displayMode} onChange={(e) => setForm({ ...form, displayMode: e.target.value })} className={`${ADMIN_SELECT} w-full`}>
            <option value="text">Show Banner Text</option>
            <option value="countdown">Show Countdown Timer</option>
          </select>
          <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} type="date" required className={ADMIN_INPUT} />
          <input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} type="date" required className={ADMIN_INPUT} />
          <input value={form.countdownDate} onChange={(e) => setForm({ ...form, countdownDate: e.target.value })} type="datetime-local" placeholder="Countdown" className={`${ADMIN_INPUT} sm:col-span-2 xl:col-span-3`} />
          <input value={form.bannerText} onChange={(e) => setForm({ ...form, bannerText: e.target.value })} placeholder="Banner Text" className={`${ADMIN_INPUT} sm:col-span-2 xl:col-span-3`} />
          <textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} placeholder="Story" rows={2} className={`${ADMIN_TEXTAREA} sm:col-span-2 xl:col-span-3`} />
          <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-3">
            <label className="flex items-center gap-1 text-xs text-white/50">Primary<input type="color" value={form.theme.primary} onChange={(e) => setForm({ ...form, theme: { ...form.theme, primary: e.target.value } })} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" /></label>
            <label className="flex items-center gap-1 text-xs text-white/50">Accent<input type="color" value={form.theme.accent} onChange={(e) => setForm({ ...form, theme: { ...form.theme, accent: e.target.value } })} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" /></label>
            <label className="flex items-center gap-1 text-xs text-white/50">Text<input type="color" value={form.theme.text} onChange={(e) => setForm({ ...form, theme: { ...form.theme, text: e.target.value } })} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" /></label>
            <label className="flex items-center gap-1 text-xs text-white/50">Surface<input type="color" value={form.theme.surface} onChange={(e) => setForm({ ...form, theme: { ...form.theme, surface: e.target.value } })} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" /></label>
          </div>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 sm:col-span-2 xl:col-span-3">
            {editing ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs text-white/50">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Theme</th>
              <th className="px-4 py-2">Start</th>
              <th className="px-4 py-2">End</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev._id} className="border-b border-white/5">
                <td className="px-4 py-2 font-medium">{ev.name}</td>
                <td className="px-4 py-2 text-xs text-white/50">{ev.slug}</td>
                <td className="flex gap-1 px-4 py-2">
                  <span className="inline-block h-4 w-4 rounded" style={{ background: ev.theme?.primary }} />
                  <span className="inline-block h-4 w-4 rounded" style={{ background: ev.theme?.accent }} />
                  <span className="inline-block h-4 w-4 rounded" style={{ background: ev.theme?.text }} />
                </td>
                <td className="px-4 py-2 text-xs text-white/50">{new Date(ev.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-xs text-white/50">{new Date(ev.endDate).toLocaleDateString()}</td>
                <td className="flex gap-2 px-4 py-2">
                  <button onClick={() => handleEdit(ev)} className="text-xs text-blue-400 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(ev._id)} className="text-xs text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
