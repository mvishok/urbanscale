
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import User from '../models/User.js'

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(1).max(50).optional()
})

export async function signup(req, res) {
  try {
    const { email, password, name } = await schema.validateAsync(req.body)
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, name, passwordHash: hash, saved: [] })
    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email, name } })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = await schema.validateAsync(req.body)
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email, name: user.name } })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}
