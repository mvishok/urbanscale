import Joi from 'joi'
import axios from 'axios'

const schema = Joi.object({
    lat: Joi.number().required(),
    lon: Joi.number().required()
})

export async function airquality(req, res) {
    try {
        const { lat, lon } = await schema.validateAsync(req.query)
        
        // Step 1: Find locations near the coordinates
        const locationsUrl = `https://api.openaq.org/v3/locations`
        const { data: locationsData } = await axios.get(locationsUrl, {
            params: {
                coordinates: `${lat},${lon}`,
                radius: 25000, // 25km radius (maximum allowed)
                limit: 20, // Get top 20 nearest locations to try multiple if needed
            },
            headers: {
                'X-API-Key': process.env.OPENAQ_API_KEY
            }
        })

        if (!locationsData.results || locationsData.results.length === 0) {
            return res.json({ 
                results: {}, 
                message: 'No air quality monitoring stations found near this location' 
            })
        }

        // Step 2: Try multiple locations until we find one with measurements
        let latest = {}
        let locationWithData = null

        for (const location of locationsData.results) {
            try {
                const latestUrl = `https://api.openaq.org/v3/locations/${location.id}/latest`
                const { data: latestData } = await axios.get(latestUrl, {
                    params: {
                        limit: 100
                    },
                    headers: {
                        'X-API-Key': process.env.OPENAQ_API_KEY
                    }
                })

                // Organize measurements by parameter for easy access
                const measurements = {}
                for (const measurement of latestData.results || []) {
                    const paramName = measurement.parameter?.name || measurement.parameter?.id
                    if (paramName && !measurements[paramName]) {
                        measurements[paramName] = {
                            value: measurement.value,
                            unit: measurement.parameter?.units,
                            lastUpdated: measurement.datetime,
                            coordinates: measurement.coordinates,
                            locationId: location.id,
                            locationName: location.name,
                            distance: location.distance
                        }
                    }
                }

                // If we found measurements, use this location
                if (Object.keys(measurements).length > 0) {
                    latest = measurements
                    locationWithData = location
                    break
                }
            } catch (err) {
                console.log(`Failed to get data from location ${location.id}, trying next...`)
                continue
            }
        }

        if (!locationWithData) {
            return res.json({ 
                results: {}, 
                message: 'Found monitoring stations but no recent measurements available',
                nearestStation: locationsData.results[0].name
            })
        }

        res.json({ 
            results: latest,
            location: {
                id: locationWithData.id,
                name: locationWithData.name,
                distance: locationWithData.distance,
                coordinates: locationWithData.coordinates
            }
        })
    } catch (e) {
        console.error('Air quality API error:', e.message)
        if (e.response) {
            console.error('Response data:', e.response.data)
            res.status(e.response.status).json({
                error: e.response.data?.detail || e.response.data || 'Error from OpenAQ API',
            })
        } else {
            res.status(400).json({ error: e.message })
        }
    }
}
