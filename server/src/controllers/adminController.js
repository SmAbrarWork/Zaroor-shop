import { User } from '../models/User.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { Event } from '../models/Event.js'
import { Cart } from '../models/Cart.js'
import { Category } from '../models/Category.js'
import { SHIPPING_DESTINATION_KEYS } from '../constants/shippingDestinations.js'

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const PRODUCT_TYPES = ['shirt', 'pants', 'other']

const normalizeArray = (arr) =>
  Array.isArray(arr)
    ? arr.map((value) => `${value}`.trim()).filter(Boolean)
    : []

const buildVariantKey = ({ color = '', size = '', waistSize = '' }) => [color, size, waistSize].join('|')

const normalizeNumberArray = (arr) =>
  Array.isArray(arr)
    ? arr
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
    : []

const normalizeShippingRates = (raw) => {
  if (!raw) return []
  const arr = Array.isArray(raw) ? raw : []
  const byDest = new Map()
  for (const row of arr) {
    const dest = `${row?.destination ?? ''}`.toLowerCase().trim()
    if (!SHIPPING_DESTINATION_KEYS.has(dest)) continue
    const cost = Number(row?.cost)
    if (!Number.isFinite(cost) || cost < 0) continue
    byDest.set(dest, { destination: dest, cost: Math.round(cost) })
  }
  return [...byDest.values()]
}

const normalizeProductPayload = (payload = {}) => {
  const productType = PRODUCT_TYPES.includes(payload.productType) ? payload.productType : 'other'
  const colors = normalizeArray(payload.options?.colors)
  const sizes = normalizeArray(payload.options?.sizes)
  const waistSizes = normalizeNumberArray(payload.options?.waistSizes)
  const variantStock = Array.isArray(payload.variantStock)
    ? payload.variantStock
      .map((entry) => ({
        color: `${entry?.color || ''}`.trim(),
        size: `${entry?.size || ''}`.trim(),
        waistSize: entry?.waistSize === null || entry?.waistSize === undefined || entry?.waistSize === ''
          ? null
          : Number(entry?.waistSize),
        stock: Number(entry?.stock ?? 0),
      }))
      .filter((entry) => Number.isFinite(entry.stock) && entry.stock >= 0 && (entry.waistSize === null || Number.isFinite(entry.waistSize)))
    : []
  const initialPrice = payload.initialPrice === null || payload.initialPrice === undefined || payload.initialPrice === ''
    ? Number(payload.price)
    : Number(payload.initialPrice)
  const discountedPrice = payload.discountedPrice === null || payload.discountedPrice === undefined || payload.discountedPrice === ''
    ? null
    : Number(payload.discountedPrice)
  const effectivePrice = Number.isFinite(discountedPrice) && discountedPrice > 0 ? discountedPrice : initialPrice
  const discountPercent = Number.isFinite(discountedPrice) && discountedPrice > 0
    ? Math.round(((initialPrice - discountedPrice) / initialPrice) * 100)
    : null
  const catRaw = payload.category
  const category =
    catRaw === '' || catRaw === null || catRaw === undefined ? null : catRaw
  return {
    ...payload,
    productType,
    price: effectivePrice,
    initialPrice,
    discountedPrice,
    discountPercent,
    options: { colors, sizes, waistSizes },
    variantStock,
    shippingRates: normalizeShippingRates(payload.shippingRates),
    category,
    isHotDrop: Boolean(payload.isHotDrop),
    hotDropOrder: Number.isFinite(Number(payload.hotDropOrder)) ? Number(payload.hotDropOrder) : 0,
  }
}

const validateCategoryMatchesEvent = async (categoryId, eventId) => {
  if (!categoryId) return null
  if (!eventId) {
    return 'Assign an event before choosing a category'
  }
  const cat = await Category.findById(categoryId).lean()
  if (!cat) return 'Invalid category'
  if (cat.event.toString() !== eventId.toString()) {
    return 'Category does not belong to this product’s event'
  }
  return null
}

const validateProductPayload = (payload) => {
  if (!Number.isFinite(payload.initialPrice) || payload.initialPrice <= 0) {
    return 'Initial price must be greater than zero'
  }
  if (payload.discountedPrice !== null) {
    if (!Number.isFinite(payload.discountedPrice) || payload.discountedPrice <= 0) {
      return 'Discounted price must be greater than zero'
    }
    if (payload.discountedPrice >= payload.initialPrice) {
      return 'Discounted price must be less than initial price'
    }
    if (payload.discountPercent === null || payload.discountPercent <= 0 || payload.discountPercent >= 100) {
      return 'Discount from prices must be between 1% and 99%'
    }
  }
  if (payload.productType === 'shirt' && payload.options.sizes.length === 0) {
    return 'Shirt products require at least one size option'
  }
  if (payload.productType === 'pants' && payload.options.waistSizes.length === 0) {
    return 'Pants products require at least one waist size option'
  }
  const seen = new Set()
  for (const variant of payload.variantStock || []) {
    if (variant.color && !payload.options.colors.includes(variant.color)) {
      return `Variant color "${variant.color}" is not part of product colors`
    }
    if (variant.size && !payload.options.sizes.includes(variant.size)) {
      return `Variant size "${variant.size}" is not part of product sizes`
    }
    if (variant.waistSize !== null && !payload.options.waistSizes.includes(variant.waistSize)) {
      return `Variant waist size "${variant.waistSize}" is not part of product waist sizes`
    }
    if (payload.productType === 'shirt' && !variant.size) {
      return 'Shirt variant stock entries must include size'
    }
    if (payload.productType === 'pants' && variant.waistSize === null) {
      return 'Pants variant stock entries must include waist size'
    }
    const key = buildVariantKey(variant)
    if (seen.has(key)) {
      return 'Duplicate variant stock entries are not allowed'
    }
    seen.add(key)
  }
  return null
}

// --- Dashboard Stats ---
export const getStats = async (_req, res, next) => {
  try {
    const [userCount, productCount, orderCount, eventCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Event.countDocuments(),
    ])
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10)
      .populate('user', 'name email phone').lean()
    const revenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ])
    return res.json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        events: eventCount,
        revenue: revenue[0]?.total ?? 0,
        recentOrders,
      },
    })
  } catch (error) {
    return next(error)
  }
}

// --- Users ---
export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 100))
    const search = req.query.search?.trim() || ''

    const safe = escapeRegex(search)
    const filter = search
      ? {
          $or: [
            { name: { $regex: safe, $options: 'i' } },
            { email: { $regex: safe, $options: 'i' } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ])

    return res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return next(error)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean()
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).lean()
    const cart = await Cart.findOne({ user: user._id }).populate('items.product').lean()
    return res.json({ success: true, data: { ...user, orders, cart: cart?.items ?? [] } })
  } catch (error) {
    return next(error)
  }
}

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).lean()
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    return res.json({ success: true, data: user })
  } catch (error) {
    return next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' })
    }
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    await Cart.deleteMany({ user: user._id })
    return res.json({ success: true, message: 'User deleted' })
  } catch (error) {
    return next(error)
  }
}

// --- Products ---
export const getAdminProducts = async (_req, res, next) => {
  try {
    const products = await Product.find()
      .populate('event', 'name slug')
      .populate('category', 'name slug sortOrder')
      .sort({ createdAt: -1 })
      .lean()
    return res.json({ success: true, data: products })
  } catch (error) {
    return next(error)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    const payload = normalizeProductPayload(req.body)
    const validationError = validateProductPayload(payload)
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError })
    }
    const catErr = await validateCategoryMatchesEvent(payload.category, payload.event)
    if (catErr) {
      return res.status(400).json({ success: false, message: catErr })
    }
    const product = await Product.create(payload)
    return res.status(201).json({ success: true, data: product })
  } catch (error) {
    return next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id).lean()
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' })

    const payload = normalizeProductPayload(req.body)
    const validationError = validateProductPayload(payload)
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError })
    }
    const eventId = payload.event ?? existing.event
    const catErr = await validateCategoryMatchesEvent(payload.category, eventId)
    if (catErr) {
      return res.status(400).json({ success: false, message: catErr })
    }
    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true })
      .populate('category', 'name slug sortOrder')
      .lean()
    return res.json({ success: true, data: product })
  } catch (error) {
    return next(error)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    return res.json({ success: true, message: 'Product deleted' })
  } catch (error) {
    return next(error)
  }
}

// --- Events ---
export const getAdminEvents = async (_req, res, next) => {
  try {
    const events = await Event.find().sort({ startDate: -1 }).lean()
    return res.json({ success: true, data: events })
  } catch (error) {
    return next(error)
  }
}

export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body)
    return res.status(201).json({ success: true, data: event })
  } catch (error) {
    return next(error)
  }
}

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean()
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
    return res.json({ success: true, data: event })
  } catch (error) {
    return next(error)
  }
}

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
    return res.json({ success: true, message: 'Event deleted' })
  } catch (error) {
    return next(error)
  }
}

// --- Orders ---
export const getAdminOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 100))
    const search = req.query.search?.trim() || ''
    const status = req.query.status || ''

    let filter = {}
    if (status) filter.status = status

    let orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean()

    // Client-side search on populated user fields
    if (search) {
      const s = search.toLowerCase()
      orders = orders.filter((o) =>
        o.user?.name?.toLowerCase().includes(s) ||
        o.user?.email?.toLowerCase().includes(s) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(s) ||
        o.shippingAddress?.phone?.includes(s) ||
        o.shippingAddress?.city?.toLowerCase().includes(s) ||
        o._id.toString().includes(s)
      )
    }

    const total = orders.length
    const paginated = orders.slice((page - 1) * limit, page * limit)

    return res.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return next(error)
  }
}

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['pending', 'confirmed', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'name email').lean()
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    return res.json({ success: true, data: order })
  } catch (error) {
    return next(error)
  }
}
