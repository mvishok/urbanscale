
import Joi from 'joi'
import { fetchAmenitiesByCategory, reverseGeocode } from '../services/overpassService.js'
import { scoreResults } from '../services/scoringService.js'
import { groqWeights } from '../services/groqService.js'
import { weightsFromPrompt } from '../utils/promptWeights.js'

const schema = Joi.object({
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  radius: Joi.number().min(100).max(5000).default(1200),
  prompt: Joi.string().allow('').default('')
})

export async function analyze(req, res) {
  try {
    const { lat, lon, radius, prompt } = await schema.validateAsync(req.body)
    const [place, data] = await Promise.all([
      reverseGeocode({ lat, lon }).catch(()=>({ displayName: null })),
      fetchAmenitiesByCategory({ lat, lon, radius })
    ])
    // Base weights from keywords, then try Groq refinement
    const baseW = weightsFromPrompt(prompt)
    const groqW = await groqWeights(prompt, baseW)
    const scoring = scoreResults({ lat, lon, radius, prompt, data, overrideWeights: groqW || baseW })
    res.json({ place, data, scoring, usedGroq: !!groqW })
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: e.message })
  }
}
