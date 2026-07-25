import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HomeTab from './HomeTab'
import ProfileTab from './ProfileTab'

export default function Dashboard({
  setShowLanding,
  user,
  onLogout,
  token,
  onProfileUpdate,
  storiesList,
  onPlayStory
}) {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#EBEBF2] via-[#F5F5F7] to-[#E9EFF7] text-zinc-800 font-sans antialiased overflow-x-hidden relative selection:bg-[#E11D48]/15 selection:text-[#E11D48] flex flex-col md:flex-row">
      
      {/* Background decoration blur spheres (glassmorphism backdrops) */}
      <motion.div 
        animate={{ 
          x: [0, 80, -50, 0], 
          y: [0, -60, 40, 0],
          scale: [1, 1.08, 0.92, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 25, 
          ease: "easeInOut" 
        }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7C3AED]/8 rounded-full blur-3xl pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          x: [0, -90, 60, 0], 
          y: [0, 80, -40, 0],
          scale: [1, 0.92, 1.08, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 30, 
          ease: "easeInOut" 
        }}
        className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#EC4899]/8 rounded-full blur-3xl pointer-events-none" 
      />

      {/* SIDEBAR NAVIGATION (Desktop - Rendered with light theme glassmorphism) */}
      <aside className="hidden md:flex w-20 bg-white/70 backdrop-blur-xl border-r border-white/40 fixed inset-y-0 left-0 flex-col justify-between z-40 py-8 px-2 items-center shadow-md">
        
        {/* Logo (logo.png from public folder) */}
        <div 
          onClick={() => setShowLanding(true)}
          className="flex items-center justify-center select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        >
          <img src="/logo.png" className="w-11 h-11 object-contain rounded-xl bg-white/90 shadow-sm border border-white/50" alt="Logo" />
        </div>

        {/* Nav Items (Centered vertically using my-auto) */}
        <nav className="flex flex-col gap-6 w-full items-center my-auto">
          {[
            { 
              id: 'home', 
              label: 'HOME', 
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )
            }
          ].map(item => (
            <div key={item.id} className="relative w-full flex justify-center py-2">
              {/* Soft Active Highlight behind active item */}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTabBackdrop"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#E11D48]/8 rounded-2xl blur-md -z-10 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <motion.button
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center py-1 transition-all cursor-pointer z-10 ${
                  activeTab === item.id 
                    ? 'text-[#E11D48]' 
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-[11px] font-black tracking-widest mt-2">{item.label}</span>
              </motion.button>
            </div>
          ))}
        </nav>

        {/* Profile Card at bottom (with aura highlight when active) */}
        <div className="relative w-full flex justify-center py-2">
          {activeTab === 'profile' && (
            <motion.div 
              layoutId="activeTabBackdrop"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#E11D48]/8 rounded-2xl blur-md -z-10 pointer-events-none"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <motion.button 
            onClick={() => setActiveTab('profile')}
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center py-1 transition-all cursor-pointer z-10 ${
              activeTab === 'profile' ? 'text-[#E11D48]' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center text-white text-xs font-black shadow-sm border border-zinc-200">
              {user?.username ? user.username.substring(0, 1).toUpperCase() : 'A'}
            </div>
            <span className="text-[11px] font-black tracking-widest mt-2">PROFILE</span>
          </motion.button>
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <header className="md:hidden sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/40 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="w-8 h-8 object-contain rounded-lg bg-white/90 border border-white/50" alt="Logo" />
          <span className="text-sm font-black text-zinc-850 tracking-tight">StoryCast AI</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500">@{user.username}</span>
              <div 
                onClick={() => setActiveTab('profile')}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-t border-white/40 flex justify-around py-2.5 shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'profile', label: 'Settings', icon: '⚙️' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center text-xs font-black transition-all cursor-pointer ${
              activeTab === item.id ? 'text-[#E11D48] scale-105' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <span className="text-base mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col md:pl-20 pb-20 md:pb-0">
        
        {/* Top bar header (Desktop only - Styled like Pocket FM search and hello header in light mode) */}
        <header className="hidden md:flex h-24 bg-transparent px-8 items-center justify-between shrink-0 select-none">
          <div className="text-left">
            <span className="text-sm text-zinc-500 font-bold uppercase tracking-widest block">HELLO</span>
            <span className="text-[26px] font-black text-zinc-900 block mt-1 leading-tight">
              {user?.username ? user.username : 'Guest'}
            </span>
          </div>

          {/* Search bar (Solid, borderless light gray pill) */}
          <div className="relative w-[650px]">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for audio series, artists"
              className="w-full bg-zinc-200/40 border-none rounded-full pl-15 pr-6 py-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/30 transition-all font-semibold"
            />
          </div>

          <div className="flex items-center">
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-12 h-12 rounded-full bg-zinc-200/40 hover:bg-zinc-200/60 text-zinc-600 hover:text-zinc-900 flex items-center justify-center text-xl transition-all cursor-pointer border-none"
              title="Listening Language"
            >
              🌐
            </button>
          </div>
        </header>

        {/* Content Panel Area */}
        <main className="flex-1 p-4 sm:p-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              
              {/* TAB 1: Home Tab */}
              {activeTab === 'home' && (
                <HomeTab 
                  onPlayStory={onPlayStory}
                  user={user}
                  onTabChange={setActiveTab}
                  storiesList={storiesList}
                />
              )}

              {/* TAB 3: Profile Tab */}
              {activeTab === 'profile' && (
                <ProfileTab 
                  user={user}
                  token={token}
                  onProfileUpdate={onProfileUpdate}
                  onLogout={onLogout}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
