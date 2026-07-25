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
          ? 'backdrop-blur-md bg-white/75 border-b border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] h-16' 
          : 'bg-transparent h-24'
      }`}>
        <div className="flex items-center gap-4">
          <div className="relative group select-none">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            <img 
              src="/logo.png" 
              className={`relative object-contain rounded-xl bg-white shadow-sm transition-all duration-300 ${
                isScrolled ? 'w-10 h-10' : 'w-16 h-16'
              }`} 
              alt="StoryCast AI Logo" 
            />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">StoryCast AI</span>
            <span className="block text-[8px] sm:text-[9px] text-[#7C3AED] font-extrabold tracking-widest uppercase">Cinematic News Engine</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-extrabold tracking-wide uppercase text-slate-600">
          <a href="#features" className="hover:bg-slate-100 hover:text-[#7C3AED] px-4 py-2 rounded-xl transition-all">Features</a>
          <a href="#storytellers" className="hover:bg-slate-100 hover:text-[#7C3AED] px-4 py-2 rounded-xl transition-all">Storytellers</a>
          <a href="#graph" className="hover:bg-slate-100 hover:text-[#7C3AED] px-4 py-2 rounded-xl transition-all">Universe</a>
          <a href="#stats" className="hover:bg-slate-100 hover:text-[#7C3AED] px-4 py-2 rounded-xl transition-all">Stats</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-white/80 border border-slate-200/80 pl-3 pr-2 py-1 rounded-2xl shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04)] backdrop-blur-sm">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-slate-800">@{user.username}</span>
              </div>
              <button 
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-bold text-rose-650 hover:text-white bg-rose-50 hover:bg-rose-550 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-rose-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button 
            onClick={onEnterApp}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 text-white transition-all shadow-md shadow-[#7C3AED]/20 hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Enter StoryCast
          </button>
        </div>
      </nav>
    </div>
  )
}
