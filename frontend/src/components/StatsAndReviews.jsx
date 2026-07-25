import React from 'react'

export default function StatsAndReviews() {
  return (
    <div className="space-y-24">
      {/* 10. LIVE STATISTICS */}
      <section id="stats" className="max-w-8xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          <div className="bg-white border border-slate-250 p-6 rounded-2xl shadow-sm">
            <span className="block text-4xl sm:text-5xl font-extrabold text-[#1D1D1F] mb-2 font-display">2M+</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stories Generated</span>
          </div>

          <div className="bg-white border border-slate-250 p-6 rounded-2xl shadow-sm">
            <span className="block text-4xl sm:text-5xl font-extrabold text-[#1D1D1F] mb-2 font-display">100K+</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hours Listened</span>
          </div>

          <div className="bg-white border border-slate-250 p-6 rounded-2xl shadow-sm">
            <span className="block text-4xl sm:text-5xl font-extrabold text-[#1D1D1F] mb-2 font-display">50+</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Countries Active</span>
          </div>

          <div className="bg-white border border-slate-250 p-6 rounded-2xl shadow-sm">
            <span className="block text-4xl sm:text-5xl font-extrabold text-[#1D1D1F] mb-2 font-display">95%</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completion Rate</span>
          </div>

        </div>
      </section>

      {/* 11. TESTIMONIALS */}
      <section className="max-w-8xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-[#1D1D1F]">What The Listeners Say</h2>
          <p className="text-slate-600 text-sm max-w-sm mx-auto">Real responses from users switching their feed habits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { name: 'Alex River', handle: '@riverdev', role: 'Software Engineer', text: "The Software Engineer filter makes tech news read like a architectural brief. It explains the mechanics behind compilation. Absolutely outstanding concept." },
            { name: 'Chloe Madison', handle: '@chloemad', role: 'Product Designer', text: "I hated traditional feeds. StoryCast made me listen to ASML monopolies like a dark detective mystery. The soundwaves and voice narration are top quality." },
            { name: 'Ryan K.', handle: '@ryank_tech', role: 'College Student', text: "The Comedian narrator is hilarious. Explaining quantum physics constraints using bad printer jokes makes concepts stick instantly." }
          ].map((test, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-sm font-bold">
                  {test.name[0]}
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-800">{test.name}</span>
                  <span className="block text-[10px] text-slate-450">{test.handle} • {test.role}</span>
                </div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                "{test.text}"
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
