import React, { useState, useEffect } from 'react'

export default function Navbar({ onEnterApp, user, onLoginClick, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all">
      <nav className={`w-full px-8 md:px-12 flex items-center justify-between transition-all duration-300 ${
        isScrolled 
          ? 'pure-glass h-16 shadow-md border-b border-black/5' 
          : 'bg-transparent h-24'
      }`}>
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" 
            className={`object-contain rounded-xl transition-all duration-300 ${
              isScrolled ? 'w-12 h-12' : 'w-20 h-20'
            }`} 
            alt="StoryCast AI Logo" 
          />
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-800">StoryCast AI</span>
            <span className="block text-[9px] text-[#7C3AED] font-bold tracking-widest uppercase">Cinematic News Engine</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm font-bold text-slate-700">
          <a href="#features" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Features</a>
          <a href="#storytellers" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Storytellers</a>
          <a href="#graph" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Connected Universe</a>
          <a href="#stats" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Live Stats</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-xs">
                <span className="font-bold text-slate-800">@{user.username}</span>
                <span className="text-[10px] text-slate-500 font-semibold">{user.topics?.length || 0} interests selected</span>
              </div>
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-xs font-bold border border-black/10 hover:border-black/20 text-slate-700 bg-white/50 hover:bg-white rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/40 rounded-xl transition-all"
            >
              Sign In
            </button>
          )}

          <button 
            onClick={onEnterApp}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 text-white transition-all shadow shadow-[#7C3AED]/20 hover:scale-105 active:scale-95"
          >
            Enter StoryCast
          </button>
        </div>
      </nav>
    </div>
  )
}
