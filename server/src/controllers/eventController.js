import { Event } from '../models/Event.js'

const fallbackEvents = [
  {
    name: 'Ramadan Drop',
    slug: 'ramadan',
    theme: { primary: '#020617', accent: '#f59e0b', text: '#ffffff' },
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-31'),
  },
  {
    name: 'Azadi Drop',
    slug: 'independence',
    theme: { primary: '#052e16', accent: '#dcfce7', text: '#f0fdf4' },
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-31'),
  },
]

export const listEvents = async (_req, res, next) => {
  try {
    const events = await Event.find().sort({ startDate: 1 }).lean()
    if (events.length > 0) {
      return res.status(200).json({ success: true, data: events })
    }
    return res.status(200).json({ success: true, data: fallbackEvents })
  } catch (error) {
    return next(error)
  }
}
