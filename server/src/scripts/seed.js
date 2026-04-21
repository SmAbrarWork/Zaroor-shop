import mongoose from 'mongoose'
import { env } from '../config/environment.js'
import { Event } from '../models/Event.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'

const mongoUri = env.mongoUri

const events = [
  {
    name: 'Ramadan Drop',
    slug: 'ramadan',
    theme: { primary: '#020617', accent: '#f59e0b', text: '#ffffff' },
    bannerText: 'Ramadan Kareem - Limited Night Drops',
    countdownDate: new Date('2026-03-20T23:59:59'),
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-31'),
    story: 'Honor the month with reflective designs, midnight offers, and intentional gifting.',
  },
  {
    name: 'Azadi Drop',
    slug: 'independence',
    theme: { primary: '#052e16', accent: '#dcfce7', text: '#f0fdf4' },
    bannerText: '14 August Azadi Capsule - Pakistan Zindabad',
    countdownDate: new Date('2026-08-14T23:59:59'),
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-31'),
    story: 'Street-inspired patriotism with bold flags, calligraphy, and victory green energy.',
  },
  {
    name: "Valentine's Drop",
    slug: 'valentine',
    theme: { primary: '#4c0519', accent: '#fda4af', text: '#fff1f2' },
    bannerText: "Love Loud - Valentine's Limited Collection",
    countdownDate: new Date('2026-02-14T23:59:59'),
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-02-14'),
    story: 'High-contrast romance, statement graphics, and gifts that feel personal.',
  },
]

const products = [
  {
    name: 'Noor Crescent Oversized Tee',
    slug: 'noor-crescent-oversized-tee',
    price: 3490,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    tags: ['ramadan'],
    stock: 50,
    description: 'Soft heavyweight cotton tee with crescent back print.',
  },
  {
    name: 'Iftar Nights Ceramic Mug',
    slug: 'iftar-nights-ceramic-mug',
    price: 1890,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
    tags: ['ramadan'],
    stock: 100,
    description: 'Durable mug crafted for long chai and suhoor sessions.',
  },
  {
    name: 'Sabr Minimal Phone Case',
    slug: 'sabr-minimal-phone-case',
    price: 1590,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    tags: ['ramadan'],
    stock: 75,
    description: 'Matte finish case featuring embossed Arabic typography.',
  },
  {
    name: 'Azadi 1947 Graphic Hoodie',
    slug: 'azadi-1947-graphic-hoodie',
    price: 4990,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    tags: ['independence'],
    stock: 40,
    description: 'Drop-shoulder hoodie with flag-inspired front artwork.',
  },
  {
    name: 'Green Nation Tote',
    slug: 'green-nation-tote',
    price: 1390,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    tags: ['independence'],
    stock: 80,
    description: 'Limited tote bag for celebrations, rallies, and daily carry.',
  },
  {
    name: 'Victory Day Dad Cap',
    slug: 'victory-day-dad-cap',
    price: 1690,
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
    tags: ['independence'],
    stock: 60,
    description: '6-panel cap stitched with crescent-star iconography.',
  },
  {
    name: 'Heartline Couple Hoodie',
    slug: 'heartline-couple-hoodie',
    price: 5290,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    tags: ['valentine'],
    stock: 30,
    description: 'Matching hoodie set with split-heart line art.',
  },
  {
    name: 'Love Letter Poster Pack',
    slug: 'love-letter-poster-pack',
    price: 990,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
    tags: ['valentine'],
    stock: 120,
    description: 'A3 poster set with expressive message-forward visuals.',
  },
  {
    name: 'Rose Gold Sipper Bottle',
    slug: 'rose-gold-sipper-bottle',
    price: 1990,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    tags: ['valentine'],
    stock: 55,
    description: 'Premium insulated bottle for all-day carry and gifting.',
  },
]

async function seed() {
  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    await Event.deleteMany({})
    await Product.deleteMany({})

    const insertedEvents = await Event.insertMany(events)
    const insertedProducts = await Product.insertMany(products)

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
