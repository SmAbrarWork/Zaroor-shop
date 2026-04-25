import { Order } from '../models/Order.js'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'

const normalizeSelectedOptions = (selectedOptions = {}) => ({
  color: selectedOptions.color?.trim?.() ?? '',
  size: selectedOptions.size?.trim?.() ?? '',
  waistSize:
    selectedOptions.waistSize === null || selectedOptions.waistSize === undefined || selectedOptions.waistSize === ''
      ? null
      : Number(selectedOptions.waistSize),
})

const buildVariantKey = (selectedOptions = {}) => {
  const normalized = normalizeSelectedOptions(selectedOptions)
  return [normalized.color, normalized.size, normalized.waistSize ?? ''].join('|')
}

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

    const productDocs = await Product.find({
      _id: { $in: cart.items.map((i) => i.product._id) },
    })
    const productMap = new Map(productDocs.map((p) => [p._id.toString(), p]))

    for (const cartItem of cart.items) {
      const productId = cartItem.product._id.toString()
      const productDoc = productMap.get(productId)
      if (!productDoc) {
        return res.status(400).json({ success: false, message: `Product not found: ${productId}` })
      }
      const selectedOptions = normalizeSelectedOptions(cartItem.selectedOptions || {})
      const variantKey = buildVariantKey(selectedOptions)
      const variantIndex = (productDoc.variantStock || []).findIndex(
        (entry) => buildVariantKey(entry) === variantKey
      )
      const availableStock = variantIndex >= 0
        ? Number(productDoc.variantStock[variantIndex].stock) || 0
        : Number(productDoc.stock) || 0

      if (cartItem.quantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `${productDoc.name} only has ${availableStock} item(s) available for selected variant`,
        })
      }

      if (variantIndex >= 0) {
        productDoc.variantStock[variantIndex].stock = availableStock - cartItem.quantity
      } else {
        productDoc.stock = availableStock - cartItem.quantity
      }
    }

    const items = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      selectedOptions: i.selectedOptions || { color: '', size: '', waistSize: null },
    }))
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
    })

    await Promise.all([...productMap.values()].map((productDoc) => productDoc.save()))

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
