
import { createContext, useContext, useEffect, useState } from 'react'
import { setToken } from '../lib/api'

const AuthContext = createContext(null)
export function AuthProvider({ children }){
  const [token, setTok] = useState(localStorage.getItem('token'))
  useEffect(()=>{ setToken(token) }, [token])
  const login = t => { localStorage.setItem('token', t); setTok(t) }
  const logout = () => { localStorage.removeItem('token'); setTok(null) }
  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
