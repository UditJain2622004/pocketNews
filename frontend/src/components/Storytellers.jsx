import React from 'react'

export default function Storytellers({ storytellers, activeTeller, setActiveTeller }) {
  return (
    <section id="storytellers" className="max-w-8xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Meet Your AI Storytellers</h2>
        <p className="text-slate-600 max-w-md mx-auto text-sm">Choose characters that match your interest. Every narrator keeps memory across your listening sessions.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
        {storytellers.map((teller) => (
          <button
            key={teller.id}
            onClick={() => setActiveTeller(teller.id)}
            className={`p-5 rounded-2xl border text-left transition-all duration-300 relative group flex flex-col justify-between min-h-[140px] ${
              activeTeller === teller.id
                ? 'bg-white border-[#7C3AED] shadow-lg shadow-violet-500/5 scale-105'
                : 'bg-white border-slate-200 hover:border-slate-400'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-3xl">{teller.avatar}</span>
              {activeTeller === teller.id && <span className="text-[10px] bg-[#7C3AED] text-white px-2 py-0.5 rounded font-bold uppercase">Active</span>}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#7C3AED] transition-colors">{teller.name}</h4>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{teller.role}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Interactive Voice Demo Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl mx-auto text-center space-y-4 shadow-sm">
        <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block">Voice Preview Console</span>
        <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
          "{storytellers.find(t => t.id === activeTeller)?.preview}"
        </p>
        <div className="flex items-center justify-center gap-3 text-xs text-[#7C3AED]">
          <span className="flex gap-1 h-3 items-end">
            <span className="w-0.5 bg-[#7C3AED] animate-wave-1 h-3" />
            <span className="w-0.5 bg-[#7C3AED] animate-wave-2 h-3" />
            <span className="w-0.5 bg-[#7C3AED] animate-wave-3 h-3" />
          </span>
          <span>Generative Voice Wave Active</span>
        </div>
      </div>
    </section>
  )
}
