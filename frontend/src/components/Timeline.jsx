import React from 'react'

export default function Timeline({ episodes }) {
  return (
    <section className="max-w-8xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12 text-center">
      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-[#1D1D1F]">Episodic TIMELINE</h2>
        <p className="text-slate-600 text-sm max-w-sm mx-auto">Follow long-running world affairs like a Netflix series.</p>
      </div>

      <div className="relative text-left">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 hidden md:block" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {episodes.map((ep, idx) => (
            <div 
              key={idx}
              className={`bg-white border border-slate-200 p-5 rounded-2xl space-y-3 relative shadow-sm ${
                ep.isToday ? 'border-[#7C3AED] shadow-md shadow-violet-500/5' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400">EPISODE {ep.num}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                  ep.isToday ? 'bg-[#7C3AED] text-white' : ep.isFuture ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  {ep.date}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">{ep.title}</h4>
              <span className="block text-[10px] text-slate-500">
                {ep.active ? '✓ Complete' : '🔒 Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
