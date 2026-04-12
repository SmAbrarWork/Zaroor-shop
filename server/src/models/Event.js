import mongoose from 'mongoose'

const themeSchema = new mongoose.Schema(
  {
    primary: { type: String, required: true },
    accent: { type: String, required: true },
    text: { type: String, required: true },
    surface: { type: String, default: '#0f172a' },
  },
  { _id: false }
)

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    theme: { type: themeSchema, required: true },
    bannerText: { type: String, default: '' },
    countdownDate: { type: Date, default: null },
    story: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
)

export const Event = mongoose.model('Event', eventSchema)
