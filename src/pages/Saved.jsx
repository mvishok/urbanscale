
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { motion } from 'framer-motion'

export default function Saved(){
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  async function load(){
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/profile/me', { headers: { Authorization: `Bearer ${token}` } })
      setMe(data)
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ load() },[])

  async function remove(idx){
    const token = localStorage.getItem('token')
    setDeleting(idx)
    try {
      await api.delete('/profile/save/'+idx, { headers: { Authorization: `Bearer ${token}` } })
      await load()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Saved Locations
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your analyzed location history</p>
        </div>
        <Link 
          to="/" 
          className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-all duration-200 flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>
      </motion.header>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full spinner mx-auto" />
            <p className="text-slate-400 mt-4">Loading...</p>
          </div>
        ) : !me ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Login Required</h3>
            <p className="text-slate-400 mb-6">Please log in to view your saved locations</p>
            <Link to="/login" className="btn-primary inline-block">
              Sign In
            </Link>
          </motion.div>
        ) : me.saved?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No Saved Locations</h3>
            <p className="text-slate-400 mb-6">Analyze a location and save it to see it here</p>
            <Link to="/" className="btn-primary inline-block">
              Analyze Location
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {me.saved?.map((s, i)=>(
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card hover:border-indigo-500/30"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{s.label}</h3>
                    <p className="text-xs text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button 
                    onClick={()=>remove(i)} 
                    className="bg-red-600/80 hover:bg-red-600 px-3 py-1.5 text-sm"
                    disabled={deleting === i}
                  >
                    {deleting === i ? '...' : 'Delete'}
                  </Button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Overall Score</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {s.results?.scoring?.overall ?? '—'}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${s.results?.scoring?.overall || 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                    <div className="text-slate-500">Latitude</div>
                    <div className="font-medium">{s.lat?.toFixed(4)}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                    <div className="text-slate-500">Longitude</div>
                    <div className="font-medium">{s.lon?.toFixed(4)}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg px-3 py-2 col-span-2">
                    <div className="text-slate-500">Search Radius</div>
                    <div className="font-medium">{s.radius} meters ({(s.radius/1000).toFixed(1)} km)</div>
                  </div>
                </div>

                {s.prompt && (
                  <div className="mt-3 p-3 bg-slate-800/30 rounded-lg text-sm text-slate-300 italic">
                    "{s.prompt}"
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
