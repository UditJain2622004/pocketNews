import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NewsComparison() {
  const [activeFeature, setActiveFeature] = useState(0) // 0: audio recap, 1: choices, 2: explanation
  const [selectedMoat, setSelectedMoat] = useState(null)
  const [analogyRole, setAnalogyRole] = useState('finance')

  return (
    <section className="max-w-5xl mx-auto px-4 py-16 border-t border-slate-200 space-y-12 relative overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-gradient-to-br from-[#7C3AED]/5 to-[#EC4899]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center space-y-3 relative z-10">
        <span className="text-[9px] font-black text-[#7C3AED] uppercase tracking-widest bg-[#7C3AED]/5 px-2.5 py-0.5 rounded border border-[#7C3AED]/10 w-fit mx-auto block">
          Interactive Flip Cards
        </span>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1D1D1F]">
          Why Gen Z Doesn't Read Traditional News
        </h2>
        <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-sm leading-relaxed font-medium">
          Hover over each card to flip it and reveal the comparison between the old ways and the Pocket News experience.
        </p>
      </div>

      {/* Grid of 3D Flip Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative z-10 max-w-4xl mx-auto">
        
        {/* Card A: The Problem (Traditional News) */}
        <div className="group [perspective:1200px] min-h-[380px] w-full cursor-pointer">
          <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
            
            {/* Front Side: The Question */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between text-left shadow-sm group-hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100 w-fit block">
                  The Challenge
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight pt-4">
                  Why is traditional news losing the next generation?
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                  Traditional feeds are built on decade-old presentation habits.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold text-rose-500 tracking-wider uppercase">Hover to reveal answer</span>
                <span className="text-xl">➔</span>
              </div>
            </div>

            {/* Back Side: The Traditional Way details */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between text-left shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100">
                    The Old Way
                  </span>
                  <span className="w-6 h-6 rounded bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-[10px] border border-rose-100">
                    ✕
                  </span>
                </div>
                
                <h4 className="text-lg font-black text-slate-800 tracking-tight">Traditional Newspapers & Feeds</h4>
                
                <div className="border border-slate-200/80 p-4 rounded-xl space-y-2 bg-slate-50/50 text-left font-serif text-[10px] text-slate-400 leading-relaxed max-h-[120px] overflow-hidden relative shadow-sm">
                  <div className="font-sans font-bold text-slate-500 uppercase tracking-wider text-[8px] border-b border-slate-200/80 pb-1.5 mb-1.5 flex justify-between">
                    <span>The Daily Gazette</span>
                    <span>Oct 24, 2026</span>
                  </div>
                  <p className="font-bold text-slate-700 text-[10.5px] leading-tight font-sans">
                    REGULATORY REPORT ON SEMICONDUCTOR LITHOGRAPHY EXPORTS AND COMPLIANCE MOATS
                  </p>
                  <p className="text-[9px] line-clamp-2">
                    In an official corporate disclosure released on Thursday afternoon, major hardware fabrication vendors announced compliance guidelines concerning EUV light source...
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-3 text-xs text-slate-655 font-bold">
                    <span className="text-rose-500 font-black text-sm">✕</span>
                    <span>Hours of dry, technical articles and monolithic text columns</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-655 font-bold">
                    <span className="text-rose-550 font-black text-sm">✕</span>
                    <span>Zero background context to explain complex names and details</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-655 font-bold">
                    <span className="text-rose-550 font-black text-sm">✕</span>
                    <span>Purely passive consumption (dull and unengaging)</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="text-xs font-black text-rose-500 uppercase tracking-wide">Result:</span>
                <span className="text-xs font-bold text-slate-600">2-minute average attention drop-off</span>
              </div>
            </div>

          </div>
        </div>

        {/* Card B: The Solution (Pocket News) */}
        <div className="group [perspective:1200px] min-h-[380px] w-full cursor-pointer">
          <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
            
            {/* Front Side: The Question */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white border border-[#7C3AED]/20 rounded-3xl p-8 flex flex-col justify-between text-left shadow-sm group-hover:shadow-[0_15px_40px_-15px_rgba(124,58,237,0.1)] transition-all duration-300">
              <div className="space-y-4">
                <span className="text-[9px] font-black text-[#7C3AED] uppercase tracking-widest bg-[#7C3AED]/5 px-2.5 py-0.5 rounded border border-[#7C3AED]/10 w-fit block">
                  The Innovation
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight pt-4">
                  How does Pocket News make reading addictive?
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                  We turn text articles into immersive, personalized audio visual games.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold text-[#7C3AED] tracking-wider uppercase">Hover to reveal answer</span>
                <span className="text-xl">➔</span>
              </div>
            </div>

            {/* Back Side: The Pocket News Way details */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border border-[#7C3AED]/20 rounded-3xl p-6 flex flex-col justify-between text-left shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-[#7C3AED] uppercase tracking-widest bg-[#7C3AED]/5 px-2.5 py-0.5 rounded border border-[#7C3AED]/10">
                    The Pocket News Way
                  </span>
                  <span className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px] border border-emerald-100">
                    ✓
                  </span>
                </div>
                
                <h4 className="text-lg font-black text-slate-800 tracking-tight">Cinematic Episodic Feeds</h4>
                
                {/* Dynamic Visual Mockup Showcase */}
                <div className="min-h-[100px] bg-slate-50/50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-center items-stretch relative overflow-hidden shadow-inner">
                  <AnimatePresence mode="wait">
                    {activeFeature === 0 && (
                      <motion.div 
                        key="podcast"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-3 bg-white border border-[#7C3AED]/15 p-3 rounded-lg shadow-sm text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-base shadow-sm">
                          🎙️
                        </div>
                        <div className="flex-1 space-y-1">
                          <span className="block text-[10px] font-black text-slate-900 uppercase tracking-wider">The Silicon Wars</span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] text-[#EC4899] font-bold">30s Audio Recap</span>
                            <span className="text-[7px] text-slate-400 font-bold">0:14 / 0:30</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeFeature === 1 && (
                      <motion.div 
                        key="choices"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-1.5 text-left"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black uppercase text-pink-650 tracking-wider">Interactive Choice Node</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-bold">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedMoat('A') }}
                            className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                              selectedMoat === 'A' 
                                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {selectedMoat === 'A' ? 'Invested (72%)' : 'Invest in ASML'}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedMoat('B') }}
                            className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                              selectedMoat === 'B' 
                                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {selectedMoat === 'B' ? 'Declined (28%)' : 'Bypass Tech'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeFeature === 2 && (
                      <motion.div 
                        key="analogy"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-1 text-left"
                      >
                        <div className="flex justify-between items-center border-b border-slate-200/60 pb-1">
                          <span className="text-[8px] font-black uppercase text-amber-650 tracking-wider">Profession Filter</span>
                          <div className="flex gap-1">
                            {['finance', 'tech'].map((r) => (
                              <button
                                key={r}
                                onClick={(e) => { e.stopPropagation(); setAnalogyRole(r) }}
                                className={`px-1 py-0.5 rounded text-[7px] font-black uppercase border-none cursor-pointer ${
                                  analogyRole === r ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-[9.5px] font-bold text-slate-700 leading-normal">
                          {analogyRole === 'finance' 
                            ? '📈 "EUV is a supply-chain bottleneck holding up tech index funds."'
                            : '💻 "EUV is a high-res stencil printing circuits smaller than a virus."'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Compact Benefit Selector List */}
                <div className="space-y-1 pt-1">
                  {[
                    { id: 0, label: "30-second immersive audio/video summaries" },
                    { id: 1, label: "Interactive choices and quizzes" },
                    { id: 2, label: "Custom explanations tailored to your career" }
                  ].map((item) => (
                    <div 
                      key={item.id}
                      onMouseEnter={(e) => { e.stopPropagation(); setActiveFeature(item.id) }}
                      onClick={(e) => { e.stopPropagation(); setActiveFeature(item.id) }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                        activeFeature === item.id 
                          ? 'bg-slate-50 border-[#7C3AED]/20 shadow-sm' 
                          : 'border-transparent hover:bg-slate-50/30'
                      }`}
                    >
                      <span className={`font-black text-xs ${activeFeature === item.id ? 'text-[#7C3AED]' : 'text-emerald-500'}`}>✓</span>
                      <span className={`text-[11.5px] font-bold ${activeFeature === item.id ? 'text-slate-900' : 'text-slate-655'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="text-xs font-black text-emerald-650 uppercase tracking-wide">Result:</span>
                <span className="text-xs font-bold text-slate-655">95% story completion rates</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
