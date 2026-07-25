import React from 'react'
import { motion } from 'framer-motion'

export default function StudioTab({
  currentStory,
  episodes,
  profession,
  setProfession,
  level,
  setLevel,
  format,
  setFormat,
  activeNarrator,
  setActiveNarrator,
  activePerspective,
  setActivePerspective,
  userQuestion,
  setUserQuestion,
  chatLog,
  handleAskQuestion,
  voted,
  voteCount,
  castVote,
  isPlaying,
  setIsPlaying,
  audioProgress,
  videoFrameIndex,
  demoWaveHeight
}) {
  return (
    <div className="space-y-6 pb-2 text-left text-zinc-800">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#E11D48]/10 text-[#F43F5E] border border-[#E11D48]/20 uppercase tracking-wider">
              {currentStory.topic}
            </span>
            <span className="text-zinc-450 text-xs">•</span>
            <span className="text-zinc-500 text-xs font-semibold">{currentStory.season}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 uppercase">
            {currentStory.title.split(':')[0]}
          </h1>
        </div>

        {/* Persona selector quickbar */}
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/50 p-1.5 rounded-2xl shadow-md self-start md:self-auto">
          <div className="text-right hidden sm:block pr-2 border-r border-zinc-200 mr-1">
            <span className="block text-[8px] uppercase tracking-wider font-black text-zinc-400">Tone tailoring</span>
            <span className="block text-[10px] text-zinc-700 font-bold mt-0.5">{profession}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <select 
              value={profession} 
              onChange={(e) => setProfession(e.target.value)}
              className="bg-white/40 border border-white/40 text-[11px] font-bold text-zinc-750 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#E11D48] transition-all cursor-pointer hover:bg-white/80"
            >
              <option>Software Engineer</option>
              <option>Student</option>
              <option>Investor</option>
              <option>Creative Writer</option>
            </select>

            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              className="bg-white/40 border border-white/40 text-[11px] font-bold text-zinc-750 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#E11D48] transition-all cursor-pointer hover:bg-white/80"
            >
              <option>Analogy-driven</option>
              <option>Standard Narrative</option>
              <option>Deep Dive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Player & Formats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Format Switcher */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-1.5 flex gap-2 shadow-md">
            <button
              onClick={() => { setFormat('text'); setIsPlaying(false); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                format === 'text'
                  ? 'bg-[#E11D48] text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-850 hover:bg-zinc-100'
              }`}
            >
              <span>📖</span> Immersive Text
            </button>
            <button
              onClick={() => setFormat('audio')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                format === 'audio'
                  ? 'bg-[#E11D48] text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-850 hover:bg-zinc-100'
              }`}
            >
              <span>🎙️</span> Audio Podcast
            </button>
            <button
              onClick={() => setFormat('video')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                format === 'video'
                  ? 'bg-[#E11D48] text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-850 hover:bg-zinc-100'
              }`}
            >
              <span>🎬</span> Short Video
            </button>
          </div>

          {/* Format Content */}
          {format === 'text' && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/3 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 bg-[#E11D48]/10 border border-[#E11D48]/20 rounded-xl px-4 py-2 text-[10px] text-[#F43F5E] font-black uppercase tracking-wider">
                <span>✨</span> Tailoring explanations for {profession} ({level} mode).
              </div>

              <div className="space-y-6 text-left relative z-10">
                {/* Hook */}
                <div className="relative pl-6 border-l-2 border-[#E11D48]">
                  <span className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-[#E11D48]" />
                  <span className="text-[9px] text-[#F43F5E] font-black uppercase tracking-widest block mb-1">The Hook</span>
                  <p className="text-base text-zinc-900 font-semibold leading-relaxed">{currentStory.narrative.hook}</p>
                </div>

                {/* Context */}
                <div className="relative pl-6 border-l-2 border-indigo-500/20">
                  <span className="text-[9px] text-indigo-555 font-black uppercase tracking-widest block mb-1">The Context</span>
                  <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed">
                    {currentStory.narrative.context} 
                    {profession === 'Software Engineer' && <span className="text-[#F43F5E] font-bold ml-1">Specifically, Extreme Ultraviolet wavelengths sit at 13.5nm, projecting stencils directly onto silicon wafers with sub-atomic precision.</span>}
                    {profession === 'Student' && <span className="text-[#F43F5E] font-bold ml-1">Think of it like trying to paint microscopic details on a grain of sand using a high-precision laser beam instead of a paint brush.</span>}
                  </p>
                </div>

                {/* Conflict */}
                <div className="relative pl-6 border-l-2 border-amber-500/20">
                  <span className="text-[9px] text-amber-600 font-black uppercase tracking-widest block mb-1">The Conflict</span>
                  <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed">{currentStory.narrative.conflict}</p>
                </div>

                {/* Climax */}
                <div className="relative pl-6 border-l-2 border-[#EC4899]/20">
                  <span className="text-[9px] text-[#EC4899] font-black uppercase tracking-widest block mb-1">The Climax</span>
                  <p className="text-zinc-800 text-xs sm:text-sm leading-relaxed font-semibold">{currentStory.narrative.climax}</p>
                </div>

                {/* Takeaway */}
                <div className="relative pl-6 border-l-2 border-emerald-500/20">
                  <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest block mb-1">The Takeaway</span>
                  <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed">{currentStory.narrative.takeaway}</p>
                </div>
              </div>
            </div>
          )}

          {format === 'audio' && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col items-center text-center shadow-md">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#E11D48] to-[#EC4899] flex items-center justify-center shadow-md relative group">
                <span className="text-4xl">🎙️</span>
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center gap-1">
                    <span className="w-1 bg-white rounded-full animate-bounce h-8" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 bg-white rounded-full animate-bounce h-12" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1 bg-white rounded-full animate-bounce h-6" style={{ animationDelay: '0.3s' }} />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-black text-zinc-900 mb-1">The Silicon Shield Podcast</h3>
                <p className="text-xs text-[#F43F5E] font-bold uppercase tracking-wider">Narrated by: {activeNarrator.toUpperCase()}</p>
              </div>

              {/* Waveform */}
              <div className="w-full h-12 flex items-end justify-center gap-[4px] py-2">
                {demoWaveHeight.map((h, idx) => (
                  <span
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-150 ${isPlaying ? 'bg-[#E11D48]' : 'bg-zinc-200'}`}
                    style={{ height: isPlaying ? `${h}px` : '12px' }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-[10px] text-zinc-555 font-bold uppercase tracking-wider">
                  <span>1:24</span>
                  <span>4:15</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden cursor-pointer">
                  <div className="bg-[#E11D48] h-1.5 rounded-full transition-all duration-300" style={{ width: `${audioProgress}%` }} />
                </div>
                <div className="flex items-center justify-center gap-6">
                  <button className="text-zinc-400 hover:text-zinc-800 transition-all text-sm cursor-pointer">⏪</button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-full bg-[#E11D48] text-white flex items-center justify-center font-bold text-lg hover:scale-105 transition-transform cursor-pointer shadow-md"
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button className="text-zinc-400 hover:text-zinc-800 transition-all text-sm cursor-pointer">⏩</button>
                </div>
              </div>
            </div>
          )}

          {format === 'video' && (
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden relative aspect-video flex flex-col justify-end shadow-md">
              <img 
                src={currentStory.videoFrames[videoFrameIndex]} 
                alt="Video Frame" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 rounded-full bg-[#E11D48]/90 text-white flex items-center justify-center text-xl hover:scale-110 transition-all shadow-xl cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
              )}

              {/* Captions */}
              <div className="relative p-6 space-y-4 z-10">
                <div className="bg-white/95 border border-zinc-200 rounded-2xl p-3.5 text-center max-w-xl mx-auto shadow-md">
                  <p className="text-xs sm:text-sm font-semibold text-zinc-850">
                    {videoFrameIndex === 0 && "🎙️ \"The US pushes restriction limits... lithography supply chain locks down.\""}
                    {videoFrameIndex === 1 && "💡 \"Suddenly, a breakthrough Nanoimprint process emerges from the shadows...\""}
                    {videoFrameIndex === 2 && "⚡ \"Geopolitics, semiconductor architecture, and absolute control...\""}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/90 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white transition-all text-xs font-black cursor-pointer">
                      {isPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <span>0:15 / 1:00</span>
                  </div>
                  <span className="text-[#F43F5E] font-black uppercase tracking-wider">AI Generated Visuals</span>
                </div>
              </div>
            </div>
          )}

          {/* Perspective Switcher */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-6 shadow-md text-left">
            <div>
              <h3 className="text-base font-black text-zinc-900 uppercase tracking-wider">Explore Alternate Angles</h3>
              <p className="text-xs text-zinc-500 mt-1">Different actors view this same event with completely different stakes.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(currentStory.perspectives).map((key) => {
                const data = currentStory.perspectives[key]
                return (
                  <button
                    key={key}
                    onClick={() => setActivePerspective(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                      activePerspective === key
                        ? 'bg-[#E11D48]/10 border-[#E11D48] text-[#E11D48]'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                    }`}
                  >
                    {data.title}
                  </button>
                )
              })}
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-left">
              <span className="text-[9px] font-black text-[#EC4899] uppercase tracking-widest block mb-2">
                {currentStory.perspectives[activePerspective].title} Stake
              </span>
              <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed">
                {currentStory.perspectives[activePerspective].text}
              </p>
            </div>
          </div>

        </div>

        {/* Right Columns: Narrator and Timeline info */}
        <div className="space-y-6 text-left">
          
          {/* Narrator Picker Panel */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 space-y-4 shadow-md">
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Choose Narrator Tone</h3>
              <p className="text-[11px] text-zinc-500 font-semibold mt-1">
                Select an AI voice persona to tailor the vocabulary and chatbot responses.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {['detective', 'comedian', 'professor', 'futurist'].map((key) => {
                const desc = {
                  detective: '🕵️ Sherlock AI',
                  comedian: '🎤 Sammy Stand-up',
                  professor: '🎓 Prof. Higgins',
                  futurist: '🤖 Cyberpunk AI'
                }

                return (
                  <button
                    key={key}
                    onClick={() => setActiveNarrator(key)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      activeNarrator === key
                        ? 'bg-[#E11D48]/20 border-[#E11D48] text-[#F43F5E] shadow-sm'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-605 hover:bg-zinc-100 hover:border-zinc-300 hover:text-zinc-800'
                    }`}
                  >
                    <span className="block text-xs font-bold capitalize">{desc[key]}</span>
                  </button>
                )
              })}
            </div>

            {/* Chat log / Narrator chatbot */}
            <div className="border-t border-zinc-200 pt-4 space-y-3">
              <div className="h-44 overflow-y-auto bg-zinc-50 rounded-xl p-3 border border-zinc-200 text-xs space-y-2.5 flex flex-col scrollbar-thin">
                {chatLog.length === 0 ? (
                  <div className="text-zinc-500 text-center my-auto font-semibold">
                    Ask a question about this geopolitical incident to begin narration feedback.
                  </div>
                ) : (
                  chatLog.map((chat, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`max-w-[85%] rounded-xl p-2.5 leading-relaxed text-xs font-medium ${
                        chat.sender === 'user'
                          ? 'bg-[#E11D48] text-white self-end'
                          : 'bg-white text-zinc-800 border border-zinc-150 self-start'
                      }`}
                    >
                      {chat.sender !== 'user' && (
                        <span className="block font-black text-[8px] text-[#EC4899] mb-1 tracking-widest uppercase">
                          {chat.name}
                        </span>
                      )}
                      <p>{chat.text}</p>
                    </motion.div>
                  ))
                )}
              </div>

              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Type a query or question..."
                  className="flex-1 bg-white border border-zinc-200 focus:border-[#E11D48] rounded-xl px-3 py-2 text-xs text-zinc-850 focus:outline-none transition-all placeholder-zinc-400 font-semibold"
                />
                <button 
                  type="submit"
                  className="bg-[#E11D48] hover:bg-[#F43F5E] text-white font-black text-xs px-4 rounded-xl shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                >
                  Ask
                </button>
              </form>
            </div>
          </div>

          {/* Predict Next Chapter */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 space-y-4 shadow-md">
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Predict Next Chapter</h3>
              <p className="text-[11px] text-zinc-500 font-semibold mt-1">
                Cast your projection. User community votes decide where the plot progresses.
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-zinc-700 block leading-relaxed">{currentStory.whatNext.question}</span>
              <div className="space-y-2">
                {['optA', 'optB', 'optC'].map((optKey) => {
                  const option = currentStory.whatNext.options.find(o => o.id === optKey)
                  const totalVotes = voteCount.optA + voteCount.optB + voteCount.optC
                  const percentage = Math.round((voteCount[optKey] / totalVotes) * 100)
                  return (
                    <button
                      key={optKey}
                      onClick={() => castVote(optKey)}
                      disabled={voted}
                      className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition-all group cursor-pointer ${
                        voted 
                          ? 'border-zinc-200 bg-zinc-50' 
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div 
                        className="absolute inset-y-0 left-0 bg-[#E11D48]/10 transition-all duration-500" 
                        style={{ width: voted ? `${percentage}%` : '0%' }}
                      />
                      <div className="relative flex justify-between items-center text-xs font-bold">
                        <span className="text-zinc-700 pr-4">{option?.text}</span>
                        {voted && <span className="text-[#EC4899] font-black">{percentage}%</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Episodes list */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 space-y-4 shadow-md">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Timeline Episodes</h3>
            <div className="space-y-2">
              {episodes.map((ep, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    ep.isToday 
                      ? 'border-[#E11D48] bg-[#E11D48]/5 text-[#E11D48]' 
                      : 'border-zinc-200 bg-zinc-50'
                  }`}
                >
                  <span className="font-bold text-zinc-700">Ep {ep.num}: {ep.title}</span>
                  <span className={`text-[10px] font-black uppercase ${ep.isToday ? 'text-[#F43F5E]' : 'text-zinc-500'}`}>
                    {ep.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
