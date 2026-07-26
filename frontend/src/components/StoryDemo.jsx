import React from 'react'

export default function StoryDemo({ demoStep, demoWaveHeight }) {
  return (
    <section id="demo" className="max-w-5xl mx-auto px-4 py-24 border-t border-slate-200 space-y-8 text-center relative">
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Watch The Magic Happen</h2>
        <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">Experience how Pocket News translates technical stats into immersive digital beats in real-time.</p>
      </div>

      <div className="bg-white/90 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-10 text-left relative overflow-hidden shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-6 mb-6 gap-4">
          <div>
            <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest">Pocket News Engine</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">Live Translation Demo</h3>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${demoStep === 0 ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-slate-100/60 text-slate-400'}`}>
              1. Raw Fact
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${demoStep === 1 ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20' : 'bg-slate-100/60 text-slate-400'}`}>
              2. Story Morph
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${demoStep === 2 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100/60 text-slate-400'}`}>
              3. Narration Deck
            </span>
          </div>
        </div>

        <div className="min-h-40 flex flex-col justify-center">
          {demoStep === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase">
                <span>📰</span> Breaking News Fact
              </div>
              <p className="text-slate-700 text-lg font-mono italic bg-slate-50/50 border border-slate-200/80 p-5 rounded-2xl shadow-inner">
                "OpenAI today announced the official release of GPT-X, its latest multimodal reasoning model capable of solving advanced mathematics and logical sequences."
              </p>
            </div>
          )}

          {demoStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-violet-600 text-xs font-bold uppercase">
                <span>🎬</span> Episode 12: Story Adaptation
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-slate-800">The Silicon Mind Awakes</h4>
                <p className="text-slate-655 text-base leading-relaxed">
                  "In a quiet lab at San Francisco, the machines ceased to just calculate—they began to reason. OpenAI's latest creation, GPT-X, did not just spit out equations. It solved mysteries that had baffled academics for generations."
                </p>
              </div>
            </div>
          )}

          {demoStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase">
                  <span>🎙️</span> Soundwave & Audio Narration Active
                </div>
                <span className="text-[10px] text-slate-400">Voice: Prof. Higgins</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50/50 border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                <div className="w-16 h-16 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center text-3xl shadow-sm">
                  🎓
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <p className="text-sm font-semibold text-slate-800 italic">
                    "The computational leap we've observed today isn't just code; it's the genesis of a new cognitive era..."
                  </p>
                  <div className="flex items-end gap-[3px] h-8 pt-1">
                    {demoWaveHeight.map((h, i) => (
                      <span key={i} className="flex-1 bg-gradient-to-t from-[#7C3AED] to-[#EC4899] rounded-full transition-all duration-150" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
