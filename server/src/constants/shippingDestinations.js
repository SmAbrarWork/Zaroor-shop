/**
 * Canonical shipping zones (PKR per unit is set per product in admin).
 * Keep keys in sync with `client/src/constants/shippingDestinations.js`.
 */
export const SHIPPING_DESTINATIONS = [
  { key: 'karachi', label: 'Karachi' },
  { key: 'lahore', label: 'Lahore' },
  { key: 'islamabad', label: 'Islamabad' },
  { key: 'rawalpindi', label: 'Rawalpindi' },
  { key: 'faisalabad', label: 'Faisalabad' },
  { key: 'multan', label: 'Multan' },
  { key: 'peshawar', label: 'Peshawar' },
  { key: 'quetta', label: 'Quetta' },
  { key: 'other', label: 'Rest of Pakistan' },
]

export const SHIPPING_DESTINATION_KEYS = new Set(SHIPPING_DESTINATIONS.map((d) => d.key))

export function labelForShippingKey(key) {
  return SHIPPING_DESTINATIONS.find((d) => d.key === key)?.label ?? key
}
