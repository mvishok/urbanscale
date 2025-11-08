
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'
import Loader from '../components/Loader.jsx'
import { motion } from 'framer-motion'

export default function App() {
  const [lat, setLat] = useState('13.0827')
  const [lon, setLon] = useState('80.2707')
  const [radius, setRadius] = useState('1200')
  const [prompt, setPrompt] = useState('I\'m a college student looking for a PG')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { token } = useAuth()

  
  async function submit(e){
    e.preventDefault()
    if (!token) { 
      alert('Please log in to analyze.') 
      nav('/login')
      return 
    }
    try {
      setLoading(true)
      const { data } = await api.post('/location/analyze', { 
        lat: Number(lat), 
        lon: Number(lon), 
        radius: Number(radius), 
        prompt 
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      nav('/results', { state: { input: { lat, lon, radius, prompt }, result: data } })
    } catch (err) {
      alert('Error analyzing location: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  function useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(4))
          setLon(position.coords.longitude.toFixed(4))
        },
        () => alert('Could not get your location')
      )
    }
  }

  const examplePrompts = [
    "I'm a college student looking for a PG",
    "Family with kids, need schools and parks",
    "Looking for a place near hospitals",
    "Young professional, need gyms and cafes",
    "Family relocating, need schools and temples",
    "Starting a motorcycle repair shop",
    "Senior citizen looking for quiet residential area",
    "Young professional needs cafes and coworking spaces",
    "Shop owner setting up a clothing store"
  ]

  return (
    <div className="min-h-screen">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 sm:p-6 border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/30 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Urbanscale
            </h1>
            <p className="text-xs text-slate-400 mt-1 hidden sm:block">AI-Powered Location Intelligence</p>
          </div>
          <nav className="flex gap-2 sm:gap-3 items-center">
            {token ? (
              <>
                <Link to="/saved" className="px-3 sm:px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-all duration-200 text-sm">
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    localStorage.removeItem('token')
                    window.location.reload()
                  }}
                  className="px-3 sm:px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 sm:px-4 py-2 rounded-xl hover:bg-slate-800/50 transition-all duration-200 text-sm">
                  Login
                </Link>
                <Link to="/signup" className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 py-8 sm:py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Find Your Perfect Location</h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Analyze any location with AI. Get detailed scores based on your priorities - education, entertainment, health, and finance.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <form onSubmit={submit} className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-300">Latitude</span>
                <input 
                  className="input-field" 
                  value={lat} 
                  onChange={e=>setLat(e.target.value)} 
                  required 
                  type="number"
                  step="any"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-300">Longitude</span>
                <input 
                  className="input-field" 
                  value={lon} 
                  onChange={e=>setLon(e.target.value)} 
                  required 
                  type="number"
                  step="any"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={useCurrentLocation}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 -mt-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use my current location
            </button>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">Search Radius (meters)</span>
              <input 
                className="input-field" 
                value={radius} 
                onChange={e=>setRadius(e.target.value)} 
                required 
                type="number"
                min="100"
                max="5000"
              />
              <span className="text-xs text-slate-500">{(radius/1000).toFixed(1)} km radius</span>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">What matters to you?</span>
              <textarea 
                className="input-field min-h-[100px] resize-none" 
                value={prompt} 
                onChange={e=>setPrompt(e.target.value)} 
                placeholder="Describe your needs in natural language..."
                rows="3"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 self-center">Try:</span>
              {examplePrompts.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="text-xs px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors text-slate-300"
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="flex justify-stretch sm:justify-end pt-4">
              <Button 
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto" 
                loading={loading} 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader /> Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze Location
                  </span>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        {!token && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center"
          >
            <p className="text-amber-300 text-sm">
              🔒 Please <Link to="/login" className="underline font-semibold">log in</Link> to analyze locations
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
