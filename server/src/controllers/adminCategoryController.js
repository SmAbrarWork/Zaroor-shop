import { Category } from '../models/Category.js'
import { Event } from '../models/Event.js'
import { Product } from '../models/Product.js'

const slugify = (name) =>
  String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category'

export const getAdminCategories = async (req, res, next) => {
  try {
    const eventId = req.query.eventId?.trim()
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'eventId query is required' })
    }
    const exists = await Event.findById(eventId).lean()
    if (!exists) return res.status(404).json({ success: false, message: 'Event not found' })

    const categories = await Category.find({ event: eventId })
      .sort({ sortOrder: 1, name: 1 })
      .lean()
    return res.json({ success: true, data: categories })
  } catch (error) {
    return next(error)
  }
}

export const createAdminCategory = async (req, res, next) => {
  try {
    const { event: eventId, name, slug: slugIn, description = '', sortOrder = 0 } = req.body
    if (!eventId || !name?.trim()) {
      return res.status(400).json({ success: false, message: 'event and name are required' })
    }
    const ev = await Event.findById(eventId).lean()
    if (!ev) return res.status(404).json({ success: false, message: 'Event not found' })

    const slug = slugify(slugIn || name)
    const category = await Category.create({
      event: eventId,
      name: name.trim(),
      slug,
      description: String(description || '').trim(),
      sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
    })
    return res.status(201).json({ success: true, data: category })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A category with this slug already exists for this event' })
    }
    return next(error)
  }
}

export const updateAdminCategory = async (req, res, next) => {
  try {
    const { name, slug: slugIn, description, sortOrder } = req.body
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' })

    if (name != null) category.name = String(name).trim()
    if (slugIn != null) category.slug = slugify(slugIn)
    if (description != null) category.description = String(description).trim()
    if (sortOrder != null && Number.isFinite(Number(sortOrder))) category.sortOrder = Number(sortOrder)

    await category.save()
    return res.json({ success: true, data: category.toJSON() })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Slug already taken for this event' })
    }
    return next(error)
  }
}

export const deleteAdminCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).lean()
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' })

    await Product.updateMany({ category: category._id }, { $set: { category: null } })
    await Category.deleteOne({ _id: category._id })
    return res.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    return next(error)
  }
}
