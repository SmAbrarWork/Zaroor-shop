/** Sum PKR shipping for cart lines: per-unit rate × quantity for the selected zone. */
export function totalShippingForCartItems(items, destinationKey) {
  if (!destinationKey || !Array.isArray(items)) return 0
  return items.reduce((sum, item) => {
    const product = item.product
    if (!product) return sum
    const rates = product.shippingRates || []
    const row = rates.find((r) => r.destination === destinationKey)
    const unit = row != null ? Math.max(0, Number(row.cost) || 0) : 0
    return sum + unit * (item.quantity || 1)
  }, 0)
}

/** Per product id (string), total quantity in the bag (all variants / lines). */
export function aggregateQtyByProductId(items) {
  const m = new Map()
  if (!Array.isArray(items)) return m
  for (const item of items) {
    const raw = item.product?._id ?? item.product?.id
    if (raw == null) continue
    const id = String(raw)
    const q = Number(item.quantity) || 0
    m.set(id, (m.get(id) || 0) + q)
  }
  return m
}

/**
 * Free shipping when at least one product has this many units in the bag (same product, any variant).
 * @param freeShippingMinQty from GET /shop-settings; null/undefined = rule off
 */
export function qualifiesFreeShippingSingleProduct(items, freeShippingMinQty) {
  if (freeShippingMinQty == null || freeShippingMinQty < 1) return false
  for (const q of aggregateQtyByProductId(items).values()) {
    if (q >= freeShippingMinQty) return true
  }
  return false
}

/**
 * Smallest number of extra units to add to any one product line (conceptually) to reach the threshold.
 * Empty bag → full threshold. When already qualified, returns 0.
 */
export function minExtraUnitsForSingleProductFreeShipping(items, freeShippingMinQty) {
  if (freeShippingMinQty == null || freeShippingMinQty < 1) return null
  if (qualifiesFreeShippingSingleProduct(items, freeShippingMinQty)) return 0
  const m = aggregateQtyByProductId(items)
  if (m.size === 0) return freeShippingMinQty
  let best = Infinity
  for (const q of m.values()) {
    const need = freeShippingMinQty - q
    if (need > 0 && need < best) best = need
  }
  return best === Infinity ? freeShippingMinQty : best
}

/**
 * Applies admin free shipping: PKR 0 when any one product reaches the minimum quantity.
 * @param items cart lines with populated product
 */
export function applyFreeShippingRule(rawShipping, items, freeShippingMinQty) {
  if (freeShippingMinQty == null || freeShippingMinQty < 1) return rawShipping
  if (qualifiesFreeShippingSingleProduct(items, freeShippingMinQty)) return 0
  return rawShipping
}
