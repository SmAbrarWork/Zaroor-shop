import { Category } from '../models/Category.js'
import { Event } from '../models/Event.js'

/** Public: categories for one campaign (scoped — never mixed across events). */
export const getCategoriesPublic = async (req, res, next) => {
  try {
    const eventSlug = req.query.eventSlug?.trim()
    const eventId = req.query.eventId?.trim()
    let match = null
    if (eventSlug) {
      const ev = await Event.findOne({ slug: eventSlug.toLowerCase() }).lean()
      if (!ev) return res.status(200).json({ success: true, data: [] })
      match = ev._id
    } else if (eventId) {
      match = eventId
    } else {
      return res.status(400).json({ success: false, message: 'Query eventSlug or eventId is required' })
    }

    const categories = await Category.find({ event: match })
      .sort({ sortOrder: 1, name: 1 })
      .lean()

    return res.status(200).json({ success: true, data: categories })
  } catch (error) {
    return next(error)
  }
}
