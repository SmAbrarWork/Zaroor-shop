import { User } from '../models/User.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { Event } from '../models/Event.js'
import { Cart } from '../models/Cart.js'

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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
    const products = await Product.find().sort({ createdAt: -1 }).lean()
    return res.json({ success: true, data: products })
  } catch (error) {
    return next(error)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body)
    return res.status(201).json({ success: true, data: product })
  } catch (error) {
    return next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean()
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
