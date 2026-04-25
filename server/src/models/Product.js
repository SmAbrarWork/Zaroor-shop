import mongoose from 'mongoose'

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
    productType: { type: String, enum: ['shirt', 'pants', 'other'], default: 'other' },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    tags: [{ type: String, lowercase: true, trim: true }],
    stock: { type: Number, default: 0 },
    options: { type: productOptionsSchema, default: () => ({ colors: [], sizes: [], waistSizes: [] }) },
    variantStock: { type: [productVariantStockSchema], default: [] },
  },
  { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
