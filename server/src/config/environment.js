/**
 * Central configuration loaded from environment variables.
 *
 * Secrets and deployment values belong in `server/.env` (see `.env.example`).
 * This module calls dotenv when `server/.env` exists, parses types, applies defaults, and
 * exports a single `env` object so the rest of the app never reads process.env directly.
 */
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const clientUrlRaw = process.env.CLIENT_URL ?? 'http://localhost:3000'
const clientUrls = clientUrlRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri:
    process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/zeroor_shop',
  /** First origin: OAuth redirects and default */
  clientUrl: clientUrls[0] ?? 'http://localhost:3000',
  /** CORS allowed browser origins; set CLIENT_URL as comma-separated list */
  clientUrls: clientUrls.length ? clientUrls : ['http://localhost:3000'],
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/auth/google/callback',
  metaPixelId: process.env.META_PIXEL_ID ?? '',
  metaConversionsToken: process.env.META_CONVERSIONS_TOKEN ?? '',
  ga4MeasurementId: process.env.GA4_MEASUREMENT_ID ?? '',
  ga4ApiSecret: process.env.GA4_API_SECRET ?? '',
}

const weakJwtDefaults = new Set([
  'change-me-in-production',
  'your_jwt_secret_here',
  'zeroor-dev-secret-change-in-prod',
])

if (env.nodeEnv === 'production') {
  if (weakJwtDefaults.has(env.jwtSecret) || env.jwtSecret.length < 32) {
    console.warn('[config] Set a strong JWT_SECRET (32+ chars) in server/.env before going live')
  }
  if (!env.mongoUri.includes('mongodb')) {
    console.warn('[config] MONGO_URI looks unset; database connection will fail')
  }
}
