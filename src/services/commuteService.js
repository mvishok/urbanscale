
import axios from 'axios'

const OSRM = 'https://router.project-osrm.org/route/v1'

export async function routeDuration({ fromLat, fromLon, toLat, toLon, mode='driving' }) {
  // mode: driving, cycling, walking -> map to osrm profile
  const profile = mode === 'cycling' ? 'bike' : (mode === 'walking' ? 'foot' : 'driving')
  const url = `${OSRM}/${profile}/${fromLon},${fromLat};${toLon},${toLat}?overview=false&annotations=duration`

  const { data } = await axios.get(url)
  if (!data.routes || !data.routes[0]) return { seconds: null }
  return { seconds: Math.round(data.routes[0].duration) }
}
