import mongoose from 'mongoose'

/** WordPress/Shopify-style promo slides per campaign — admin-managed. */
const campaignBannerSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    eyebrow: { type: String, default: '', trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    image: { type: String, required: true, trim: true },
    ctaLabel: { type: String, default: '', trim: true },
    ctaHref: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    /** Frosted overlay strength on the text panel */
    glassStyle: { type: String, enum: ['light', 'medium', 'heavy'], default: 'medium' },
    /** Text entrance style (handled on storefront) */
    textAnimation: { type: String, enum: ['fadeUp', 'fade', 'slideRight'], default: 'fadeUp' },
  },
  { timestamps: true }
)

campaignBannerSchema.index({ event: 1, sortOrder: 1 })

export const CampaignBanner = mongoose.model('CampaignBanner', campaignBannerSchema)
