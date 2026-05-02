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
