import React from 'react'

export default function FeaturesGrid() {
  return (
    <section id="features" className="max-w-8xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Engineered For Immersion</h2>
        <p className="text-slate-600 max-w-md mx-auto text-sm">Every feature is designed to drag you out of the passenger seat and put you in control of the news.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Podcast Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-xl font-bold">🎙️</div>
          <h3 className="text-lg font-bold text-slate-800">AI Podcasts</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Listen to cinematic voice streams loaded with matching ambient audio, soundscapes, and expressive actors.</p>
          <div className="flex gap-0.5 h-6 pt-2 items-end">
            <span className="w-1 bg-[#7C3AED] animate-wave-1 h-4" />
            <span className="w-1 bg-[#7C3AED] animate-wave-2 h-6" />
            <span className="w-1 bg-[#7C3AED] animate-wave-3 h-3" />
            <span className="w-1 bg-[#7C3AED] animate-wave-4 h-5" />
          </div>
        </div>

        {/* Video Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center text-xl font-bold">🎥</div>
          <h3 className="text-lg font-bold text-slate-800">AI Videos</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Prefer visual cues? Switch to short vertical videos filled with dynamic imagery, captions, and deep beats.</p>
          <div className="aspect-video bg-slate-105 rounded-lg border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 uppercase">
            Video Simulator Active
          </div>
        </div>

        {/* Choices Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#EC4899]/10 text-[#EC4899] flex items-center justify-center text-xl font-bold">🎮</div>
          <h3 className="text-lg font-bold text-slate-800">Interactive Choices</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Choose path direction, predict financial outcomes, and discover how events shift based on user choices.</p>
          <span className="inline-block text-[10px] font-bold text-[#EC4899] border border-[#EC4899]/20 rounded px-2 py-0.5 bg-[#EC4899]/5">What would you do?</span>
        </div>

        {/* Personalized Memory Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center text-xl font-bold">🧠</div>
          <h3 className="text-lg font-bold text-slate-800">Tailored Memory</h3>
          <p className="text-xs text-slate-500 leading-relaxed">The engine tracks your interest profiles and structures explanations with analogies based on your profession.</p>
        </div>

        {/* Storytellers Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center text-xl font-bold">🎭</div>
          <h3 className="text-lg font-bold text-slate-800">AI Storytellers</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Toggle between Sherlock Holmes, a university professor, a comic presenter, or a cyberpunk futurist instantly.</p>
        </div>

        {/* connected Universe */}
        <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 text-[#D97706] flex items-center justify-center text-xl font-bold">🌍</div>
          <h3 className="text-lg font-bold text-slate-800">Connected Story Universe</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Never read isolated titles again. Every entity connects in an ongoing, live-updated database graph.</p>
        </div>

      </div>
    </section>
  )
}
