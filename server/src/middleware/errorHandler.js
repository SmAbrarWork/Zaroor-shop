import { env } from '../config/environment.js'

export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode ?? 500
  const isProd = env.nodeEnv === 'production'
  return res.status(status).json({
    success: false,
    message: isProd && status === 500 ? 'Internal server error' : (err.message ?? 'Internal server error'),
  })
}
