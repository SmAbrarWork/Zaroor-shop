/**
 * Must match server `server/src/constants/shippingDestinations.js` keys & labels.
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

export function labelForShippingKey(key) {
  return SHIPPING_DESTINATIONS.find((d) => d.key === key)?.label ?? key
}
