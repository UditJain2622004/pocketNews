import React from 'react'

export default function LoginForm({ 
  username, 
  setUsername, 
  password, 
  setPassword, 
  onSubmit, 
  loading, 
  onSwitchToSignUp 
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Username or Email</label>
        <input 
          type="text" 
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. sherlock_ai or user@example.com"
          className="w-full bg-white/70 border border-black/5 hover:border-black/10 focus:border-[#7C3AED] focus:bg-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none shadow-sm placeholder-slate-400 text-slate-800"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
        <input 
          type="password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-white/70 border border-black/5 hover:border-black/10 focus:border-[#7C3AED] focus:bg-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none shadow-sm placeholder-slate-400 text-slate-800"
        />
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
      >
        {loading ? 'Authenticating...' : 'Sign In'}
      </button>

      <div className="pt-4 text-center">
        <span className="text-xs text-slate-500">Don't have an account? </span>
        <button 
          type="button"
          onClick={onSwitchToSignUp}
          className="text-xs font-bold text-[#7C3AED] hover:underline"
        >
          Sign Up
        </button>
      </div>
    </form>
  )
}
