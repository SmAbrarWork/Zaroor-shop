import mongoose from 'mongoose'
import { SHIPPING_DESTINATIONS } from '../constants/shippingDestinations.js'

const SHIPPING_DEST_ENUM = SHIPPING_DESTINATIONS.map((d) => d.key)

const productShippingRateSchema = new mongoose.Schema(
  {
    destination: { type: String, required: true, enum: SHIPPING_DEST_ENUM },
    cost: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const productOptionsSchema = new mongoose.Schema(
  {
    colors: [{ type: String, trim: true }],
    sizes: [{ type: String, trim: true }],
    waistSizes: [{ type: Number }],
  },
  { _id: false }
)

const productVariantStockSchema = new mongoose.Schema(
  {
    color: { type: String, trim: true, default: '' },
    size: { type: String, trim: true, default: '' },
    waistSize: { type: Number, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
)

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    /** Featured on campaign home — shown in Hot drops strip */
    isHotDrop: { type: Boolean, default: false },
    /** Lower sorts first within Hot drops */
    hotDropOrder: { type: Number, default: 0 },
    productType: { type: String, enum: ['shirt', 'pants', 'other'], default: 'other' },
    price: { type: Number, required: true },
    initialPrice: { type: Number, default: null },
    discountedPrice: { type: Number, default: null },
    discountPercent: { type: Number, default: null },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    tags: [{ type: String, lowercase: true, trim: true }],
    stock: { type: Number, default: 0 },
    options: { type: productOptionsSchema, default: () => ({ colors: [], sizes: [], waistSizes: [] }) },
    variantStock: { type: [productVariantStockSchema], default: [] },
    /** PKR shipping per item for each destination (set in admin). */
    shippingRates: { type: [productShippingRateSchema], default: [] },
  },
  { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
