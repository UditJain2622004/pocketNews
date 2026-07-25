import React from 'react'

export default function StoryQuiz({ selectedQuizAnswer, setSelectedQuizAnswer, quizSubmitted, setQuizSubmitted, onEnterApp }) {
  return (
    <section className="max-w-8xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12 text-center">
      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-[#1D1D1F]">Interactive Story Example</h2>
        <p className="text-slate-600 text-sm max-w-sm mx-auto">Cast your vote to unlock the subsequent chapter parameters.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left">
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Interactive Prompt</span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-850">A global tech giant lost $40 Billion in value overnight. Why?</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'A', text: 'CEO resigned abruptly' },
            { label: 'B', text: 'Secured grid database hack' },
            { label: 'C', text: 'AI logic model made a severe math mistake' },
            { label: 'D', text: 'Government ban on key chemical inputs' }
          ].map((ans) => (
            <button
              key={ans.label}
              onClick={() => { setSelectedQuizAnswer(ans.label); setQuizSubmitted(true); }}
              className={`p-4 rounded-xl border text-left text-xs font-semibold transition-all ${
                selectedQuizAnswer === ans.label
                  ? 'bg-[#7C3AED]/5 border-[#7C3AED] text-[#7C3AED] shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="inline-block w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-center leading-6 mr-3 font-mono text-[10px]">
                {ans.label}
              </span>
              {ans.text}
            </button>
          ))}
        </div>

        {quizSubmitted && (
          <div className="bg-emerald-500/5 border border-emerald-550/20 p-4 rounded-2xl text-xs text-slate-700 animate-fadeIn space-y-2">
            <p className="font-semibold text-emerald-600">✓ Correct Choice Tracked!</p>
            <p>
              "The logic model error caused a major manufacturing overflow, cascading into a shipping embargo. Chapter 2 has been updated. Generating narrative..."
            </p>
            <button 
              onClick={onEnterApp}
              className="text-[#7C3AED] font-bold hover:underline block pt-2"
            >
              Open Dashboard to continue story ➔
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
