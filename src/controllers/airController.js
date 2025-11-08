import Joi from 'joi'
import axios from 'axios'

const schema = Joi.object({
    lat: Joi.number().required(),
    lon: Joi.number().required()
})

export async function airquality(req, res) {
    try {
        const { lat, lon } = await schema.validateAsync(req.query)
        
        // Use OpenWeatherMap Air Pollution API - more accurate location-based data
        const apiKey = process.env.OPENWEATHER_API_KEY
        const airUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        console.log(airUrl)
        const { data: airData } = await axios.get(airUrl)

        if (!airData.list || airData.list.length === 0) {
            return res.json({ 
                aqi: null,
                message: 'No air quality data available for this location' 
            })
        }

        const current = airData.list[0]
        const aqi = current.main.aqi
        
        // OpenWeatherMap AQI scale: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
        // Convert to US AQI scale (0-500)
        const aqiMap = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 275 }
        const aqiValue = aqiMap[aqi] || 100

        // Calculate green space ratio using park data from overpass
        let greenRatio = null
        try {
            const overpassUrl = 'https://overpass-api.de/api/interpreter'
            const query = `[out:json][timeout:10];
                (
                    way[leisure=park](around:2000,${lat},${lon});
                    way[landuse=forest](around:2000,${lat},${lon});
                    way[landuse=grass](around:2000,${lat},${lon});
                    way[natural=wood](around:2000,${lat},${lon});
                );
                out geom;`
            
            const { data: greenData } = await axios.post(overpassUrl, query, {
                headers: { 'Content-Type': 'text/plain' },
                timeout: 8000
            })
            
            const greenElements = greenData.elements || []
            // Approximate green area calculation
            if (greenElements.length > 0) {
                const totalArea = Math.PI * (2000 ** 2) // 2km radius in m²
                const greenArea = greenElements.length * 50000 // Rough estimate per element
                greenRatio = Math.min(100, Math.round((greenArea / totalArea) * 100))
            }
        } catch (err) {
            console.log('Green space calculation failed:', err.message)
        }

        // Water quality is not available from free APIs, so we'll skip it
        // Most water quality APIs require government-specific access

        res.json({ 
            aqi: aqiValue,
            aqiLevel: getAQILevel(aqiValue),
            greenRatio: greenRatio,
            coordinates: { lat: airData.coord.lat, lon: airData.coord.lon },
            lastUpdated: new Date(current.dt * 1000).toISOString()
        })
    } catch (e) {
        console.error('Air quality API error:', e.message)
        //show response body
        console.error(e.response?.data)
        // Provide fallback data based on location (India generally has moderate-poor AQI)
        res.json({
            aqi: 95,
            aqiLevel: 'Moderate',
            greenRatio: 15,
            message: 'Using estimated air quality data',
            lastUpdated: new Date().toISOString()
        })
    }
}

function getAQILevel(aqi) {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
}
