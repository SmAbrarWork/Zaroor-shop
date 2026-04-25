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

const includesOption = (options = [], selectedValue = '') =>
  !selectedValue || options.includes(selectedValue)

const getVariantStockForSelection = (product, selectedOptions) => {
  const key = buildVariantKey(selectedOptions)
  const variant = (product.variantStock || []).find((entry) => buildVariantKey(entry) === key)
  if (!variant) return null
  return Number(variant.stock) || 0
}

const getAvailableStock = (product, selectedOptions) => {
  const variantStock = getVariantStockForSelection(product, selectedOptions)
  if (variantStock === null) return Number(product.stock) || 0
  return variantStock
}

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
    const { productId, quantity = 1, selectedOptions = {} } = req.body
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' })
    }
    const product = await Product.findById(productId).lean()
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    const normalizedOptions = normalizeSelectedOptions(selectedOptions)
    const productOptions = product.options || {}
    if (product.productType === 'shirt' && !normalizedOptions.size) {
      return res.status(400).json({ success: false, message: 'Size is required for shirt products' })
    }
    if (product.productType === 'pants' && normalizedOptions.waistSize === null) {
      return res.status(400).json({ success: false, message: 'Waist size is required for pants products' })
    }
    if (!includesOption(productOptions.colors || [], normalizedOptions.color)) {
      return res.status(400).json({ success: false, message: 'Selected color is invalid for this product' })
    }
    if (!includesOption(productOptions.sizes || [], normalizedOptions.size)) {
      return res.status(400).json({ success: false, message: 'Selected size is invalid for this product' })
    }
    if (!includesOption(productOptions.waistSizes || [], normalizedOptions.waistSize)) {
      return res.status(400).json({ success: false, message: 'Selected waist size is invalid for this product' })
    }
    const variantKey = buildVariantKey(normalizedOptions)

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    const existing = cart.items.find(
      (i) => i.product.toString() === productId && (i.variantKey || '') === variantKey
    )
    const requestedQuantity = existing ? existing.quantity + quantity : quantity
    const availableStock = getAvailableStock(product, normalizedOptions)
    if (requestedQuantity > availableStock) {
      return res.status(400).json({ success: false, message: `Only ${availableStock} items available for this variant` })
    }

    if (existing) {
      existing.quantity = requestedQuantity
    } else {
      cart.items.push({ product: productId, quantity, selectedOptions: normalizedOptions, variantKey })
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
    const { quantity, variantKey = '' } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    const item = cart.items.find(
      (i) => i.product.toString() === req.params.productId && (i.variantKey || '') === variantKey
    )
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' })
    }

    const product = await Product.findById(req.params.productId).lean()
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    const selectedOptions = normalizeSelectedOptions(item.selectedOptions || {})
    const availableStock = getAvailableStock(product, selectedOptions)
    if (quantity > availableStock) {
      return res.status(400).json({ success: false, message: `Only ${availableStock} items available for this variant` })
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
    const variantKey = req.query.variantKey || ''
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    cart.items = cart.items.filter(
      (i) => !(i.product.toString() === req.params.productId && (i.variantKey || '') === variantKey)
    )
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
