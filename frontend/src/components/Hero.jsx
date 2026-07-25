import React from 'react'

export default function Hero({ onEnterApp, heroMorphStep }) {
  return (
    <div>
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative">
        
        {/* Left Text Column */}
        <div className="space-y-8 text-left z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/85 border border-slate-200/50 shadow-sm text-xs font-bold text-slate-700 backdrop-blur-md w-fit">
            <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
            <span>AI-Native News Engine</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Interactive Podcasts</span>
          </div>

          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.08] text-[#1D1D1F]">
            Stop Reading News.<br />
            Start <span className="bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F97316] bg-clip-text text-transparent">Living the Story.</span>
          </h1>

          <p className="text-slate-600 text-lg sm:text-xl max-w-xl leading-relaxed">
            StoryCast AI transforms today's dry headlines into personalized, cinematic podcasts and interactive experiences you will actually enjoy consuming.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={onEnterApp}
              className="px-8 py-4 rounded-2xl text-base font-extrabold bg-[#1D1D1F] text-white hover:bg-black transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-98 flex items-center gap-2"
            >
              ✨ Try Today's Story
            </button>
            <a 
              href="#demo"
              className="px-8 py-4 rounded-2xl text-base font-bold bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 transition-all flex items-center gap-2"
            >
              ▶ Watch Demo
            </a>
          </div>
        </div>

        {/* Right Floating Phone Mockup */}
        <div className="flex justify-center relative z-10">
          <div className="w-72 h-[560px] rounded-[42px] border-[6px] border-[#D2D2D7] bg-[#09090B] shadow-2xl relative overflow-hidden animate-float">
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
                className="w-full py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 rounded-xl text-center text-xs font-bold text-white shadow-md"
              >
                Continue Story
              </button>
            </div>
          </div>
          <div className="absolute -inset-10 bg-gradient-to-tr from-[#7C3AED]/10 to-[#EC4899]/10 rounded-full blur-2xl opacity-40 animate-pulse-slow pointer-events-none" />
        </div>
      </header>

      {/* Morphing Concept */}
      <section className="max-w-7xl mx-auto px-4 pb-24 text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-sm backdrop-blur-md">
          <div className="absolute top-0 left-0 px-4 py-1 bg-[#7C3AED] text-white text-[9px] font-bold uppercase tracking-wider rounded-br-2xl">
            Live Translation Engine Concept
          </div>

          {heroMorphStep === 0 && (
            <div className="space-y-4 py-6 animate-fadeIn">
              <span className="text-rose-655 text-xs font-bold uppercase tracking-widest block">📰 Breaking News Headline</span>
              <h3 className="text-xl sm:text-2xl font-mono text-slate-750 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-2xl mx-auto italic">
                "NVIDIA Corporation today announced the shipping details of its new Blackwell architecture AI chips."
              </h3>
            </div>
          )}

          {heroMorphStep === 1 && (
            <div className="space-y-4 py-6 animate-fadeIn">
              <span className="text-[#EC4899] text-xs font-bold uppercase tracking-widest block">🎬 Cinematic Story Adaption</span>
              <p className="text-slate-800 text-lg font-bold max-w-2xl mx-auto leading-relaxed">
                "It began with a quiet announcement from a small tech pressroom... Within hours, every major AI laboratory in the world was racing to secure their share of the silicon future."
              </p>
            </div>
          )}

          {heroMorphStep === 2 && (
            <div className="space-y-4 py-6 animate-fadeIn flex flex-col items-center">
              <span className="text-emerald-655 text-xs font-bold uppercase tracking-widest block">🎙️ AI Narrator & Video Rendered</span>
              <div className="flex items-center gap-3 bg-[#7C3AED]/5 border border-[#7C3AED]/15 px-4 py-2 rounded-xl text-xs text-[#7C3AED] font-semibold mt-2">
                <span className="flex gap-1 h-3 items-end">
                  <span className="w-0.5 bg-[#7C3AED] animate-wave-1 h-3" />
                  <span className="w-0.5 bg-[#7C3AED] animate-wave-2 h-3" />
                  <span className="w-0.5 bg-[#7C3AED] animate-wave-3 h-3" />
                </span>
                <span>Audio Playing: Vance (AI Detective)</span>
              </div>
              <p className="text-slate-600 text-xs max-w-md mt-2">
                "The silicon trade isn't just about graphics cards anymore. It's the new battleground for global intelligence."
              </p>
            </div>
          )}

          <div className="flex justify-center gap-1.5 pt-2">
            <span className={`w-2 h-2 rounded-full transition-colors ${heroMorphStep === 0 ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} />
            <span className={`w-2 h-2 rounded-full transition-colors ${heroMorphStep === 1 ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} />
            <span className={`w-2 h-2 rounded-full transition-colors ${heroMorphStep === 2 ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} />
          </div>
        </div>
      </section>
    </div>
  )
}
