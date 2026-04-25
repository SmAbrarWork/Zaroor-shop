import { User } from '../models/User.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { Event } from '../models/Event.js'
import { Cart } from '../models/Cart.js'

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
  return {
    ...payload,
    productType,
    options: { colors, sizes, waistSizes },
    variantStock,
  }
}

const validateProductPayload = (payload) => {
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
    const products = await Product.find().populate('event', 'name slug').sort({ createdAt: -1 }).lean()
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
    const product = await Product.create(payload)
    return res.status(201).json({ success: true, data: product })
  } catch (error) {
    return next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const payload = normalizeProductPayload(req.body)
    const validationError = validateProductPayload(payload)
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError })
    }
    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true }).lean()
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
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
