import { Product } from '../models/Product.js'
import { Event } from '../models/Event.js'

export const getProducts = async (req, res, next) => {
  try {
    const { tag, eventSlug } = req.query
    const filter = {}
    if (eventSlug) {
      const ev = await Event.findOne({ slug: String(eventSlug).toLowerCase().trim() }).lean()
      if (ev) filter.event = ev._id
    } else if (tag) {
      filter.tags = tag
    }
    const products = await Product.find(filter)
      .populate('event', 'name slug')
      .populate('category', 'name slug sortOrder')
      .sort({ createdAt: -1 })
      .lean()
    return res.status(200).json({ success: true, data: products })
  } catch (error) {
    return next(error)
  }
}

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('event', 'name slug')
      .populate('category', 'name slug sortOrder')
      .lean()
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    return res.status(200).json({ success: true, data: product })
  } catch (error) {
    return next(error)
  }
}
