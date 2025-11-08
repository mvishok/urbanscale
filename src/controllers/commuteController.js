
import Joi from 'joi'
import { routeDuration } from '../services/commuteService.js'

const schema = Joi.object({
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  toLat: Joi.number().required(),
  toLon: Joi.number().required(),
  mode: Joi.string().valid('driving','cycling','walking').default('driving')
})

export async function commute(req, res) {
  try {
    const { lat, lon, toLat, toLon, mode } = await schema.validateAsync(req.query)
    const { seconds } = await routeDuration({ fromLat: lat, fromLon: lon, toLat, toLon, mode })
    res.json({ seconds })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}
