import dotenv from 'dotenv'

dotenv.config()

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri:
    process.env.MONGO_URI ?? 'mongodb://mongo:27017/zeroor_shop',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/auth/google/callback',
  // Marketing
  metaPixelId: process.env.META_PIXEL_ID ?? '',
  metaConversionsToken: process.env.META_CONVERSIONS_TOKEN ?? '',
  ga4MeasurementId: process.env.GA4_MEASUREMENT_ID ?? '',
  ga4ApiSecret: process.env.GA4_API_SECRET ?? '',
}
