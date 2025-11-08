
import { Router } from 'express'
import { airquality } from '../controllers/airController.js'
const r = Router()
r.get('/air', airquality)
export default r
