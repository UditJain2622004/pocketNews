import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const slideUpItem = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24
    }
  }
}

export default function HomeTab({ onPlayStory, user, onTabChange, storiesList = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStoryIdx, setActiveStoryIdx] = useState(0)

  // Autoplay carousel slide rotation every 6 seconds
  useEffect(() => {
    if (!storiesList || storiesList.length <= 1) return

    const timer = setTimeout(() => {
      setActiveStoryIdx(prev => (prev + 1) % storiesList.length)
    }, 6000)

    return () => clearTimeout(timer)
  }, [activeStoryIdx, storiesList])

  const handleNextStory = () => {
    setActiveStoryIdx(prev => (prev + 1) % storiesList.length)
  }

  const handlePrevStory = () => {
    setActiveStoryIdx(prev => (prev - 1 + storiesList.length) % storiesList.length)
  }

  const featuredDrama = storiesList[activeStoryIdx] || {}

  const filteredDramas = (storiesList || []).filter(d => {
    return d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           d.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const renderNewsRow = (title, dramas) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-black text-zinc-950 tracking-wide uppercase">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dramas.map((drama, idx) => (
            <motion.div 
              key={drama.id} 
              onClick={() => onPlayStory(drama.id)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.97 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 18,
                opacity: { duration: 0.2, delay: idx * 0.04 }
              }}
              className="relative aspect-[3/2] rounded-2xl bg-zinc-900 overflow-hidden cursor-pointer shadow-lg border border-zinc-200/80 hover:border-zinc-400 group z-10 hover:z-20"
            >
              {/* Shimmer sweep reflection on hover */}
              <div className="shimmer-shine" />

              {/* Graphical Poster Background */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={drama.videoFrames && drama.videoFrames[0] ? drama.videoFrames[0] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  alt={drama.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 z-10" />
              </div>

              {/* Card Details Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-20">
                
                {/* Top red play statistics badge */}
                <div className="self-end">
                  <span className="px-2.5 py-1 rounded-md bg-[#EF4444] text-white text-xs font-black tracking-wider flex items-center gap-1">
                    {drama.date || '25-07-2026'} <span className="text-[9px]">⏵</span>
                  </span>
                </div>

                {/* Bottom title display inside poster */}
                <div className="text-left space-y-1">
                  <span className="px-2.5 py-0.5 rounded bg-black/35 text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-sm inline-block">
                    {drama.category}
                  </span>
                  {/* {drama.date && <p className="text-[10px] font-bold text-zinc-200/90 tracking-wide">{drama.date}</p>} */}
                  <h3 className="text-base font-black text-white tracking-wide uppercase leading-tight drop-shadow-md">
                    {drama.title.split(':')[0]}
                  </h3>
                  <p className="text-[11px] font-bold text-zinc-200/90 truncate tracking-wide">
                    {drama.topic}
                  </p>
                </div>
              </div>

              {/* Hover overlay play icon */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <span className="text-base pl-0.5">▶</span>
                </div>
              </div>
            </motion.div>
          ))}

          {dramas.length === 0 && (
            <div className="col-span-full py-8 text-center bg-[#121214] border border-dashed border-[#27272A] rounded-2xl text-xs text-zinc-500 font-semibold">
              No shows available.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-2 text-zinc-800 text-left bg-transparent">
      
      {/* Featured Banner (Hero Section styled exactly like Pocket FM screenshot in light mode) */}
      {featuredDrama.id && (
        <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-md border border-white/50 shadow-md min-h-[380px] flex items-center group w-full">
          {/* Main Layout Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStoryIdx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-12 w-full h-full relative z-20"
            >
            
            {/* Left side text column */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="md:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-5"
            >
              
              {/* Badges row */}
              <motion.div variants={slideUpItem} className="flex flex-wrap items-center gap-3">
                <span className="text-yellow-600 font-extrabold text-xs uppercase tracking-wider">
                  {featuredDrama.plays || '391M'} Plays
                </span>
                <span className="text-zinc-400 text-xs">•</span>
                <span className="bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded text-xs font-black text-zinc-700">
                  ★ {featuredDrama.rating || '4.9'}
                </span>
                <span className="text-zinc-400 text-xs">•</span>
                <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">
                  {featuredDrama.category || 'DRAMA'}
                </span>
                <span className="text-zinc-400 text-xs">•</span>
                <span className="bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded text-xs font-black text-zinc-650">
                  U/A 13+
                </span>
              </motion.div>

              {/* Title Block */}
              <motion.div variants={slideUpItem} className="space-y-1">
                <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-widest uppercase leading-none drop-shadow-sm">
                  {featuredDrama.title.split(':')[0]}
                </h1>
                <p className="text-base font-bold text-[#F43F5E] tracking-wider uppercase">
                  {featuredDrama.topic}
                </p>
              </motion.div>

              {/* Description */}
              <motion.p variants={slideUpItem} className="text-zinc-600 text-sm leading-relaxed max-w-md font-medium">
                {featuredDrama.summary}
              </motion.p>

              {/* Play & Info Buttons */}
              <motion.div variants={slideUpItem} className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  onClick={() => onPlayStory(featuredDrama.id)}
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(225, 29, 72, 0.5)" }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="px-8 py-3 bg-[#E11D48] hover:bg-[#F43F5E] text-white text-sm font-black rounded-full uppercase tracking-wider shadow-md cursor-pointer border-none"
                >
                  Play Now
                </motion.button>
                <motion.button 
                  onClick={() => onPlayStory(featuredDrama.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="px-6 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-250 text-zinc-700 hover:text-zinc-900 text-sm font-black rounded-full uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  More Info
                </motion.button>
              </motion.div>

              {/* Sub-label tags */}
              <motion.div variants={slideUpItem} className="text-xs text-zinc-450 font-bold uppercase tracking-wider mt-2 space-y-0.5">
                <span className="block text-zinc-500">Season: {featuredDrama.season}</span>
                <span className="block text-zinc-500">Narrator: Sherlock AI & Cyberpunk DJ</span>
              </motion.div>
            </motion.div>

            {/* Right side graphical representation / cover */}
            <div className="md:col-span-6 relative overflow-hidden min-h-[340px] md:min-h-full bg-zinc-950">
              <img 
                src={featuredDrama.videoFrames && featuredDrama.videoFrames[1] ? featuredDrama.videoFrames[1] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} 
                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-[8000ms] group-hover:scale-108" 
                alt="Banner Art"
              />
              {/* Radial gradient mask to blend with left page */}
              <div className="absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-white via-white/80 to-transparent z-10 hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent z-10" />

              {/* High-fidelity watermark display of story categories */}
              <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center z-0 select-none">
                <span className="text-[100px] font-black text-black/5 uppercase leading-none tracking-tighter select-none">
                  {featuredDrama.tag}
                </span>
                <span className="text-xs font-bold text-black/10 uppercase tracking-widest mt-2 select-none">
                  StoryCast Original Broadcast
                </span>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

          {/* Carousel Navigator Controls */}
          {/* <div className="absolute bottom-6 right-6 sm:right-16 flex items-center gap-3.5 z-30">
            <button 
              onClick={handlePrevStory}
              className="w-8 h-8 rounded-full bg-white/75 hover:bg-white border border-zinc-300 text-zinc-700 flex items-center justify-center text-xs transition-all cursor-pointer shadow-md"
            >
              ⟨
            </button>
            
            <div className="flex gap-2 items-center">
              {storiesList.map((story, idx) => (
                <div 
                  key={story.id} 
                  onClick={() => setActiveStoryIdx(idx)}
                  className={`w-14 h-10 rounded-lg bg-gradient-to-br ${story.color} cursor-pointer transition-all overflow-hidden relative shrink-0 ${
                    idx === activeStoryIdx 
                      ? 'border-2 border-[#E11D48] scale-105 shadow-md' 
                      : 'border border-zinc-350 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center p-1">
                    <span className="text-[9px] font-black text-white uppercase tracking-wider text-center line-clamp-2">
                      {story.title.split(':')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleNextStory}
              className="w-8 h-8 rounded-full bg-white/75 hover:bg-white border border-zinc-300 text-zinc-700 flex items-center justify-center text-xs transition-all cursor-pointer shadow-md"
            >
              ⟩
            </button>
          </div> */}
        </div>
      )}

      {/* Main Show Cards Rows */}
      <div className="space-y-12">
        {renderNewsRow(user ? 'Daily episodes' : 'Available episodes', filteredDramas)}
      </div>

      {/* Quick Stats section */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <motion.div 
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 flex items-center gap-3 shadow-md cursor-pointer"
        >
          <motion.div whileHover={{ scale: 1.25, rotate: 10 }} className="text-xl select-none">🎙️</motion.div>
          <div>
            <span className="block text-xs font-black text-zinc-400 uppercase tracking-widest">Top Voice Cast</span>
            <span className="block text-sm font-bold text-zinc-700 mt-0.5">Sherlock AI, Neo-V, Sammy Sarcasm</span>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 flex items-center gap-3 shadow-md cursor-pointer"
        >
          <motion.div whileHover={{ scale: 1.25, rotate: 10 }} className="text-xl select-none">⚡</motion.div>
          <div>
            <span className="block text-xs font-black text-zinc-400 uppercase tracking-widest">Daily Updates</span>
            <span className="block text-sm font-bold text-zinc-700 mt-0.5">Fresh cinematic news every morning</span>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 flex items-center gap-3 shadow-md cursor-pointer"
        >
          <motion.div whileHover={{ scale: 1.25, rotate: 10 }} className="text-xl select-none">🎧</motion.div>
          <div>
            <span className="block text-xs font-black text-zinc-400 uppercase tracking-widest">Audio Quality</span>
            <span className="block text-sm font-bold text-zinc-700 mt-0.5">Lossless Dolby Atmos Simulation</span>
          </div>
        </motion.div>
      </div> */}

    </div>
  )
}
