import { Router } from 'express'
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)
router.post('/', createOrder)
router.get('/', getMyOrders)
router.get('/:id', getOrderById)

export default router
