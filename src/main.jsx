
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './pages/App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Results from './pages/Results.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Saved from './pages/Saved.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider><BrowserRouter>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/results' element={<Results />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/saved' element={<Saved />} />
    </Routes>
  </BrowserRouter></AuthProvider>
)
