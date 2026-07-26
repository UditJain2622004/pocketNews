import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FeaturesGrid() {
  const [startIndex, setStartIndex] = useState(0)

  // Interactive states for widgets inside cards
  const [selectedPoll, setSelectedPoll] = useState(null)
  const [profession, setProfession] = useState('engineer') // engineer, finance
  const [activeTeller, setActiveTeller] = useState('detective') // detective, professor, anime
  const [hoveredNode, setHoveredNode] = useState(null)

  const allFeatures = [
    {
      id: 'podcasts',
      icon: '🎙️',
      colorBg: 'bg-violet-500/10',
      colorText: 'text-violet-650',
      glowColor: 'group-hover:shadow-[0_20px_50px_-10px_rgba(124,58,237,0.18)] group-hover:border-violet-300/60',
      title: 'AI Podcasts',
      desc: 'Listen to cinematic voice streams loaded with matching ambient audio, soundscapes, and expressive actors.',
      widget: (
        <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4 mt-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs shadow-sm font-bold">▶</span>
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase text-slate-800 tracking-wide">Vance Podcast</span>
              <span className="block text-[8px] text-slate-455 font-bold">1:12 / 2:43</span>
            </div>
          </div>
          <div className="flex gap-0.5 h-6 items-end">
            <span className="w-[3px] bg-violet-600 animate-wave-1 h-3 rounded-full" />
            <span className="w-[3px] bg-violet-600 animate-wave-2 h-6 rounded-full" />
            <span className="w-[3px] bg-violet-500 animate-wave-3 h-4 rounded-full" />
            <span className="w-[3px] bg-violet-600 animate-wave-4 h-5 rounded-full" />
            <span className="w-[3px] bg-violet-500 animate-wave-1 h-3 rounded-full" />
          </div>
        </div>
      )
    },
    {
      id: 'videos',
      icon: '🎥',
      colorBg: 'bg-blue-500/10',
      colorText: 'text-blue-650',
      glowColor: 'group-hover:shadow-[0_20px_50px_-10px_rgba(37,99,235,0.18)] group-hover:border-blue-300/60',
      title: 'AI Videos',
      desc: 'Prefer visual cues? Switch to short vertical videos filled with dynamic imagery, captions, and deep beats.',
      widget: (
        <div className="w-full aspect-[2/1] rounded-2xl bg-zinc-950 border border-zinc-800/80 relative overflow-hidden flex flex-col justify-end p-3 shadow-md mt-4">
          <img 
            src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=250"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt="Video Preview"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm text-white flex items-center justify-center text-xs cursor-pointer hover:scale-110 active:scale-95 transition-all z-20 shadow-md">
            ▶
          </div>
          <div className="text-left z-20 space-y-1">
            <span className="px-1.5 py-0.5 bg-blue-600 text-[7px] text-white font-black uppercase rounded tracking-wider">Visual Deck Active</span>
            <p className="text-[9px] font-bold text-slate-100 line-clamp-1 leading-none">ASML's extreme ultraviolet technology...</p>
          </div>
        </div>
      )
    },
    {
      id: 'choices',
      icon: '🎮',
      colorBg: 'bg-pink-500/10',
      colorText: 'text-pink-650',
      glowColor: 'group-hover:shadow-[0_20px_50px_-10px_rgba(236,72,153,0.18)] group-hover:border-pink-300/60',
      title: 'Interactive Choices',
      desc: 'Choose path direction, predict financial outcomes, and discover how events shift based on user choices.',
      widget: (
        <div className="w-full space-y-2 mt-4 text-left">
          <span className="text-[9px] font-black uppercase text-pink-600 tracking-wider">Live Simulation Poll</span>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
            <button 
              onClick={() => setSelectedPoll('A')} 
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                selectedPoll === 'A' 
                  ? 'bg-pink-500 text-white border-pink-500 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {selectedPoll === 'A' ? 'Invested (64%)' : 'Moat Buyout'}
            </button>
            <button 
              onClick={() => setSelectedPoll('B')} 
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                selectedPoll === 'B' 
                  ? 'bg-pink-500 text-white border-pink-500 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {selectedPoll === 'B' ? 'Declined (36%)' : 'Fund Nanoimprint'}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'memory',
      icon: '🧠',
      colorBg: 'bg-orange-500/10',
      colorText: 'text-orange-650',
      glowColor: 'group-hover:shadow-[0_20px_50px_-10px_rgba(249,115,22,0.18)] group-hover:border-orange-300/60',
      title: 'Tailored Memory',
      desc: 'The engine tracks your interest profiles and structures explanations with analogies based on your profession.',
      widget: (
        <div className="w-full space-y-2.5 mt-4 text-left p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
            <span className="text-[9px] font-black uppercase text-orange-600 tracking-wider">Explanation Analogy</span>
            <div className="flex gap-1">
              {['engineer', 'finance'].map((prof) => (
                <button
                  key={prof}
                  onClick={() => setProfession(prof)}
                  className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase cursor-pointer border-none ${
                    profession === prof ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {prof}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[9.5px] font-bold text-slate-700 leading-normal">
            {profession === 'engineer' 
              ? '💡 "EUV is like building a stencil so fine that you print circuits with light waves smaller than a virus."'
              : '📈 "EUV represents a supply-chain bottleneck where a single company owns 100% market control over global AI production."'}
          </p>
        </div>
      )
    },
    {
      id: 'storytellers',
      icon: '🎭',
      colorBg: 'bg-emerald-500/10',
      colorText: 'text-emerald-650',
      glowColor: 'group-hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.18)] group-hover:border-emerald-300/60',
      title: 'AI Storytellers',
      desc: 'Toggle between Sherlock Holmes, a university professor, a comic presenter, or a cyberpunk futurist instantly.',
      widget: (
        <div className="w-full space-y-2.5 mt-4 text-left">
          <div className="flex gap-1.5 justify-start">
            {[
              { id: 'detective', name: '🕵️‍♂️' },
              { id: 'professor', name: '🎓' },
              { id: 'anime', name: '✨' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTeller(t.id)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm cursor-pointer transition border ${
                  activeTeller === t.id ? 'bg-emerald-550 border-emerald-550 text-white shadow-sm scale-105' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[9px] font-bold text-slate-655 italic leading-relaxed">
            {activeTeller === 'detective' && '"Vance: Follow the digital clues, kid. The silicon trail doesn\'t lie..."'}
            {activeTeller === 'professor' && '"Historically speaking, this mimics the coal monopolies of 1880..."'}
            {activeTeller === 'anime' && '"Nani?! A new microchip that controls light?! Kawaii!"'}
          </div>
        </div>
      )
    },
    {
      id: 'universe',
      icon: '🌍',
      colorBg: 'bg-amber-500/10',
      colorText: 'text-amber-650',
      glowColor: 'group-hover:shadow-[0_20px_50px_-10px_rgba(245,158,11,0.18)] group-hover:border-amber-300/60',
      title: 'Story Universe',
      desc: 'Never read isolated titles again. Every entity connects in an ongoing, live-updated database graph.',
      widget: (
        <div className="w-full mt-4 h-20 bg-slate-50 rounded-2xl border border-slate-200/85 relative flex items-center justify-center p-2 shadow-sm overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:10px_10px]" />
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <line x1="45" y1="40" x2="115" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="115" y1="40" x2="185" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
          </svg>
          <div className="flex justify-around items-center w-full z-10 relative">
            <div 
              onMouseEnter={() => setHoveredNode('ASML')}
              onMouseLeave={() => setHoveredNode(null)}
              className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-black uppercase transition-all shadow-sm ${
                hoveredNode === 'ASML' ? 'bg-amber-500 text-white scale-110 shadow-md' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              ASML
            </div>
            <div 
              onMouseEnter={() => setHoveredNode('1nm')}
              onMouseLeave={() => setHoveredNode(null)}
              className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-black uppercase transition-all shadow-sm ${
                hoveredNode === '1nm' ? 'bg-[#7C3AED] text-white scale-110 shadow-md' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              1nm
            </div>
            <div 
              onMouseEnter={() => setHoveredNode('TSMC')}
              onMouseLeave={() => setHoveredNode(null)}
              className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-black uppercase transition-all shadow-sm ${
                hoveredNode === 'TSMC' ? 'bg-blue-650 text-white scale-110 shadow-md' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              TSMC
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % allFeatures.length)
  }

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + allFeatures.length) % allFeatures.length)
  }

  const visibleFeatures = [
    allFeatures[startIndex],
    allFeatures[(startIndex + 1) % allFeatures.length],
    allFeatures[(startIndex + 2) % allFeatures.length]
  ]

  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left space-y-3 max-w-lg">
          <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest bg-[#7C3AED]/5 px-3 py-1 rounded-md border border-[#7C3AED]/10 w-fit block">
            Engineered For Immersion
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1D1D1F] tracking-tight">Interactive Features</h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
            Every feature is designed to drag you out of the passenger seat and put you in control of the news. Play with the previews below!
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-end">
          <button 
            onClick={handlePrev}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition hover:shadow-sm cursor-pointer active:scale-95"
            aria-label="Previous Feature"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={handleNext}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition hover:shadow-sm cursor-pointer active:scale-95"
            aria-label="Next Feature"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleFeatures.map((feat) => (
            <motion.div 
              key={feat.id}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className={`glass-card rounded-3xl p-6.5 flex flex-col justify-between text-left border border-slate-200/80 bg-white/95 backdrop-blur-md transition-all duration-300 group relative ${feat.glowColor}`}
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${feat.colorBg} ${feat.colorText} flex items-center justify-center text-xl font-bold group-hover:rotate-6 transition-transform duration-300`}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
              </div>

              {feat.widget && (
                <div className="w-full mt-4">
                  {feat.widget}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-1.5 pt-2">
        {allFeatures.map((_, idx) => {
          const isSelected = 
            idx === startIndex || 
            idx === (startIndex + 1) % allFeatures.length || 
            idx === (startIndex + 2) % allFeatures.length
          return (
            <button
              key={idx}
              onClick={() => setStartIndex(idx)}
              className={`h-1.5 rounded-full transition-all border-none p-0 cursor-pointer ${
                isSelected ? 'w-5 bg-[#7C3AED]' : 'w-1.5 bg-slate-250 hover:bg-slate-350'
              }`}
              aria-label={`Go to feature slide ${idx + 1}`}
            />
          )
        })}
      </div>
    </section>
  )
}
