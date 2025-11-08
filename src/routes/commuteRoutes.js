
import { Router } from 'express'
import { commute } from '../controllers/commuteController.js'
const r = Router()
r.get('/commute', commute)
export default r
