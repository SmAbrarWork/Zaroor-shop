import { Router } from 'express'
import { listCampaignBannersPublic } from '../controllers/campaignBannerController.js'

const router = Router()
router.get('/', listCampaignBannersPublic)
export default router
