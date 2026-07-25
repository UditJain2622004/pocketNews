import React from 'react'

export default function Dashboard({
  currentStory,
  episodes,
  setShowLanding,
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
  demoWaveHeight,
  user,
  onLogout
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased overflow-x-hidden relative selection:bg-[#7C3AED]/20 selection:text-slate-900">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowLanding(true)}
              className="mr-2 text-slate-650 hover:text-slate-900 text-sm flex items-center gap-1 font-semibold"
            >
              ← <span className="hidden sm:inline">Home</span>
            </button>
            <img src="/logo.png" className="w-12 h-12 object-contain rounded-xl" alt="StoryCast AI Logo" />
            <div>
              <span className="text-base sm:text-xl font-bold tracking-tight text-slate-800">StoryCast AI</span>
              <span className="block text-[8px] sm:text-[9px] text-[#7C3AED] font-bold tracking-widest uppercase">Cinematic News Engine</span>
            </div>
          </div>

          {/* User profile / Personalization controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="hidden lg:flex flex-wrap gap-1 max-w-[200px] justify-end">
                {user.topics?.map(topic => (
                  <span key={topic} className="px-2 py-0.5 bg-[#7C3AED]/10 text-[#7C3AED] rounded-md text-[9px] font-bold uppercase tracking-wider">
                    {topic}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-2 sm:px-3 py-1.5 rounded-2xl shadow-sm">
              <div className="text-right hidden md:block">
                <span className="block text-xs font-semibold text-slate-700">Persona Editor</span>
                <span className="block text-[10px] text-slate-500">{profession} • {level}</span>
              </div>
              <select 
                value={profession} 
                onChange={(e) => setProfession(e.target.value)}
                className="bg-white border border-slate-200 text-[11px] sm:text-xs text-slate-750 rounded-lg px-1.5 sm:px-2 py-1 focus:outline-none focus:border-[#7C3AED]"
              >
                <option>Software Engineer</option>
                <option>Student</option>
                <option>Investor</option>
                <option>Creative Writer</option>
              </select>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)}
                className="bg-white border border-slate-200 text-[11px] sm:text-xs text-slate-750 rounded-lg px-1.5 sm:px-2 py-1 focus:outline-none focus:border-[#7C3AED]"
              >
                <option>Analogy-driven</option>
                <option>Standard Narrative</option>
                <option>Deep Dive</option>
              </select>
            </div>

            {user ? (
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-2 sm:px-3 py-1.5 rounded-2xl shadow-sm">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-bold text-slate-800">@{user.username}</span>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">{user.language}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="px-3 py-1 text-[11px] font-bold text-red-650 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Hero Header Story Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/15 uppercase tracking-wider">
            {currentStory.topic}
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-slate-500 text-xs font-medium">{currentStory.season}</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
          {currentStory.title}
        </h1>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Formats & Content Player */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Format Switcher */}
            <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex gap-2 shadow-sm">
              <button
                onClick={() => { setFormat('text'); setIsPlaying(false); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  format === 'text'
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : 'text-slate-605 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>📖</span> Immersive Text
              </button>
              <button
                onClick={() => setFormat('audio')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  format === 'audio'
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : 'text-slate-605 hover:text-slate-805 hover:bg-slate-55'
                }`}
              >
                <span>🎙️</span> Audio Podcast
              </button>
              <button
                onClick={() => setFormat('video')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  format === 'video'
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : 'text-slate-605 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>🎬</span> Short Video
              </button>
            </div>

            {/* Immersive Cinematic Text Player */}
            {format === 'text' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-2 bg-[#7C3AED]/5 border border-[#7C3AED]/10 rounded-xl px-4 py-2 text-[11px] text-[#7C3AED]">
                  <span>✨</span> Tailoring explanations for <strong>{profession}</strong> ({level} mode).
                </div>

                <div className="space-y-6 text-left">
                  {/* Hook */}
                  <div className="relative pl-6 border-l-2 border-[#7C3AED]">
                    <span className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-[#7C3AED]" />
                    <span className="text-[10px] text-[#7C3AED] font-bold uppercase tracking-wider block mb-1">The Hook</span>
                    <p className="text-lg text-slate-850 font-semibold leading-relaxed">{currentStory.narrative.hook}</p>
                  </div>

                  {/* Context */}
                  <div className="relative pl-6 border-l-2 border-indigo-500/50">
                    <span className="text-[10px] text-indigo-550 font-bold uppercase tracking-wider block mb-1">The Context</span>
                    <p className="text-slate-650 leading-relaxed">
                      {currentStory.narrative.context} 
                      {profession === 'Software Engineer' && <span className="text-[#7C3AED] font-medium ml-1">Specifically, Extreme Ultraviolet wavelengths sit at 13.5nm, projecting stencils directly onto wafers with atomic precision.</span>}
                      {profession === 'Student' && <span className="text-[#7C3AED] font-medium ml-1">Think of it like trying to draw micro-details on a grain of rice using a laser instead of a pen.</span>}
                    </p>
                  </div>

                  {/* Conflict */}
                  <div className="relative pl-6 border-l-2 border-amber-500/50">
                    <span className="text-[10px] text-[#F97316] font-bold uppercase tracking-wider block mb-1">The Conflict</span>
                    <p className="text-slate-650 leading-relaxed">{currentStory.narrative.conflict}</p>
                  </div>

                  {/* Climax */}
                  <div className="relative pl-6 border-l-2 border-[#EC4899]/50">
                    <span className="text-[10px] text-[#EC4899] font-bold uppercase tracking-wider block mb-1">The Climax</span>
                    <p className="text-slate-650 leading-relaxed font-semibold">{currentStory.narrative.climax}</p>
                  </div>

                  {/* Takeaway */}
                  <div className="relative pl-6 border-l-2 border-emerald-550/50">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mb-1">The Takeaway</span>
                    <p className="text-slate-650 leading-relaxed">{currentStory.narrative.takeaway}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Podcast Player Simulator */}
            {format === 'audio' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col items-center text-center shadow-sm">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] flex items-center justify-center shadow-2xl relative group">
                  <span className="text-4xl">🎙️</span>
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center gap-1">
                      <span className="w-1 bg-white rounded-full animate-bounce h-8" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1 bg-white rounded-full animate-bounce h-12" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1 bg-white rounded-full animate-bounce h-6" style={{ animationDelay: '0.3s' }} />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">The Silicon Shield Podcast</h3>
                  <p className="text-xs text-violet-650 font-medium">Narrated by: {activeNarrator.toUpperCase()}</p>
                </div>

                {/* Simulated Waveform */}
                <div className="w-full h-12 flex items-end justify-center gap-[3px] py-2">
                  {demoWaveHeight.map((h, idx) => (
                    <span
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-150 ${isPlaying ? 'bg-[#7C3AED]' : 'bg-slate-300'}`}
                      style={{ height: isPlaying ? `${h}px` : '12px' }}
                    />
                  ))}
                </div>

                {/* Player Controls */}
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>1:24</span>
                    <span>4:15</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden cursor-pointer">
                    <div className="bg-[#7C3AED] h-1.5 rounded-full transition-all duration-300" style={{ width: `${audioProgress}%` }} />
                  </div>
                  <div className="flex items-center justify-center gap-6">
                    <button className="text-slate-400 hover:text-slate-850 text-lg">⏪</button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xl hover:scale-105 transition-transform"
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <button className="text-slate-400 hover:text-slate-850 text-lg">⏩</button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Player Simulator */}
            {format === 'video' && (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden relative aspect-video flex flex-col justify-end shadow-sm">
                <img 
                  src={currentStory.videoFrames[videoFrameIndex]} 
                  alt="Video Frame" 
                  className="absolute inset-0 w-full h-full object-cover opacity-90 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-905 via-transparent to-black/10" />

                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={() => setIsPlaying(true)}
                      className="w-16 h-16 rounded-full bg-[#7C3AED]/90 text-white flex items-center justify-center text-2xl hover:scale-110 transition-all shadow-xl"
                    >
                      ▶️
                    </button>
                  </div>
                )}

                {/* Captions */}
                <div className="relative p-6 space-y-4">
                  <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-3 text-center max-w-xl mx-auto shadow">
                    <p className="text-sm font-semibold text-slate-800">
                      {videoFrameIndex === 0 && "🎙️ \"The US pushes restriction limits... lithography supply chain locks down.\""}
                      {videoFrameIndex === 1 && "💡 \"Suddenly, a breakthrough Nanoimprint process emerges from the shadows...\""}
                      {videoFrameIndex === 2 && "⚡ \"Geopolitics, semiconductor architecture, and absolute control...\""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-650">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-black text-sm">
                        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                      </button>
                      <span>0:15 / 1:00</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#7C3AED] tracking-wider">AI Generated Visuals</span>
                  </div>
                </div>
              </div>
            )}

            {/* Perspective Switcher Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Explore Alternate Angles</h3>
                <p className="text-xs text-slate-500 mt-1">Different actors view this same event with completely different stakes.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(currentStory.perspectives).map((key) => {
                  const data = currentStory.perspectives[key]
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePerspective(key)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        activePerspective === key
                          ? 'bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED]'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {data.title}
                    </button>
                  )
                })}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left">
                <span className="text-[10px] font-bold text-[#EC4899] uppercase tracking-widest block mb-2">
                  {currentStory.perspectives[activePerspective].title} Stake
                </span>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {currentStory.perspectives[activePerspective].text}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Narrators, Timeline, Future, Graph */}
          <div className="space-y-6 text-left">
            
            {/* Narrator Picker Panel */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-800">Choose Your Narrator</h3>
                <p className="text-xs text-slate-500">Selected narrator formats the tone and answers your questions.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {['detective', 'comedian', 'professor', 'futurist'].map((key) => {
                  const desc = {
                    detective: 'Noir Detective Vance',
                    comedian: 'Comedian Stand-up Sam',
                    professor: 'Academic Prof. Higgins',
                    futurist: 'AI Chronos-9'
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveNarrator(key)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                        activeNarrator === key
                          ? 'bg-[#7C3AED]/5 border-[#7C3AED] text-[#7C3AED] shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs font-bold capitalize">{desc[key]}</span>
                    </button>
                  )
                })}
              </div>

              {/* Chat / Ask Narrator Widget */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="h-44 overflow-y-auto bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2 flex flex-col">
                  {chatLog.length === 0 ? (
                    <div className="text-slate-400 text-center my-auto">
                      Ask a question above to start an ongoing narrative session with your narrator.
                    </div>
                  ) : (
                    chatLog.map((chat, idx) => (
                      <div 
                        key={idx} 
                        className={`max-w-[85%] rounded-xl p-2.5 ${
                          chat.sender === 'user'
                            ? 'bg-[#7C3AED] text-white self-end'
                            : 'bg-white text-slate-700 border border-slate-200 self-start'
                        }`}
                      >
                        {chat.sender !== 'user' && <span className="block font-bold text-[9px] text-[#EC4899] mb-1">{chat.name}</span>}
                        <p>{chat.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Ask about this event..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#7C3AED] text-slate-700"
                  />
                  <button 
                    type="submit"
                    className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold text-xs px-3 rounded-xl"
                  >
                    Ask
                  </button>
                </form>
              </div>
            </div>

            {/* Predict Future Scenarios Widget */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-800">Future Scenario Simulator</h3>
                <p className="text-xs text-slate-500">Predict the next chapter. Your vote impacts the story progression.</p>
              </div>

              <div className="bg-slate-55 border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-700">{currentStory.whatNext.question}</span>
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
                        className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white relative overflow-hidden group transition-all"
                      >
                        <div 
                          className="absolute inset-y-0 left-0 bg-[#7C3AED]/10 transition-all duration-500" 
                          style={{ width: voted ? `${percentage}%` : '0%' }}
                        />
                        <div className="relative flex justify-between items-center text-xs font-medium">
                          <span className="text-slate-650 pr-4">{option?.text}</span>
                          {voted && <span className="text-[#EC4899] font-bold">{percentage}%</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Timelines and Connections */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-800">Timeline Episodes</h3>
              <div className="space-y-2">
                {episodes.map((ep, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${ep.isToday ? 'border-[#7C3AED]' : 'border-slate-100 bg-slate-50'}`}>
                    <span className="font-semibold text-slate-800">Ep {ep.num}: {ep.title}</span>
                    <span className="text-[10px] text-slate-400">{ep.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
