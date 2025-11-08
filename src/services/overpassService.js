
import axios from 'axios'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const USER_AGENT = 'LocationScoreApp/1.0 (+github.com/yourname)'

const AMENITIES = {
  education: ['school','university','library'],
  entertainment: ['park','theatre','museum','cinema','arts_centre','zoo','playground','sports_centre','swimming_pool','gym'],
  health: ['hospital','pharmacy','dentist'],
  finance: ['bank','atm']
}

export function categories() {
  return AMENITIES
}

// Build union query: each amenity as its own selector for node/way/relation
function buildQuery(lat, lon, radius, amenityList) {
  const blocks = []
  for (const a of amenityList) {
    blocks.push(`node[amenity=${a}](around:${radius},${lat},${lon});`)
    blocks.push(`way[amenity=${a}](around:${radius},${lat},${lon});`)
    blocks.push(`relation[amenity=${a}](around:${radius},${lat},${lon});`)
  }
  const union = blocks.join('\n')
  return `[out:json][timeout:25];
  (
    ${union}
  );
  out center;`
}

export async function fetchAmenitiesByCategory({ lat, lon, radius }) {
  const result = {}
  for (const [cat, list] of Object.entries(AMENITIES)) {
    const q = buildQuery(lat, lon, radius, list)
    const { data } = await axios.post(OVERPASS_URL, q, {
      headers: { 'Content-Type': 'text/plain', 'User-Agent': USER_AGENT }
    })
    const elements = (data.elements || []).map(el => {
      const center = el.center || { lat: el.lat, lon: el.lon }
      return {
        id: el.id,
        lat: center?.lat,
        lon: center?.lon,
        name: el.tags?.name || el.tags?.brand || 'Unnamed',
        amenity: el.tags?.amenity || 'unknown'
      }
    })
    result[cat] = elements
    await new Promise(r => setTimeout(r, 700))
  }
  return result
}

export async function reverseGeocode({ lat, lon }) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
  const { data } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } })
  return { displayName: data.display_name, address: data.address }
}
