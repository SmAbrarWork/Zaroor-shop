import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import passport from './config/passport.js'
import eventRoutes from './routes/eventRoutes.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { buildTrackingRoutes } from './routes/trackingRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { TrackingService } from './services/trackingService.js'
import { env } from './config/environment.js'
import { swaggerSpec } from './config/swagger.js'

const app = express()

if (process.env.VERCEL) {
  app.set('trust proxy', 1)
}

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (env.clientUrls.includes(origin)) return callback(null, true)
      return callback(null, false)
    },
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))
if (env.nodeEnv !== 'production') app.use(morgan('dev'))
app.use(passport.initialize())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, try again in 15 minutes' },
})

const trackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many requests' },
})

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' })
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/events', eventRoutes)
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/tracking', trackingLimiter, buildTrackingRoutes(new TrackingService(env)))
app.use(errorHandler)

export default app
