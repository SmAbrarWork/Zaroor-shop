import { Router } from 'express'
import { createTrackingController } from '../controllers/trackingController.js'

export const buildTrackingRoutes = (trackingService) => {
  const router = Router()
  const controller = createTrackingController(trackingService)
  router.post('/', controller.trackEvent)
  return router
}
