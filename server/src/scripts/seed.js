import mongoose from 'mongoose'
import { env } from '../config/environment.js'
import { Event } from '../models/Event.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'

const mongoUri = env.mongoUri

const events = [
  {
    name: '14 August Azadi Day',
    slug: 'azadi-day',
    theme: { primary: '#052e16', accent: '#dcfce7', text: '#f0fdf4', surface: '#064e3b' },
    heroTitle: '14 August Azadi Day',
    heroSubtitle: 'Limited National Streetwear',
    heroImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80',
    ctaLabel: 'Shop Azadi Collection',
    campaignFocus: 'Pride. Style. Celebration.',
    displayMode: 'countdown',
    bannerText: 'Azadi Day Special - Pakistan Zindabad',
    countdownDate: new Date('2026-08-14T23:59:59'),
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-14T23:59:59'),
    story: 'Limited patriotic shirts and pants inspired by crescent, calligraphy, and green energy.',
  },
  {
    name: 'Anime Merch Festival',
    slug: 'anime-merch',
    theme: { primary: '#2b0a12', accent: '#b91c1c', text: '#f8fafc', surface: '#0a0a0a' },
    heroTitle: 'Anime Merch Festival',
    heroSubtitle: 'Two Months Of New Drops',
    heroImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80',
    ctaLabel: 'Explore Anime Merch',
    campaignFocus: 'Hype. Fandom. Limited Stock.',
    displayMode: 'text',
    bannerText: 'Anime Merch Festival - Live Now',
    countdownDate: new Date(Date.now() + (1000 * 60 * 60 * 24 * 60)),
    startDate: new Date(),
    endDate: new Date(Date.now() + (1000 * 60 * 60 * 24 * 60)),
    story: 'Two-month anime merch timeline with statement shirts and custom pants collectibles.',
  },
]

const products = [
  {
    name: 'Azadi Flag Oversized Shirt',
    slug: 'azadi-flag-oversized-shirt',
    productType: 'shirt',
    price: 3490,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    tags: ['azadi-day'],
    stock: 50,
    description: 'Heavy cotton shirt with crescent-star and bold Pakistan green print.',
    options: {
      colors: ['Green', 'White', 'Black'],
      sizes: ['Small', 'Medium', 'Large'],
      waistSizes: [],
    },
    variantStock: [
      { color: 'Green', size: 'Small', waistSize: null, stock: 8 },
      { color: 'Green', size: 'Medium', waistSize: null, stock: 10 },
      { color: 'Green', size: 'Large', waistSize: null, stock: 8 },
      { color: 'White', size: 'Medium', waistSize: null, stock: 8 },
      { color: 'Black', size: 'Large', waistSize: null, stock: 6 },
    ],
  },
  {
    name: 'Pakistan Pride Cargo Pants',
    slug: 'pakistan-pride-cargo-pants',
    productType: 'pants',
    price: 2290,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80',
    tags: ['azadi-day'],
    stock: 70,
    description: 'Street cargo pants inspired by Azadi shades and victory green style.',
    options: {
      colors: ['Deep Green', 'Emerald', 'White'],
      sizes: [],
      waistSizes: [30, 32, 34, 36],
    },
    variantStock: [
      { color: 'Deep Green', size: '', waistSize: 30, stock: 10 },
      { color: 'Deep Green', size: '', waistSize: 32, stock: 8 },
      { color: 'Emerald', size: '', waistSize: 34, stock: 10 },
      { color: 'White', size: '', waistSize: 36, stock: 6 },
    ],
  },
  {
    name: 'Neon Hero Anime Shirt',
    slug: 'neon-hero-anime-shirt',
    productType: 'shirt',
    price: 3890,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
    tags: ['anime-merch'],
    stock: 80,
    description: 'Anime-inspired street shirt with neon character art print.',
    options: {
      colors: ['Purple', 'Blue', 'Black'],
      sizes: ['Small', 'Medium', 'Large'],
      waistSizes: [],
    },
    variantStock: [
      { color: 'Purple', size: 'Small', waistSize: null, stock: 10 },
      { color: 'Purple', size: 'Medium', waistSize: null, stock: 12 },
      { color: 'Blue', size: 'Medium', waistSize: null, stock: 10 },
      { color: 'Black', size: 'Large', waistSize: null, stock: 9 },
    ],
  },
  {
    name: 'Manga Runner Pants',
    slug: 'manga-runner-pants',
    productType: 'pants',
    price: 2590,
    image: 'https://images.unsplash.com/photo-1593032465171-8bd2f72ac8c0?auto=format&fit=crop&w=1200&q=80',
    tags: ['anime-merch'],
    stock: 90,
    description: 'Anime-inspired runner pants built for comfort and bold character style.',
    options: {
      colors: ['Crimson', 'Electric Blue', 'Neon Yellow'],
      sizes: [],
      waistSizes: [28, 30, 32, 34],
    },
    variantStock: [
      { color: 'Crimson', size: '', waistSize: 28, stock: 10 },
      { color: 'Crimson', size: '', waistSize: 30, stock: 9 },
      { color: 'Electric Blue', size: '', waistSize: 32, stock: 10 },
      { color: 'Neon Yellow', size: '', waistSize: 34, stock: 7 },
    ],
  },
]

async function seed() {
  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    await Event.deleteMany({})
    await Product.deleteMany({})

    const insertedEvents = await Event.insertMany(events)
    const eventBySlug = new Map(insertedEvents.map((event) => [event.slug, event]))
    const productsWithEvents = products.map((product) => {
      const eventSlug = product.tags?.[0]
      const event = eventBySlug.get(eventSlug)
      return {
        ...product,
        event: event?._id || null,
      }
    })
    const insertedProducts = await Product.insertMany(productsWithEvents)

    // Seed admin user (upsert so re-running is safe)
    const adminEmail = 'zaroor.shop1@gmail.com'
    const existingAdmin = await User.findOne({ email: adminEmail })
    if (!existingAdmin) {
      await User.create({ name: 'Admin', email: adminEmail, password: 'admin', role: 'admin' })
      console.log('Created admin user: zaroor.shop1@gmail.com / admin')
    } else {
      existingAdmin.role = 'admin'
      await existingAdmin.save()
      console.log('Admin user already exists, role ensured')
    }

    console.log(`Seeded ${insertedEvents.length} events`)
    console.log(`Seeded ${insertedProducts.length} products`)

    await mongoose.disconnect()
    console.log('Done')
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()
