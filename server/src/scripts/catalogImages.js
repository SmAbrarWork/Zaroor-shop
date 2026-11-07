/**
 * Product photos live in client/public/catalog, one file per product slug.
 * A product image is never shared with another product or another event.
 * Heroes and banners use a separate photo pool and do not reuse product files.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const catalogDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../client/public/catalog')
const shot = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`

const scene = [
  'photo-1441984904996-e0b6ba687e04',
  'photo-1445205170230-053b83016050',
  'photo-1441986300917-64674bd600d8',
  'photo-1512436991641-6745cdb1723f',
  'photo-1434389677669-e08b4cac3105',
  'photo-1523381210434-271e8be1f52b',
  'photo-1525507119028-ed4c629a60a3',
  'photo-1472851294608-062f824d29cc',
  'photo-1567401893414-76b7b1e5a7a5',
  'photo-1558769132-cb1aea458c5e',
  'photo-1483985988355-763728e1935b',
  'photo-1495385794356-15371f348c31',
  'photo-1467043237213-65f2da53396f',
  'photo-1529139574466-a303027c1d8b',
  'photo-1475180098004-ca77a66827be',
  'photo-1496747611176-843222e1e57c',
  'photo-1515886657613-9f3515b0c78f',
  'photo-1509631179647-0177331693ae',
  'photo-1524504388940-b1c1722653e1',
  'photo-1490481651871-ab68de25d43d',
  'photo-1485968579580-b6d095142e6e',
  'photo-1469334031218-e382a71b716b',
  'photo-1617137968427-85924c800a22',
  'photo-1617127365659-c47fa864d8bc',
  'photo-1495121605193-b116b5b9c5fe',
]

const pools = { scene }

export function assignUniqueCatalogImages({ events, productDefs, campaignBannerDefs }) {
  const used = new Set()
  const spare = Object.values(pools).flat()

  const take = (bucketName) => {
    const bucket = pools[bucketName]
    const id = bucket.find((item) => !used.has(item)) || spare.find((item) => !used.has(item))
    if (!id) throw new Error(`Ran out of unique photos while filling ${bucketName}`)
    used.add(id)
    return shot(id)
  }

  for (const product of productDefs) {
    const file = path.join(catalogDir, `${product.slug}.jpg`)
    if (!fs.existsSync(file)) {
      throw new Error(`Missing unique product photo for ${product.slug}. Add client/public/catalog/${product.slug}.jpg`)
    }
    product.image = `/catalog/${product.slug}.jpg`
  }
  for (const event of events) {
    event.heroImage = take('scene')
  }
  for (const banner of campaignBannerDefs) {
    banner.image = take('scene')
  }

  const urls = [
    ...productDefs.map((product) => product.image),
    ...events.map((event) => event.heroImage),
    ...campaignBannerDefs.map((banner) => banner.image),
  ]
  if (new Set(urls).size !== urls.length) {
    throw new Error('Catalog images are not unique')
  }
  console.log(`Assigned ${urls.length} unique photos (${productDefs.length} products)`)
}
