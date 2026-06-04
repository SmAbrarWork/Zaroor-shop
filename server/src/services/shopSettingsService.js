import { ShopSettings } from '../models/ShopSettings.js'

/** Returns `{ freeShippingMinQty: number|null }` — min units of one product for free ship; null = off. */
export async function getShopSettings() {
  const doc =
    await ShopSettings.findOne({ key: 'default' }).lean()
    || await ShopSettings.findOne().sort({ createdAt: 1 }).lean()
  const q = doc?.freeShippingMinQty
  const minQty = q != null && Number.isFinite(Number(q)) && Number(q) >= 1 ? Math.floor(Number(q)) : null
  const paymentMethods = {
    cod: doc?.paymentMethods?.cod !== false,
    jazzcash: doc?.paymentMethods?.jazzcash === true,
    easypaisa: doc?.paymentMethods?.easypaisa === true,
  }
  return { freeShippingMinQty: minQty, paymentMethods }
}
