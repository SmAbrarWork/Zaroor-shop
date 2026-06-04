import mongoose from 'mongoose'

/** Singleton-style shop rules (one document). */
const shopSettingsSchema = new mongoose.Schema(
  {
    /** Fixed singleton key so reads/writes target one canonical document. */
    key: { type: String, default: 'default', required: true, unique: true, immutable: true },
    /** Min units of one product (same product id, any variant) for free shipping; null = off. */
    freeShippingMinQty: { type: Number, default: null, min: 1 },
    /** Checkout payment method switches (admin-controlled). */
    paymentMethods: {
      cod: { type: Boolean, default: true },
      jazzcash: { type: Boolean, default: false },
      easypaisa: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

export const ShopSettings = mongoose.model('ShopSettings', shopSettingsSchema)
