import React from 'react'

export default function GenreSwitcher({ storyGenres, activeGenre, setActiveGenre, onEnterApp }) {
  return (
    <section className="max-w-8xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12 text-center">
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">One News. Infinite Experiences.</h2>
        <p className="text-slate-600 max-w-md mx-auto text-sm">Experience the exact same news story adapted to different structural genres with one swipe.</p>
      </div>

      {/* Carousel Toggles */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none justify-start sm:justify-center border-b border-slate-200">
        {storyGenres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setActiveGenre(genre.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeGenre === genre.id
                ? 'bg-[#7C3AED] text-white shadow-md scale-105'
                : 'bg-white text-slate-600 hover:text-slate-800 border border-slate-200'
            }`}
          >
            <span>{genre.icon}</span>
            <span>{genre.name}</span>
          </button>
        ))}
      </div>

      {/* Excerpt Display Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 shadow-sm backdrop-blur-md text-left">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-[#EC4899]/5 text-[#EC4899] border border-[#EC4899]/15 uppercase">
            Genre Mode: {storyGenres.find(g => g.id === activeGenre)?.name}
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-3">The Chip Machine Incident</h3>
        </div>
        <p className="text-slate-700 text-base leading-relaxed italic">
          "{storyGenres.find(g => g.id === activeGenre)?.excerpt}"
        </p>
        <button 
          onClick={onEnterApp}
          className="text-xs font-bold text-[#7C3AED] hover:text-violet-600 transition-colors flex items-center gap-1"
        >
          Enter platform to experience full version <span>→</span>
        </button>
      </div>
    </section>
  )
}
