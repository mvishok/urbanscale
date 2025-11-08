
import { weightsFromPrompt } from '../utils/promptWeights.js'

function distanceMeters(a, b) {
  const R = 6371000
  const toRad = d => d * Math.PI/180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2
  const d = 2 * R * Math.asin(Math.sqrt(x))
  return d
}

export function scoreResults({ lat, lon, radius, prompt, data, overrideWeights }) {
  const weights = overrideWeights || weightsFromPrompt(prompt)
  const origin = { lat, lon }

  const categoryScores = {}
  let totalWeightedScore = 0
  let totalWeight = 0

  for (const [cat, items] of Object.entries(data)) {
    const w = weights[cat] || 0.25 // Default small weight
    
    if (!items || !items.length) {
      categoryScores[cat] = { raw: 0, score: 0, count: 0, nearest: null }
      // If this category was important (high weight) but has no places, penalize
      if (w > 1.5) {
        totalWeightedScore += 0 // No places in important category = 0 score
        totalWeight += w
      }
      continue
    }

    const distances = items.map(x => distanceMeters(origin, x))
    const nearest = Math.min(...distances)

    // Better density calculation
    const area = Math.PI * (radius ** 2) // m^2
    const density = items.length / Math.max(area, 1)  // places per m^2
    
    // Tune density score more aggressively (less places = lower score)
    const densityScore = Math.min(1, Math.sqrt(density * 5e6))

    // Proximity: exponential decay is better
    const proxScore = Math.max(0, Math.exp(-nearest / radius) * 1.2)

    // Balance density and proximity
    const raw = Math.min(1, 0.5 * densityScore + 0.5 * proxScore)
    
    categoryScores[cat] = { 
      raw, 
      score: raw * 100, // Score out of 100 per category
      count: items.length, 
      nearest 
    }

    // Weighted contribution
    totalWeightedScore += raw * w
    totalWeight += w
  }

  // Overall score: weighted average, scaled to 100
  const overall = totalWeight > 0 
    ? Math.round(Math.min(100, Math.max(0, (totalWeightedScore / totalWeight) * 100)))
    : 0

  console.log('Scoring:', { weights, totalWeightedScore, totalWeight, overall });

  return { weights, categoryScores, overall }
}
