import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

categorySchema.index({ event: 1, slug: 1 }, { unique: true })

export const Category = mongoose.model('Category', categorySchema)
