import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    tags: [{ type: String, lowercase: true, trim: true }],
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
