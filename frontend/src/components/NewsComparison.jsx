import React from 'react'

export default function NewsComparison() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 space-y-16 relative overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gradient-to-br from-[#7C3AED]/5 to-[#EC4899]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center space-y-4 relative z-10">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1D1D1F]">
          Why Gen Z Doesn't Read Traditional News
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          Dry text and static newspapers belong to the past. Pocket News is built for the fast-paced, interactive present.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative z-10">
        
        {/* The Old Way */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 space-y-8 hover:border-slate-350 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-md border border-rose-100">
                The Old Way
              </span>
              <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-xs border border-rose-100">
                ✕
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Traditional Newspapers & Feeds</h3>
            
            <div className="border border-slate-200/80 p-4 rounded-xl space-y-2 bg-slate-50/50 text-left font-serif text-[11px] text-slate-400 leading-relaxed max-h-[135px] overflow-hidden relative">
              <div className="font-sans font-bold text-slate-655 uppercase tracking-wider text-[8px] border-b border-slate-200/80 pb-1.5 mb-1.5 flex justify-between">
                <span>The Daily Gazette</span>
                <span>Oct 24, 2026</span>
              </div>
              <p className="font-bold text-slate-750 text-[11px] leading-tight font-sans">
                REGULATORY REPORT ON SEMICONDUCTOR LITHOGRAPHY EXPORTS AND COMPLIANCE MOATS
              </p>
              <p className="text-[10px] line-clamp-3">
                In an official corporate disclosure released on Thursday afternoon, major hardware fabrication vendors announced compliance guidelines concerning EUV light source distribution. The guidelines outline administrative protocols that will introduce bureaucratic overhead...
              </p>
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>

            <div className="space-y-3.5 pt-2 text-left">
              <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-rose-500 font-black mt-0.5">✕</span>
                <span>Hours of dry, technical articles and monolithic text columns</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-rose-500 font-black mt-0.5">✕</span>
                <span>Zero background context to explain complex names and details</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-rose-500 font-black mt-0.5">✕</span>
                <span>Purely passive consumption (dull and unengaging)</span>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs font-black text-rose-500 uppercase tracking-wide">Result:</span>
            <span className="text-xs font-bold text-slate-600">2-minute average attention drop-off</span>
          </div>
        </div>

        {/* The New Way */}
        <div className="bg-white/90 backdrop-blur-md border border-[#7C3AED]/20 rounded-3xl p-8 space-y-8 hover:border-[#7C3AED]/40 hover:shadow-[0_20px_50px_-12px_rgba(124,58,237,0.1)] transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest bg-[#7C3AED]/5 px-3 py-1 rounded-md border border-[#7C3AED]/10">
                The Pocket News Way
              </span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100">
                ✓
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Cinematic Episodic Feeds</h3>
            
            <div className="bg-gradient-to-r from-[#7C3AED]/5 to-[#EC4899]/5 border border-[#7C3AED]/15 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-lg shadow-md shadow-[#7C3AED]/20">
                🎙️
              </div>
              <div className="flex-1 text-left">
                <span className="block text-xs font-black text-slate-900 uppercase tracking-wider">The Silicon Wars</span>
                <span className="block text-[10px] text-[#EC4899] font-bold tracking-wide mt-0.5">Episode 4 • Active 30s Audio Recap</span>
              </div>
            </div>

            <div className="space-y-3.5 pt-2 text-left">
              <div className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                <span className="text-emerald-500 font-black mt-0.5">✓</span>
                <span>30-second immersive audio and video summary capsules</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                <span className="text-emerald-500 font-black mt-0.5">✓</span>
                <span>Interactive choices and quizzes that drive story directions</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                <span className="text-emerald-500 font-black mt-0.5">✓</span>
                <span>Custom explanations tailored to your career and interests</span>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs font-black text-emerald-600 uppercase tracking-wide">Result:</span>
            <span className="text-xs font-bold text-slate-655">95% story completion rates</span>
          </div>
        </div>
      </div>
    </section>
  )
}
