import { Order } from '../models/Order.js'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'
import mongoose from 'mongoose'
import { SHIPPING_DESTINATION_KEYS } from '../constants/shippingDestinations.js'
import { getShopSettings } from '../services/shopSettingsService.js'

const unitShippingForProduct = (productDoc, destinationKey) => {
  const rates = productDoc.shippingRates || []
  const row = rates.find((r) => r.destination === destinationKey)
  if (!row) return 0
  return Math.max(0, Number(row.cost) || 0)
}

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

const PAYMENT_METHOD_LABELS = {
  cod: 'cash on delivery',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
}

export const createOrder = async (req, res, next) => {
  let session
  try {
    const { shippingAddress, paymentMethod, shippingDestination } = req.body
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.city) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' })
    }
    const destKey = typeof shippingDestination === 'string' ? shippingDestination.toLowerCase().trim() : ''
    if (!destKey || !SHIPPING_DESTINATION_KEYS.has(destKey)) {
      return res.status(400).json({ success: false, message: 'Select a shipping destination / zone' })
    }
    const shopSettings = await getShopSettings()
    const { paymentMethods } = shopSettings
    const methodEnabled = Boolean(paymentMethods?.[paymentMethod])
    if (!paymentMethod || !methodEnabled) {
      const label = PAYMENT_METHOD_LABELS[paymentMethod] || 'Selected payment method'
      return res.status(400).json({ success: false, message: `${label} is currently unavailable. Please use an active payment method.` })
    }

    session = await mongoose.startSession()
    let createdOrder = null
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').session(session)
      if (!cart || cart.items.length === 0) {
        const err = new Error('Cart is empty')
        err.statusCode = 400
        throw err
      }

      const productDocs = await Product.find({
        _id: { $in: cart.items.map((i) => i.product._id) },
      }).session(session)
      const productMap = new Map(productDocs.map((p) => [p._id.toString(), p]))

      for (const cartItem of cart.items) {
        const productId = cartItem.product._id.toString()
        const productDoc = productMap.get(productId)
        if (!productDoc) {
          const err = new Error(`Product not found: ${productId}`)
          err.statusCode = 400
          throw err
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
          const err = new Error(`${productDoc.name} only has ${availableStock} item(s) available for selected variant`)
          err.statusCode = 400
          throw err
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
      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      let shippingAmount = 0
      for (const cartItem of cart.items) {
        const productDoc = productMap.get(cartItem.product._id.toString())
        if (!productDoc) continue
        const perUnit = unitShippingForProduct(productDoc, destKey)
        shippingAmount += perUnit * cartItem.quantity
      }

      const qtyByProduct = new Map()
      for (const i of cart.items) {
        const id = i.product._id.toString()
        qtyByProduct.set(id, (qtyByProduct.get(id) || 0) + (Number(i.quantity) || 0))
      }
      const { freeShippingMinQty } = shopSettings
      const freeShippingQualified =
        freeShippingMinQty != null &&
        [...qtyByProduct.values()].some((q) => q >= freeShippingMinQty)
      if (freeShippingQualified) {
        shippingAmount = 0
      }

      const totalAmount = subtotal + shippingAmount

      const [order] = await Order.create([{
        user: req.user._id,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod,
        shippingDestination: destKey,
        shippingAmount,
        freeShippingQualified,
      }], { session })
      createdOrder = order

      await Promise.all([...productMap.values()].map((productDoc) => productDoc.save({ session })))

      cart.items = []
      await cart.save({ session })
    })

    return res.status(201).json({ success: true, data: createdOrder })
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    return next(error)
  } finally {
    if (session) await session.endSession()
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
