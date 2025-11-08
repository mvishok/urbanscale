
import { Router } from 'express'
import { analyze } from '../controllers/locationController.js'
import { requireAuth } from '../middleware/auth.js'
const r = Router()
r.post('/analyze', requireAuth, analyze)
export default r
