import React from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

export default function Hero({ onEnterApp, heroMorphStep, setHeroMorphStep }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Map mouse positions to 3D rotation and translation offsets
  const rotateX = useTransform(mouseY, [-280, 280], [12, -12])
  const rotateY = useTransform(mouseX, [-144, 144], [-12, 12])
  const moveX = useTransform(mouseX, [-144, 144], [-20, 20])
  const moveY = useTransform(mouseY, [-280, 280], [-20, 20])

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const xVal = event.clientX - rect.left - rect.width / 2
    const yVal = event.clientY - rect.top - rect.height / 2
    mouseX.set(xVal)
    mouseY.set(yVal)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div>
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative">
        
        {/* Left Text Column */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8 text-left z-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/85 border border-slate-200/50 shadow-sm text-xs font-bold text-slate-700 backdrop-blur-md w-fit"
          >
            <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
            <span>AI-Native News Engine</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Interactive Podcasts</span>
          </motion.div>

          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.08] text-[#1D1D1F]">
            Stop Reading News.<br />
            Start <span className="bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F97316] bg-clip-text text-transparent">Living the Story.</span>
          </h1>

          <p className="text-slate-600 text-lg sm:text-xl max-w-xl leading-relaxed">
            Pocket News transforms today's dry headlines into personalized, cinematic podcasts and interactive experiences you will actually enjoy consuming.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <motion.button 
              onClick={onEnterApp}
              whileHover={{ scale: 1.02, y: -1, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.25)" }}
              whileTap={{ scale: 0.98 }}
              className="px-7 py-3.5 rounded-xl text-xs font-semibold tracking-widest uppercase bg-slate-950 text-white border border-white/10 hover:bg-black transition-all flex items-center gap-2.5 cursor-pointer shadow-lg shadow-black/10"
            >
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM19.006 8.507L18.5 12l-.507-3.493L14.5 8l3.493-.507L18.5 4l.507 3.493L22.5 8l-3.493.507z" />
              </svg>
              Try Today's Story
            </motion.button>
            <motion.a 
              href="#demo"
              whileHover={{ scale: 1.02, y: -1, bg: "rgba(248, 250, 252, 0.8)" }}
              whileTap={{ scale: 0.98 }}
              className="px-7 py-3.5 rounded-xl text-xs font-semibold tracking-widest uppercase bg-white border border-slate-200/80 hover:border-slate-350 text-slate-700 transition-all flex items-center gap-2.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Demo
            </motion.a>
          </div>
        </motion.div>

        {/* Right Floating Phone Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1000 }}
          className="flex justify-center relative z-10 animate-float"
        >
          <motion.div 
            style={{ 
              rotateX, 
              rotateY, 
              x: moveX, 
              y: moveY,
              transformStyle: "preserve-3d"
            }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="w-72 h-[560px] rounded-[42px] border-[6px] border-[#D2D2D7] bg-[#09090B] shadow-2xl relative overflow-hidden text-left"
          >
            {/* Phone Camera Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#D2D2D7] rounded-full z-20" />
            
            {/* Inside Mockup */}
            <div className="p-5 pt-8 space-y-5 flex flex-col justify-between h-full text-left">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded uppercase">Today's Episode</span>
                <h3 className="text-xl font-bold text-white leading-tight">The AI Chip Monopoly Crisis</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-3">
                  Deep inside Carl Zeiss lab, engineers manipulate wavelengths at 13.5 nanometers. A quiet export ban has frozen global technology pipelines...
                </p>
              </div>

              {/* Simulated Audio Card */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-3 space-y-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>🎙️ AI Detective Vance</span>
                  <span>1:12 / 2:43</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-[#7C3AED] h-1 rounded-full w-[45%]" />
                </div>
                <div className="flex justify-center items-end gap-[2px] h-6 py-0.5">
                  {Array.from({ length: 22 }).map((_, i) => (
                    <span key={i} className="w-1 bg-[#7C3AED] rounded-full" style={{ height: `${Math.sin(i * 0.4) * 12 + 14}px` }} />
                  ))}
                </div>
              </div>

              {/* Interactive Poll */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-350">Will ASML's Monopoly Break?</span>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold">
                  <div className="bg-[#7C3AED]/20 border border-[#7C3AED]/40 p-1.5 rounded-lg text-center text-white">Yes (64%)</div>
                  <div className="bg-[#18181B] border border-white/5 p-1.5 rounded-lg text-center text-slate-400">No (36%)</div>
                </div>
              </div>

              <button 
                onClick={onEnterApp}
                className="w-full py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 rounded-xl text-center text-xs font-bold text-white shadow-md border-none cursor-pointer"
              >
                Continue Story
              </button>
            </div>
          </motion.div>
          <div className="absolute -inset-10 bg-gradient-to-tr from-[#7C3AED]/10 to-[#EC4899]/10 rounded-full blur-2xl opacity-40 animate-pulse-slow pointer-events-none" />
        </motion.div>
      </header>

      {/* Morphing Concept */}
      <section className="max-w-7xl mx-auto px-4 pb-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-sm backdrop-blur-md"
        >
          <div className="absolute top-0 left-0 px-4 py-1 bg-[#7C3AED] text-white text-[9px] font-bold uppercase tracking-wider rounded-br-2xl">
            Live Translation Engine Concept
          </div>

          <div className="min-h-[140px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroMorphStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full"
              >
                {heroMorphStep === 0 && (
                  <div className="space-y-4 py-6">
                    <span className="text-[#EF4444] text-xs font-bold uppercase tracking-widest block">📰 Breaking News Headline</span>
                    <h3 className="text-xl sm:text-2xl font-mono text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-250 max-w-2xl mx-auto italic leading-relaxed">
                      "NVIDIA Corporation today announced the shipping details of its new Blackwell architecture AI chips."
                    </h3>
                  </div>
                )}

                {heroMorphStep === 1 && (
                  <div className="space-y-4 py-6">
                    <span className="text-[#EC4899] text-xs font-bold uppercase tracking-widest block">🎬 Cinematic Story Adaption</span>
                    <p className="text-slate-800 text-lg sm:text-xl font-bold max-w-2xl mx-auto leading-relaxed">
                      "It began with a quiet announcement from a small tech pressroom... Within hours, every major AI laboratory in the world was racing to secure their share of the silicon future."
                    </p>
                  </div>
                )}

                {heroMorphStep === 2 && (
                  <div className="space-y-4 py-6 flex flex-col items-center">
                    <span className="text-[#10B981] text-xs font-bold uppercase tracking-widest block">🎙️ AI Narrator & Video Rendered</span>
                    <div className="flex items-center gap-3 bg-[#7C3AED]/5 border border-[#7C3AED]/15 px-4 py-2 rounded-xl text-xs text-[#7C3AED] font-semibold mt-3">
                      <span className="flex gap-1 h-3 items-end">
                        <span className="w-0.5 bg-[#7C3AED] animate-wave-1 h-3" />
                        <span className="w-0.5 bg-[#7C3AED] animate-wave-2 h-3" />
                        <span className="w-0.5 bg-[#7C3AED] animate-wave-3 h-3" />
                      </span>
                      <span>Audio Playing: Vance (AI Detective)</span>
                    </div>
                    <p className="text-slate-655 text-sm max-w-md mt-3 font-medium">
                      "The silicon trade isn't just about graphics cards anymore. It's the new battleground for global intelligence."
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <button 
              onClick={() => setHeroMorphStep?.(0)} 
              className={`w-2.5 h-2.5 rounded-full transition-all border-none p-0 cursor-pointer ${heroMorphStep === 0 ? 'bg-[#7C3AED] scale-120 shadow-sm' : 'bg-slate-250 hover:bg-slate-350'}`}
              aria-label="Slide 1"
            />
            <button 
              onClick={() => setHeroMorphStep?.(1)} 
              className={`w-2.5 h-2.5 rounded-full transition-all border-none p-0 cursor-pointer ${heroMorphStep === 1 ? 'bg-[#7C3AED] scale-120 shadow-sm' : 'bg-slate-250 hover:bg-slate-350'}`}
              aria-label="Slide 2"
            />
            <button 
              onClick={() => setHeroMorphStep?.(2)} 
              className={`w-2.5 h-2.5 rounded-full transition-all border-none p-0 cursor-pointer ${heroMorphStep === 2 ? 'bg-[#7C3AED] scale-120 shadow-sm' : 'bg-slate-250 hover:bg-slate-350'}`}
              aria-label="Slide 3"
            />
          </div>
        </motion.div>
      </section>
    </div>
  )
}
