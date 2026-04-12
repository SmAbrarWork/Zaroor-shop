import { Product } from '../models/Product.js'

export const getProducts = async (req, res, next) => {
  try {
    const { tag } = req.query
    const filter = tag ? { tags: tag } : {}
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean()
    return res.status(200).json({ success: true, data: products })
  } catch (error) {
    return next(error)
  }
}

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    return res.status(200).json({ success: true, data: product })
  } catch (error) {
    return next(error)
  }
}
