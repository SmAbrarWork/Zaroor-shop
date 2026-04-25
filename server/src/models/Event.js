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
    heroTitle: { type: String, default: '' },
    heroSubtitle: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    ctaLabel: { type: String, default: 'Shop The Drop' },
    campaignFocus: { type: String, default: 'Urgency. Emotion. Action.' },
    displayMode: { type: String, enum: ['countdown', 'text'], default: 'text' },
    bannerText: { type: String, default: '' },
    countdownDate: { type: Date, default: null },
    story: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
)

export const Event = mongoose.model('Event', eventSchema)
