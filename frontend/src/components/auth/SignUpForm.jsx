import React from 'react'

export default function SignUpForm({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  language,
  setLanguage,
  onSubmit,
  onSwitchToSignIn
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Username</label>
        <input 
          type="text" 
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. quantum_reader"
          className="w-full bg-white/70 border border-black/5 hover:border-black/10 focus:border-[#7C3AED] focus:bg-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none shadow-sm placeholder-slate-400 text-slate-800"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
        <input 
          type="email" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. you@example.com"
          className="w-full bg-white/70 border border-black/5 hover:border-black/10 focus:border-[#7C3AED] focus:bg-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none shadow-sm placeholder-slate-400 text-slate-800"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Password (Min 6 chars)</label>
        <input 
          type="password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-white/70 border border-black/5 hover:border-black/10 focus:border-[#7C3AED] focus:bg-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none shadow-sm placeholder-slate-400 text-slate-800"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Preferred Language</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {['English', 'Hindi', 'Marathi', 'Bengali', 'Kannada', 'Tamil'].map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                language === lang 
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white border-transparent shadow-sm scale-105' 
                  : 'bg-white text-slate-650 border-black/5 hover:border-slate-350'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        {/* <input
          type="text"
          placeholder="Or type custom language..."
          value={!['English', 'Hindi', 'Marathi', 'Bengali', 'Kannada', 'Tamil'].includes(language) ? language : ''}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full bg-white/70 border border-black/5 hover:border-black/10 focus:border-[#7C3AED] focus:bg-white rounded-xl px-4 py-2.5 text-xs transition-all focus:outline-none shadow-sm placeholder-slate-400 text-slate-800"
        /> */}
      </div>

      <button 
        type="submit"
        className="w-full py-3.5 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#6D28D9] transition-all transform hover:-translate-y-0.5"
      >
        Next: Choose Interests
      </button>

      <div className="pt-4 text-center">
        <span className="text-xs text-slate-500">Already have an account? </span>
        <button 
          type="button"
          onClick={onSwitchToSignIn}
          className="text-xs font-bold text-[#7C3AED] hover:underline"
        >
          Sign In
        </button>
      </div>
    </form>
  )
}
