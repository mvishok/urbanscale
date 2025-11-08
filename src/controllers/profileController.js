
import Joi from 'joi'
import User from '../models/User.js'

const saveSchema = Joi.object({
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  radius: Joi.number().required(),
  prompt: Joi.string().allow('').default(''),
  label: Joi.string().max(80).default('My Search'),
  results: Joi.object().required()
})

export async function me(req, res) {
  const user = await User.findById(req.user.id)
  res.json({ id: user._id, email: user.email, name: user.name, saved: user.saved })
}

export async function save(req, res) {
  try {
    const payload = await saveSchema.validateAsync(req.body)
    const user = await User.findById(req.user.id)
    user.saved.unshift(payload)
    await user.save()
    res.json({ ok: true })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

export async function removeSave(req, res) {
  const { idx } = req.params
  const user = await User.findById(req.user.id)
  user.saved.splice(Number(idx), 1)
  await user.save()
  res.json({ ok: true })
}

export async function updateProfile(req, res) {
  try {
    const { name, avatar } = req.body // avatar: data URL or image URL
    const user = await User.findById(req.user.id)
    if (name) user.name = name
    if (avatar && avatar.length < 2_000_000) user.avatar = avatar
    await user.save()
    res.json({ ok: true })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}
