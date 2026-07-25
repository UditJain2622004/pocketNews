import React from 'react'

export default function Navbar({ onEnterApp }) {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4">
      <nav className="max-w-7xl mx-auto pure-glass rounded-2xl px-6 h-16 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <svg className="w-9 h-9 shadow-sm shadow-[#7C3AED]/25 rounded-xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nav-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="26" fill="url(#nav-logo-grad)" />
            <path d="M38 32 L68 50 L38 68 Z" fill="#ffffff" />
            <path d="M72 38 A 20 20 0 0 1 72 62" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
          </svg>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-800">StoryCast AI</span>
            <span className="block text-[8px] text-[#7C3AED] font-bold tracking-widest uppercase">Cinematic News Engine</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm font-bold text-slate-700">
          <a href="#features" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Features</a>
          <a href="#storytellers" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Storytellers</a>
          <a href="#graph" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Connected Universe</a>
          <a href="#stats" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Live Stats</a>
        </div>

        <button 
          onClick={onEnterApp}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 text-white transition-all shadow shadow-[#7C3AED]/20 hover:scale-105 active:scale-95"
        >
          Enter StoryCast
        </button>
      </nav>
    </div>
  )
}
