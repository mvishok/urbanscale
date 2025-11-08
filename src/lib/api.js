
import axios from 'axios'
const baseURL = import.meta.env.VITE_API || 'http://localhost:4000/api'
export const api = axios.create({ baseURL })

export function setToken(t) {
  api.defaults.headers.common['Authorization'] = t ? `Bearer ${t}` : ''
}
