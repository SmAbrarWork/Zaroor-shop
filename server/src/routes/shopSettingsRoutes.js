import { Router } from 'express'
import { getPublicShopSettings } from '../controllers/shopSettingsController.js'

const router = Router()
router.get('/', getPublicShopSettings)
export default router
