import React from 'react'

export default function InterestSelector({
  selectedTopics,
  toggleTopic,
  selectedSubtopics,
  toggleSubtopic,
  suggestions,
  onBack,
  onSubmit,
  loading
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-slate-800">
      
      {/* Left Column - Browsing categories (Options to choose) */}
      <div className="md:col-span-7 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Choose Your Subreddits / Interests</h3>
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {Object.entries(suggestions).map(([topic, subtopics]) => {
              const isTopicSelected = selectedTopics.includes(topic)
              return (
                <div key={topic} className="p-3 bg-white/60 border border-black/5 rounded-2xl space-y-2 hover:border-slate-300/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{topic}</h4>
                    <button
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        isTopicSelected 
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white border-transparent shadow-sm' 
                          : 'bg-white text-slate-550 border-black/5 hover:border-slate-350'
                      }`}
                    >
                      {isTopicSelected ? '✓ Selected' : '+ Join'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {subtopics.map(sub => {
                      const isSubSelected = selectedSubtopics.includes(sub)
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => {
                            if (!isTopicSelected && !isSubSelected) {
                              toggleTopic(topic)
                            }
                            toggleSubtopic(sub)
                          }}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isSubSelected
                              ? 'bg-[#EC4899] text-white border-transparent'
                              : 'bg-white text-slate-550 border-black/5 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {isSubSelected ? `✓ ${sub}` : `+ ${sub}`}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Custom Topics Segment */}
            {selectedTopics.filter(t => !suggestions[t]).length > 0 && (
              <div className="p-3 bg-white/60 border border-black/5 rounded-2xl space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Custom Subreddits</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTopics.filter(t => !suggestions[t]).map(topic => (
                    <span key={topic} className="px-2.5 py-1 bg-white border border-[#7C3AED]/20 text-[#7C3AED] rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      {topic}
                      <button type="button" onClick={() => toggleTopic(topic)} className="text-red-500 font-bold hover:text-red-700">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - User's Active Choices & Actions */}
      <div className="md:col-span-5 flex flex-col justify-between space-y-6 border-t md:border-t-0 md:border-l border-black/5 pt-6 md:pt-0 md:pl-6">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-10 h-10 object-contain rounded-xl" alt="Logo" />
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-850">Your Interests</h3>
              <p className="text-[11px] text-slate-500 font-medium">Personalize your cinematic feed</p>
            </div>
          </div>

          {/* Selected Summary Card */}
          {(selectedTopics.length > 0 || selectedSubtopics.length > 0) ? (
            <div className="p-4 bg-[#7C3AED]/5 border border-[#7C3AED]/12 rounded-2xl max-h-[190px] overflow-y-auto space-y-3">
              <h4 className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider">Active Selections</h4>
              <div className="space-y-2.5">
                {selectedTopics.length > 0 && (
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Categories ({selectedTopics.length}):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTopics.map(topic => (
                        <span key={topic} className="px-2 py-0.5 bg-white border border-[#7C3AED]/20 text-[#7C3AED] rounded-md text-[10px] font-bold flex items-center gap-1">
                          {topic}
                          <button type="button" onClick={() => toggleTopic(topic)} className="text-red-500 font-bold hover:text-red-700">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedSubtopics.length > 0 && (
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Subtopics ({selectedSubtopics.length}):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSubtopics.map(sub => (
                        <span key={sub} className="px-2 py-0.5 bg-white border border-pink-200 text-pink-600 rounded-md text-[10px] font-bold flex items-center gap-1">
                          {sub}
                          <button type="button" onClick={() => toggleSubtopic(sub)} className="text-red-500 font-bold hover:text-red-700">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-100/50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
              No interests selected yet. Join categories from the left.
            </div>
          )}
        </div>

        {/* Final Actions */}
        <div className="space-y-4 pt-4 border-t border-black/5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2.5 border border-black/10 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="flex-[2] py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Complete Profile'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
