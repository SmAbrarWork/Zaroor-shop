import { ShopSettings } from '../models/ShopSettings.js'
import { getShopSettings } from '../services/shopSettingsService.js'

export const getPublicShopSettings = async (_req, res, next) => {
  try {
    const data = await getShopSettings()
    return res.status(200).json({ success: true, data })
  } catch (e) {
    return next(e)
  }
}

export const getAdminShopSettings = async (_req, res, next) => {
  try {
    const data = await getShopSettings()
    return res.status(200).json({ success: true, data })
  } catch (e) {
    return next(e)
  }
}

export const updateShopSettings = async (req, res, next) => {
  try {
    const raw = req.body?.freeShippingMinQty
    let freeShippingMinQty = null
    if (raw === '' || raw === null || raw === undefined) {
      freeShippingMinQty = null
    } else {
      const n = Number(raw)
      if (!Number.isFinite(n) || n < 1) {
        return res.status(400).json({ success: false, message: 'Free shipping minimum must be a whole number ≥ 1, or leave empty to turn off' })
      }
      freeShippingMinQty = Math.floor(n)
    }
    const paymentMethodsInput = req.body?.paymentMethods
    let paymentMethods = null
    if (paymentMethodsInput !== undefined) {
      if (!paymentMethodsInput || typeof paymentMethodsInput !== 'object' || Array.isArray(paymentMethodsInput)) {
        return res.status(400).json({ success: false, message: 'paymentMethods must be an object with cod/jazzcash/easypaisa booleans' })
      }
      paymentMethods = {}
      for (const key of ['cod', 'jazzcash', 'easypaisa']) {
        if (paymentMethodsInput[key] !== undefined) {
          if (typeof paymentMethodsInput[key] !== 'boolean') {
            return res.status(400).json({ success: false, message: `paymentMethods.${key} must be boolean` })
          }
          paymentMethods[key] = paymentMethodsInput[key]
        }
      }
    }

    const updateSet = { freeShippingMinQty }
    if (paymentMethods) updateSet.paymentMethods = paymentMethods
    const doc = await ShopSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: updateSet },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean()

    return res.status(200).json({
      success: true,
      data: {
        freeShippingMinQty: doc?.freeShippingMinQty ?? null,
        paymentMethods: {
          cod: doc?.paymentMethods?.cod !== false,
          jazzcash: doc?.paymentMethods?.jazzcash === true,
          easypaisa: doc?.paymentMethods?.easypaisa === true,
        },
      },
    })
  } catch (e) {
    return next(e)
  }
}
