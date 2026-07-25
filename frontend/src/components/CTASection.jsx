import React from 'react'

export default function CTASection({ onEnterApp }) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-24 border-t border-slate-200">
      <div className="bg-gradient-to-r from-[#7C3AED]/10 to-[#EC4899]/10 border border-[#7C3AED]/20 rounded-3xl p-10 sm:p-16 text-center space-y-8 relative overflow-hidden shadow-sm">
        <h2 className="text-3xl sm:text-6xl font-extrabold text-[#1D1D1F] leading-tight">Ready to Experience News Like Never Before?</h2>
        <p className="text-slate-600 text-base max-w-xl mx-auto">
          Join millions of listeners transforming raw news headlines into cinematic narratives tailored to their minds.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <button 
            onClick={onEnterApp}
            className="px-8 py-4 rounded-xl bg-[#7C3AED] text-white font-bold hover:scale-105 transition-all text-sm shadow-md"
          >
            Start Listening
          </button>
          <button 
            className="px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 transition-all text-sm"
          >
            Join Waitlist
          </button>
        </div>
      </div>
    </section>
  )
}
