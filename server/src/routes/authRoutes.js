import { Router } from 'express'
import { register, login, googleAuth, googleCallback, getMe } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.get('/google', googleAuth)
router.get('/google/callback', googleCallback)

export default router
