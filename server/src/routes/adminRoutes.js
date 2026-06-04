import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { adminOnly } from '../middleware/admin.js'
import {
  getStats,
  getUsers, getUserById, updateUserRole, deleteUser,
  getAdminProducts, createProduct, updateProduct, deleteProduct,
  getAdminEvents, createEvent, updateEvent, deleteEvent,
  getAdminOrders, updateOrderStatus,
} from '../controllers/adminController.js'
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '../controllers/adminCategoryController.js'
import { getAdminShopSettings, updateShopSettings } from '../controllers/shopSettingsController.js'
import {
  listAdminCampaignBanners,
  createCampaignBanner,
  updateCampaignBanner,
  deleteCampaignBanner,
} from '../controllers/campaignBannerController.js'

const router = Router()

router.use(protect, adminOnly)

router.get('/stats', getStats)

router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.put('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)

router.get('/products', getAdminProducts)
router.post('/products', createProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

router.get('/categories', getAdminCategories)
router.post('/categories', createAdminCategory)
router.put('/categories/:id', updateAdminCategory)
router.delete('/categories/:id', deleteAdminCategory)

router.get('/events', getAdminEvents)
router.post('/events', createEvent)
router.put('/events/:id', updateEvent)
router.delete('/events/:id', deleteEvent)

router.get('/orders', getAdminOrders)
router.put('/orders/:id/status', updateOrderStatus)

router.get('/shop-settings', getAdminShopSettings)
router.put('/shop-settings', updateShopSettings)

router.get('/campaign-banners', listAdminCampaignBanners)
router.post('/campaign-banners', createCampaignBanner)
router.put('/campaign-banners/:id', updateCampaignBanner)
router.delete('/campaign-banners/:id', deleteCampaignBanner)

export default router
