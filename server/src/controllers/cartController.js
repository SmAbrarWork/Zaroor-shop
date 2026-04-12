import { Cart } from '../models/Cart.js'

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    return res.status(200).json({ success: true, data: cart ?? { items: [] } })
  } catch (error) {
    return next(error)
  }
}

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' })
    }

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    const existing = cart.items.find((i) => i.product.toString() === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.items.push({ product: productId, quantity })
    }

    await cart.save()
    await cart.populate('items.product')
    return res.status(200).json({ success: true, data: cart })
  } catch (error) {
    return next(error)
  }
}

export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    const item = cart.items.find((i) => i.product.toString() === req.params.productId)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' })
    }

    item.quantity = quantity
    await cart.save()
    await cart.populate('items.product')
    return res.status(200).json({ success: true, data: cart })
  } catch (error) {
    return next(error)
  }
}

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId)
    await cart.save()
    await cart.populate('items.product')
    return res.status(200).json({ success: true, data: cart })
  } catch (error) {
    return next(error)
  }
}

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      cart.items = []
      await cart.save()
    }
    return res.status(200).json({ success: true, data: { items: [] } })
  } catch (error) {
    return next(error)
  }
}
