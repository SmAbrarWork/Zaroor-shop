import { Order } from '../models/Order.js'
import { Cart } from '../models/Cart.js'

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.city) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' })
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' })
    }

    const items = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }))
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
    })

    cart.items = []
    await cart.save()

    return res.status(201).json({ success: true, data: order })
  } catch (error) {
    return next(error)
  }
}

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean()
    return res.status(200).json({ success: true, data: orders })
  } catch (error) {
    return next(error)
  }
}

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean()
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    return res.status(200).json({ success: true, data: order })
  } catch (error) {
    return next(error)
  }
}
