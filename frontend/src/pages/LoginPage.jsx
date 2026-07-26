import React, { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import { API_BASE } from '../api'

export default function LoginPage({ onLoginSuccess, onCancel, onSwitchToSignUp }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_or_email: username,
          password
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed. Please check your credentials.')
      }

      setSuccessMsg('Logged in successfully!')
      setTimeout(() => {
        onLoginSuccess(data.access_token)
      }, 1000)

    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 relative selection:bg-[#7C3AED]/20 selection:text-slate-900 overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#7C3AED]/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#EC4899]/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      
      {/* Back button */}
      <button 
        onClick={onCancel}
        className="absolute top-6 left-6 text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 font-bold text-sm bg-white/80 border border-black/5 px-4 py-2 rounded-xl shadow-sm z-10"
      >
        ← Back to Pocket News
      </button>

      {/* Main Glass Card */}
      <div className="w-full max-w-lg glass-panel rounded-3xl shadow-xl border border-white/60 p-8 sm:p-10 relative z-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" className="w-16 h-16 object-contain rounded-2xl mb-3" alt="Logo" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 text-center">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 text-center">
            Access your cinematic news pipeline and custom narrators
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200/50 rounded-2xl text-xs sm:text-sm font-semibold text-red-600 flex items-center gap-2">
            <span className="text-base">⚠️</span> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/50 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <span className="text-base">✅</span> {successMsg}
          </div>
        )}

        <LoginForm 
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          onSubmit={handleLoginSubmit}
          loading={loading}
          onSwitchToSignUp={onSwitchToSignUp}
        />
      </div>
    </div>
  )
}
