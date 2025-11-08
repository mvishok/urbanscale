
import { useLocation, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../lib/api'
import { clientScore } from '../lib/scoring'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Gauge from '../components/Gauge.jsx'
import Progress from '../components/Progress.jsx'
import Button from '../components/Button.jsx'
import { motion } from 'framer-motion'

export default function Results(){
  const { state } = useLocation()
  const { input, result } = state || {}
  const [weights, setWeights] = useState(result?.scoring?.weights || { 
    education:1, entertainment:1, health:1, finance:1,
    food:1, shopping:1, transport:1, tourism:1,
    business:1, automotive:1, services:1, religious:1,
    civic:1, emergency:1
  })
  const [score, setScore] = useState(result?.scoring)
  const [air, setAir] = useState(null)
  const [commute, setCommute] = useState(null)
  const [exporting, setExporting] = useState(false)
  const pdfRef = useRef(null)

  const token = localStorage.getItem('token')
  if (!token) return <div className='p-6 text-white'>Please log in to view results.</div>;
  if (!result) return <div className='p-6 text-white'>No results</div>

  useEffect(()=>{
    const s = clientScore({ lat: input.lat, lon: input.lon, radius: Number(input.radius), weights, data: result.data })
    setScore({ ...s, weights })
  }, [weights])

  useEffect(()=>{
    async function loadAir(){
      try {
        const { data } = await api.get(`/external/air?lat=${input.lat}&lon=${input.lon}`)
        setAir(data)
      } catch {}
    }
    loadAir()
  }, [])

  const { data, place } = result

  const [saving, setSaving] = useState(false)

  async function save() {
    try {
      setSaving(true)
      // Truncate label to 80 characters max
      const label = (place?.displayName || 'Search').substring(0, 80)
      
      await api.post('/profile/save', {
        lat: Number(input.lat), 
        lon: Number(input.lon), 
        radius: Number(input.radius),
        prompt: input.prompt, 
        label: label,
        results: { ...result, scoring: score }
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      // Show success message
      const btn = document.getElementById('save-btn')
      const originalText = btn.textContent
      btn.textContent = '✓ Saved!'
      btn.classList.add('bg-green-600')
      setTimeout(() => {
        btn.textContent = originalText
        btn.classList.remove('bg-green-600')
      }, 2000)
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.error || err.message))
    } finally {
      setSaving(false)
    }
  }

  function normalizeWeights(w){
    const sum = Object.values(w).reduce((a,b)=>a+Number(b),0) || 1
    const norm = {}
    // Normalize to sum of 14 (for 14 categories)
    for (const k of Object.keys(w)) norm[k] = Number(w[k]) * (14/sum)
    return norm
  }

  async function exportPDF(){
    setExporting(true)
    const el = pdfRef.current
    const canvas = await html2canvas(el)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
    const w = canvas.width * ratio, h = canvas.height * ratio
    pdf.addImage(imgData, 'PNG', (pageWidth - w)/2, 20, w, h)
    pdf.save('location-score-report.pdf')
    setExporting(false)
  }

  async function getCommute(){
    const toLat = prompt('Enter destination lat')
    const toLon = prompt('Enter destination lon')
    if (!toLat || !toLon) return
    const { data } = await api.get(`/commute?lat=${input.lat}&lon=${input.lon}&toLat=${toLat}&toLon=${toLon}&mode=driving`)
    setCommute(data.seconds)
  }

  return (
    <div className="min-h-screen p-6" ref={pdfRef}>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/50 pb-6 mb-6"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Location Analysis
          </h2>
          <p className="text-slate-400 text-sm mt-1 line-clamp-1">{place?.displayName || 'Custom Location'}</p>
          {input?.prompt && (
            <p className="text-slate-500 text-xs mt-1 italic">
              "{input.prompt}"
            </p>
          )}
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Link 
            to="/" 
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">New Search</span>
            <span className="sm:hidden">Search</span>
          </Link>
          <Button 
            id="save-btn"
            onClick={save} 
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Save Result</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </Button>
        </div>
      </motion.header>

      {/* First Row: Overall Score and Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card flex flex-col items-center justify-center gap-4 bg-slate-900/90 border-slate-700/50"
        >
          <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Overall Score</div>
          <Gauge value={score?.overall || 0} />
          <div className="text-xs text-slate-500">AI-powered analysis</div>
          <div className={`mt-2 px-4 py-1.5 rounded-full text-xs font-medium ${
            score?.overall >= 75 ? 'bg-green-500/20 text-green-300' : 
            score?.overall >= 50 ? 'bg-indigo-500/20 text-indigo-300' : 
            score?.overall >= 25 ? 'bg-amber-500/20 text-amber-300' : 
            'bg-red-500/20 text-red-300'
          }`}>
            {score?.overall >= 75 ? '🌟 Excellent' : score?.overall >= 50 ? '✓ Good' : score?.overall >= 25 ? '⚠️ Fair' : '❌ Poor'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
          className="card md:col-span-2 lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <h3 className="font-semibold text-lg">Interactive Map</h3>
            <span className="text-xs text-slate-400">
              📍 {Number(input.lat).toFixed(4)}, {Number(input.lon).toFixed(4)}
            </span>
          </div>
          <MapContainer center={[Number(input.lat), Number(input.lon)]} zoom={14} scrollWheelZoom={false} id="map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[Number(input.lat), Number(input.lon)]}>
              <Popup>Origin</Popup>
            </Marker>
            {Object.entries(data).flatMap(([cat, items]) => items.map((it,i)=>(
              <Marker key={cat+i} position={[it.lat, it.lon]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25,41], iconAnchor:[12,41] })}>
                <Popup><b>{it.name}</b><br/>{it.amenity}<br/>{cat}</Popup>
              </Marker>
            )))}
          </MapContainer>
        </motion.div>
      </div>

      {/* Second Row: Adjust Priorities - Full Width */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
          <h4 className="font-semibold mb-3 text-lg">Adjust Priorities</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['education','entertainment','health','finance','food','shopping','transport','tourism','business','automotive','services','religious','civic','emergency'].map(k => (
              <div key={k} className="mb-2 last:mb-0">
                <div className="flex justify-between text-sm mb-2">
                  <span className="capitalize font-medium">{k}</span>
                  <span className="text-indigo-400 font-semibold">{(weights[k]||0).toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  step="0.1" 
                  defaultValue={weights[k]} 
                  onChange={e=>setWeights(w=>normalizeWeights({ ...w, [k]: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4 p-3 bg-slate-800/50 rounded-lg">
            💡 Adjust sliders to prioritize what matters to you. Scores update in real-time!
          </p>
        </motion.div>

      {/* Third Row: Category Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {Object.entries(score?.categoryScores || {}).map(([cat, v], idx) => {
          const icons = {
            education: '🎓',
            entertainment: '🎭',
            health: '🏥',
            finance: '💰',
            food: '🍽️',
            shopping: '🛒',
            transport: '🚌',
            tourism: '🏨',
            business: '💼',
            automotive: '🔧',
            services: '📮',
            religious: '⛪',
            civic: '🏛️',
            emergency: '🚨'
          }
          return (
            <motion.div key={cat}
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0, transition: { delay: 0.05 + (0.05 * idx) }}}
              className="card hover:border-indigo-500/30"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icons[cat]}</span>
                  <h3 className="font-bold capitalize text-lg">{cat}</h3>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {Math.round(v.score)}
                </span>
              </div>
              <Progress value={Math.min(100, Math.round(v.score))} />
              <div className="flex justify-between text-xs text-slate-400 mt-3">
                <span>{v.count} places found</span>
                <span>Nearest: {v.nearest ? `${Math.round(v.nearest)}m` : '—'}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Fourth Row: Commute, AQI, Water Quality, Green Ratio - 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="text-center">
            <div className="text-3xl mb-2">🚗</div>
            <h4 className="font-semibold text-sm mb-2">Commute Time</h4>
            {commute ? (
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {Math.round(commute/60)} min
              </div>
            ) : (
              <Button onClick={getCommute} className="btn-secondary text-xs px-3 py-1.5 w-full">
                Calculate
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="text-center">
            <div className="text-3xl mb-2">🌫️</div>
            <h4 className="font-semibold text-sm mb-2">Air Quality (AQI)</h4>
            {!air ? (
              <p className="text-xs opacity-75">Loading...</p>
            ) : (
              <div>
                <div className={`text-2xl font-bold ${
                  air.aqi <= 50 ? 'text-green-400' : 
                  air.aqi <= 100 ? 'text-yellow-400' : 
                  air.aqi <= 150 ? 'text-orange-400' : 
                  'text-red-400'
                }`}>
                  {air.aqi || 'N/A'}
                </div>
                <div className="text-xs text-slate-400 mt-1">{air.aqiLevel}</div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="text-center">
            <div className="text-3xl mb-2">💧</div>
            <h4 className="font-semibold text-sm mb-2">Water Quality</h4>
            <div className="text-xs text-slate-500 mt-3">
              Not Available
            </div>
            <p className="text-xs text-slate-600 mt-1">No public API</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="text-center">
            <div className="text-3xl mb-2">🌳</div>
            <h4 className="font-semibold text-sm mb-2">Green Ratio</h4>
            {!air ? (
              <p className="text-xs opacity-75">Loading...</p>
            ) : air.greenRatio !== null && air.greenRatio !== undefined ? (
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {air.greenRatio}%
                </div>
                <div className="text-xs text-slate-400 mt-1">Parks & Forest</div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 mt-3">Calculating...</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
