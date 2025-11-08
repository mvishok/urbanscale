
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext.jsx'
import { motion } from 'framer-motion'

export default function Login(){
  const [email,setEmail]=useState('test@example.com')
  const [password,setPassword]=useState('password123')
  const [loading,setLoading]=useState(false)
  const nav = useNavigate()
  const { login } = useAuth()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login',{email,password})
      login(data.token)
      nav('/')
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">Sign in to continue to Urbanscale</p>
        </div>

        <form onSubmit={submit} className="card grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Email</span>
            <input 
              className="input-field" 
              type="email"
              placeholder="you@example.com" 
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              required
            />
          </label>
          
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Password</span>
            <input 
              className="input-field" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              required
            />
          </label>

          <button 
            className="btn-primary w-full mt-2" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spinner" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>

          <div className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link className="text-indigo-400 hover:text-indigo-300 font-semibold" to="/signup">
              Sign up
            </Link>
          </div>
        </form>

        <Link 
          to="/"
          className="block text-center mt-6 text-slate-400 hover:text-slate-300 text-sm"
        >
          ← Back to home
        </Link>
      </motion.div>
    </div>
  )
}
