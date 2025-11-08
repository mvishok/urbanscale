
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'
import locationRoutes from './routes/locationRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import commuteRoutes from './routes/commuteRoutes.js'
import airRoutes from './routes/airRoutes.js'

const app = express()

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))
app.use(helmet())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/', (req, res) => res.json({ ok: true, service: 'location-score' }))
app.use('/api/auth', authRoutes)
app.use('/api/location', locationRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api', commuteRoutes)
app.use('/api/external', airRoutes)

const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/location_score'

mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB connected')
  app.listen(PORT, () => console.log('Server on port', PORT))
}).catch(err => {
  console.error('Mongo connect error', err)
  process.exit(1)
})
