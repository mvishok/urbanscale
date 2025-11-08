
import axios from 'axios'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const USER_AGENT = 'LocationScoreApp/1.0 (+github.com/yourname)'

const AMENITIES = {
  // Core categories (existing)
  education: ['school','university','college','kindergarten','library','music_school','language_school','driving_school'],
  entertainment: ['park','theatre','museum','cinema','arts_centre','zoo','playground','sports_centre','swimming_pool','gym','nightclub','casino','amusement_arcade','community_centre','social_centre'],
  health: ['hospital','clinic','pharmacy','dentist','doctors','veterinary','nursing_home','baby_hatch'],
  finance: ['bank','atm','bureau_de_change','money_transfer'],
  
  // New expanded categories
  food: ['restaurant','cafe','fast_food','food_court','pub','bar','ice_cream','biergarten'],
  shopping: ['marketplace','supermarket','convenience','mall','department_store','kiosk','greengrocer','butcher','bakery'],
  transport: ['bus_station','taxi','car_rental','bicycle_rental','ferry_terminal','fuel','charging_station','parking','car_wash'],
  tourism: ['hotel','motel','hostel','guest_house','apartment','camp_site','caravan_site','information','viewpoint','attraction','gallery'],
  business: ['coworking_space','conference_centre','exhibition_centre','office'],
  automotive: ['car_repair','motorcycle_repair','car_parts','car_dealer','bicycle_repair'],
  services: ['post_office','post_box','telephone','internet_cafe','library','public_bookcase','salon','laundry','dry_cleaning','tailor','shoe_repair'],
  religious: ['place_of_worship','monastery','shrine','temple','church','mosque','synagogue'],
  civic: ['courthouse','fire_station','police','prison','post_office','townhall','embassy','community_centre'],
  emergency: ['ambulance_station','fire_station','police','emergency_phone','lifeguard']
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
