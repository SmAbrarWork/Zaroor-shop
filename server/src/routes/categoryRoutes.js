import { Router } from 'express'
import { getCategoriesPublic } from '../controllers/categoryController.js'

const router = Router()

router.get('/', getCategoriesPublic)

export default router
