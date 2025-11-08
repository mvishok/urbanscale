
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { me, save, removeSave, updateProfile } from '../controllers/profileController.js'
const r = Router()
r.get('/me', requireAuth, me)
r.post('/save', requireAuth, save)
r.post('/update', requireAuth, updateProfile)
r.delete('/save/:idx', requireAuth, removeSave)
export default r
