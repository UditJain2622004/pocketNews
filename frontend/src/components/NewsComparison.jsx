import React from 'react'

export default function NewsComparison() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Why Gen Z Doesn't Read Traditional News</h2>
        <p className="text-slate-600 max-w-md mx-auto text-sm">Dry text and static newspapers belong to the past. Pocket News is built for the now.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* The Old Way */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 opacity-75 hover:opacity-95 transition-opacity flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">The Old Way</span>
              <span className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">✕</span>
            </div>
            <h3 className="text-lg font-bold text-slate-700">Traditional Newspapers & Feeds</h3>
            <div className="border border-dashed border-slate-200 p-4 rounded-xl space-y-2">
              <div className="w-full h-4 bg-slate-100 rounded" />
              <div className="w-[90%] h-3 bg-slate-50 rounded" />
              <div className="w-[95%] h-3 bg-slate-50 rounded" />
              <div className="w-[80%] h-3 bg-slate-50 rounded" />
              <div className="w-full h-3 bg-slate-50 rounded" />
            </div>
            <ul className="space-y-2 text-xs text-slate-500 list-disc list-inside">
              <li>Hours of dry, technical articles</li>
              <li>No context to help understand details</li>
              <li>Purely passive consumption (boring reading)</li>
            </ul>
          </div>
          <span className="text-[10px] text-rose-500 font-bold block pt-4">Result: 2-minute average attention drop-off</span>
        </div>

        {/* The New Way */}
        <div className="bg-white border border-[#7C3AED]/25 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">The Pocket News Way</span>
              <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">✓</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Cinematic Episodic Feeds</h3>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-lg">
                🎙️
              </div>
              <div className="flex-1 space-y-1">
                <span className="block text-xs font-bold text-slate-800">The Silicon Wars</span>
                <span className="block text-[10px] text-[#EC4899] font-medium">Episode 4 • Active 30s Audio Recap</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
              <li>30-sec cinematic audio/video podcasts</li>
              <li>Interactive game options to drive stories</li>
              <li>Customized explanations (Analogy or Deep Dive)</li>
            </ul>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block pt-4">Result: 95% story completion rates</span>
        </div>
      </div>
    </section>
  )
}
