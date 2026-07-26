import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE } from '../api'

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const slideUpItem = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24
    }
  }
}

export default function HomeTab({ onPlayStory, user, onTabChange, storiesList = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStoryIdx, setActiveStoryIdx] = useState(0)

  const token = localStorage.getItem('token')
  const [catchUp, setCatchUp] = useState(null)
  const [showCatchUpModal, setShowCatchUpModal] = useState(false)
  const [challenge, setChallenge] = useState(null)
  const [challengeAnswers, setChallengeAnswers] = useState({})
  const [challengePrediction, setChallengePrediction] = useState(null)
  const [challengeResult, setChallengeResult] = useState(null)
  const [showGame, setShowGame] = useState(false)
  const [followedTopics, setFollowedTopics] = useState([])
  const [timelineTopic, setTimelineTopic] = useState(null)
  const [timelineData, setTimelineData] = useState([])

  useEffect(() => {
    if (!token) return
    
    // Fetch catch-up
    fetch(`${API_BASE}/api/dashboard/catch-up`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.missedUpdates > 0) setCatchUp(data)
      })
      
    // Fetch followed topics
    fetch(`${API_BASE}/api/topics/followed`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : { topics: [] })
      .then(data => setFollowedTopics(data.topics || []))
      
    // Fetch challenge
    fetch(`${API_BASE}/api/game/challenge`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setChallenge(data))
  }, [token])

  const submitChallenge = async () => {
    if (!token || !challenge) return
    const answersArray = Object.entries(challengeAnswers).map(([qId, val]) => ({
      questionId: qId,
      selectedOptionId: val
    }))
    
    try {
      const response = await fetch(`${API_BASE}/api/game/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          challengeId: challenge.challengeId,
          answers: answersArray,
          prediction: challengePrediction || 'a'
        })
      })
      if (response.ok) {
        const data = await response.json()
        setChallengeResult(data)
      }
    } catch (_) {}
  }

  const followTopic = async (topic) => {
    if (!token) return
    try {
      await fetch(`${API_BASE}/api/topics/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic }),
      })
      setFollowedTopics(prev => [...prev, topic])
    } catch (_) {}
  }

  const showTopicTimeline = async (topic) => {
    setTimelineTopic(topic)
    setTimelineData([])
    try {
      const response = await fetch(`${API_BASE}/api/topics/${encodeURIComponent(topic)}/timeline`)
      if (response.ok) {
        const data = await response.json()
        setTimelineData(data.timeline || [])
      }
    } catch (_) {}
  }

  // Autoplay carousel slide rotation every 6 seconds
  useEffect(() => {
    if (!storiesList || storiesList.length <= 1) return

    const timer = setTimeout(() => {
      setActiveStoryIdx(prev => (prev + 1) % storiesList.length)
    }, 6000)

    return () => clearTimeout(timer)
  }, [activeStoryIdx, storiesList])

  const handleNextStory = () => {
    setActiveStoryIdx(prev => (prev + 1) % storiesList.length)
  }

  const handlePrevStory = () => {
    setActiveStoryIdx(prev => (prev - 1 + storiesList.length) % storiesList.length)
  }

  const featuredDrama = storiesList[activeStoryIdx] || {}

  const filteredDramas = (storiesList || []).filter(d => {
    return d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           d.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const renderNewsRow = (title, dramas) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-black text-zinc-950 tracking-wide uppercase">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dramas.map((drama, idx) => (
            <motion.div 
              key={drama.id} 
              onClick={() => onPlayStory(drama.id)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.97 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 18,
                opacity: { duration: 0.2, delay: idx * 0.04 }
              }}
              className="relative aspect-[3/2] rounded-2xl bg-zinc-900 overflow-hidden cursor-pointer shadow-lg border border-zinc-200/80 hover:border-zinc-400 group z-10 hover:z-20"
            >
              {/* Shimmer sweep reflection on hover */}
              <div className="shimmer-shine" />

              {/* Graphical Poster Background */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={drama.videoFrames && drama.videoFrames[0] ? drama.videoFrames[0] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  alt={drama.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 z-10" />
              </div>

              {/* Card Details Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-20">
                
                {/* Top red play statistics badge */}
                <div className="self-end">
                  <span className="px-2.5 py-1 rounded-md bg-[#EF4444] text-white text-xs font-black tracking-wider flex items-center gap-1">
                    {drama.date || '25-07-2026'} <span className="text-[9px]">⏵</span>
                  </span>
                </div>

                {/* Bottom title display inside poster */}
                <div className="text-left space-y-1">
                  <div className="flex items-center">
                    <span className="px-2.5 py-0.5 rounded bg-black/35 text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-sm inline-block">
                      {drama.category}
                    </span>
                    {token && !followedTopics.includes(drama.category) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); followTopic(drama.category); }}
                        className="ml-2 px-2.5 py-0.5 rounded bg-white/20 hover:bg-white/40 text-[9px] font-black text-white uppercase tracking-wider backdrop-blur-sm cursor-pointer border-none transition-all hover:scale-105"
                      >
                        Follow +
                      </button>
                    )}
                  </div>
                  {/* {drama.date && <p className="text-[10px] font-bold text-zinc-200/90 tracking-wide">{drama.date}</p>} */}
                  <h3 className="text-base font-black text-white tracking-wide uppercase leading-tight drop-shadow-md">
                    {drama.title.split(':')[0]}
                  </h3>
                  <p className="text-[11px] font-bold text-zinc-200/90 truncate tracking-wide">
                    {drama.topic}
                  </p>
                </div>
              </div>

              {/* Hover overlay play icon */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <span className="text-base pl-0.5">▶</span>
                </div>
              </div>
            </motion.div>
          ))}

          {dramas.length === 0 && (
            <div className="col-span-full py-8 text-center bg-[#121214] border border-dashed border-[#27272A] rounded-2xl text-xs text-zinc-500 font-semibold">
              No shows available.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-2 text-zinc-800 text-left bg-transparent">
      
      {/* 1. Catch-up Banner */}
      {catchUp && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-fuchsia-600 to-pink-500 p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <span className="bg-white/20 border border-white/10 px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider">
              Catch Up Briefing ⚡
            </span>
            <p className="text-base sm:text-lg font-extrabold max-w-2xl leading-snug">
              {catchUp.summary}
            </p>
          </div>
          <button
            onClick={() => setShowCatchUpModal(true)}
            className="shrink-0 px-6 py-3 bg-white text-pink-600 hover:scale-105 hover:shadow-lg transition text-xs font-black rounded-full uppercase tracking-wider cursor-pointer border-none"
          >
            View Missed Updates ➔
          </button>
        </motion.div>
      )}

      {/* 2. Catch-up Modal */}
      {showCatchUpModal && catchUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowCatchUpModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 text-lg cursor-pointer border-none bg-transparent"
            >
              ✕
            </button>
            <div className="space-y-2">
              <span className="text-xs font-black text-fuchsia-600 uppercase tracking-wider block">Missed Briefings</span>
              <h3 className="text-2xl font-black text-zinc-950">You missed {catchUp.missedUpdates} important updates</h3>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-none">
              {catchUp.stories.map((story) => (
                <div key={story.storyId} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-150 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-pink-600 uppercase tracking-wider">{story.category}</span>
                  <h4 className="text-sm font-extrabold text-zinc-900">{story.title}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed mt-1">{story.summary}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowCatchUpModal(false);
                // Play first story
                if (catchUp.stories[0]) onPlayStory(catchUp.stories[0].storyId);
              }}
              className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:brightness-110 text-white rounded-full font-black uppercase tracking-wider transition cursor-pointer border-none text-center block text-xs"
            >
              Play Missed Stories 🎧
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => setShowGame(!showGame)}
          className="px-5 py-2.5 bg-white border border-zinc-300 hover:border-[#E11D48]/45 hover:text-[#E11D48] text-zinc-700 text-xs font-black rounded-full uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-2"
        >
          🎮 {showGame ? 'Hide Challenge' : 'Daily News Challenge'}
        </button>
      </div>

      {showGame && challenge && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-md space-y-6"
        >
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
            <div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">Daily Challenge</span>
              <h3 className="text-xl font-black text-zinc-950">Daily News Challenge</h3>
            </div>
            {challengeResult && (
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full">🔥 Streak: {challengeResult.streak}</span>
                {challengeResult.newBadges.map(b => (
                  <span key={b} className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">🏅 Badge: {b}</span>
                ))}
              </div>
            )}
          </div>

          {!challengeResult ? (
            <div className="space-y-6">
              {challenge.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2.5">
                  <h4 className="text-sm font-extrabold text-zinc-800">{idx + 1}. {q.question}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setChallengeAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition ${
                          challengeAnswers[q.id] === opt.id
                            ? 'bg-[#E11D48]/10 border-[#E11D48] text-[#E11D48]'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100/50'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Prediction question */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-200/80">
                <span className="text-[10px] font-black text-[#E11D48] uppercase tracking-wider block">Bonus Prediction</span>
                <h4 className="text-sm font-extrabold text-zinc-800">{challenge.prediction.question}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {challenge.prediction.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setChallengePrediction(opt.id)}
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition ${
                        challengePrediction === opt.id
                          ? 'bg-[#E11D48]/10 border-[#E11D48] text-[#E11D48]'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100/50'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={submitChallenge}
                disabled={Object.keys(challengeAnswers).length < challenge.questions.length || !challengePrediction}
                className="w-full py-3 bg-[#E11D48] hover:bg-[#F43F5E] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white rounded-full font-black uppercase tracking-wider transition cursor-pointer border-none text-xs"
              >
                Submit Answers ➔
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-3xl block">🎉</span>
                <h4 className="text-base font-black text-emerald-800 mt-2">Challenge Completed!</h4>
                <p className="text-xs text-emerald-700 font-bold mt-1">You got {challengeResult.correctCount} / 3 trivia questions correct.</p>
              </div>
              
              {challengeResult.allBadges && challengeResult.allBadges.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Your Badges:</span>
                  <div className="flex flex-wrap gap-2">
                    {challengeResult.allBadges.map((badge) => (
                      <span key={badge} className="px-4 py-2 bg-gradient-to-tr from-amber-500 to-orange-600 text-white text-[11px] font-extrabold rounded-xl shadow-sm">
                        🏅 {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setChallengeResult(null); setChallengeAnswers({}); setChallengePrediction(null); }}
                className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full font-black uppercase tracking-wider transition cursor-pointer border-none text-xs"
              >
                Play Again Tomorrow
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* 4. Developing Stories Timeline shelf */}
      {followedTopics.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-zinc-450 uppercase tracking-widest">Followed Stories</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
            {followedTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => showTopicTimeline(topic)}
                className={`px-4 py-2 bg-white border rounded-full text-xs font-extrabold transition cursor-pointer shadow-sm ${
                  timelineTopic === topic ? 'border-[#E11D48] text-[#E11D48]' : 'border-zinc-200 text-zinc-700 hover:border-[#E11D48]/40'
                }`}
              >
                🔴 {topic} Timeline
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Side modal/panel */}
      {timelineTopic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-end z-50 animate-fadeIn">
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            className="bg-white w-full max-w-md h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative"
          >
            <button 
              onClick={() => setTimelineTopic(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 text-lg cursor-pointer border-none bg-transparent"
            >
              ✕
            </button>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="space-y-1 pb-4 border-b border-zinc-200/80">
                <span className="text-xs font-black text-[#E11D48] uppercase tracking-wider block">Developing Story Timeline</span>
                <h3 className="text-2xl font-black text-zinc-950">{timelineTopic} Updates</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-none py-6 space-y-6 min-h-0">
                {timelineData.length > 0 ? (
                  timelineData.map((item, index) => (
                    <div key={item.storyId} className="relative pl-6 border-l-2 border-zinc-200 flex flex-col gap-1.5 group cursor-pointer" onClick={() => { setTimelineTopic(null); onPlayStory(item.storyId); }}>
                      <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-[#E11D48] ring-4 ring-[#E11D48]/10 transition-transform group-hover:scale-125" />
                      <span className="text-[10px] font-black text-zinc-400">{item.date}</span>
                      <h4 className="text-sm font-extrabold text-zinc-900 group-hover:text-[#E11D48] transition-colors">{item.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{item.summary}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-bold text-zinc-400">Loading timeline...</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setTimelineTopic(null)}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full font-black uppercase tracking-wider transition cursor-pointer border-none text-xs"
            >
              Close Timeline
            </button>
          </motion.div>
        </div>
      )}

      {/* Featured Banner (Hero Section styled exactly like Pocket FM screenshot in light mode) */}
      {featuredDrama.id && (
        <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-md border border-white/50 shadow-md min-h-[380px] flex items-center group w-full">
          {/* Main Layout Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStoryIdx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-12 w-full h-full relative z-20"
            >
            
            {/* Left side text column */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="md:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-5"
            >
              
              {/* Badges row */}
              <motion.div variants={slideUpItem} className="flex flex-wrap items-center gap-3">
                <span className="text-yellow-600 font-extrabold text-xs uppercase tracking-wider">
                  {featuredDrama.plays || '391M'} Plays
                </span>
                <span className="text-zinc-400 text-xs">•</span>
                <span className="bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded text-xs font-black text-zinc-700">
                  ★ {featuredDrama.rating || '4.9'}
                </span>
                <span className="text-zinc-400 text-xs">•</span>
                <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">
                  {featuredDrama.category || 'DRAMA'}
                </span>
                <span className="text-zinc-400 text-xs">•</span>
                <span className="bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded text-xs font-black text-zinc-650">
                  U/A 13+
                </span>
              </motion.div>

              {/* Title Block */}
              <motion.div variants={slideUpItem} className="space-y-1">
                <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-widest uppercase leading-none drop-shadow-sm">
                  {featuredDrama.title.split(':')[0]}
                </h1>
                <p className="text-base font-bold text-[#F43F5E] tracking-wider uppercase">
                  {featuredDrama.topic}
                </p>
              </motion.div>

              {/* Description */}
              <motion.p variants={slideUpItem} className="text-zinc-600 text-sm leading-relaxed max-w-md font-medium">
                {featuredDrama.summary}
              </motion.p>

              {/* Play & Info Buttons */}
              <motion.div variants={slideUpItem} className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  onClick={() => onPlayStory(featuredDrama.id)}
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(225, 29, 72, 0.5)" }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="px-8 py-3 bg-[#E11D48] hover:bg-[#F43F5E] text-white text-sm font-black rounded-full uppercase tracking-wider shadow-md cursor-pointer border-none"
                >
                  Play Now
                </motion.button>
                <motion.button 
                  onClick={() => onPlayStory(featuredDrama.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="px-6 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-250 text-zinc-700 hover:text-zinc-900 text-sm font-black rounded-full uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  More Info
                </motion.button>
              </motion.div>

              {/* Sub-label tags */}
              <motion.div variants={slideUpItem} className="text-xs text-zinc-450 font-bold uppercase tracking-wider mt-2 space-y-0.5">
                <span className="block text-zinc-500">Season: {featuredDrama.season}</span>
                <span className="block text-zinc-500">Narrator: Sherlock AI & Cyberpunk DJ</span>
              </motion.div>
            </motion.div>

            {/* Right side graphical representation / cover */}
            <div className="md:col-span-6 relative overflow-hidden min-h-[340px] md:min-h-full bg-zinc-950">
              <img 
                src={featuredDrama.videoFrames && featuredDrama.videoFrames[1] ? featuredDrama.videoFrames[1] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} 
                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-[8000ms] group-hover:scale-108" 
                alt="Banner Art"
              />
              {/* Radial gradient mask to blend with left page */}
              <div className="absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-white via-white/80 to-transparent z-10 hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent z-10" />

              {/* High-fidelity watermark display of story categories */}
              <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center z-0 select-none">
                <span className="text-[100px] font-black text-black/5 uppercase leading-none tracking-tighter select-none">
                  {featuredDrama.tag}
                </span>
                <span className="text-xs font-bold text-black/10 uppercase tracking-widest mt-2 select-none">
                  Pocket News Original Broadcast
                </span>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

          {/* Carousel Navigator Controls */}
          {/* <div className="absolute bottom-6 right-6 sm:right-16 flex items-center gap-3.5 z-30">
            <button 
              onClick={handlePrevStory}
              className="w-8 h-8 rounded-full bg-white/75 hover:bg-white border border-zinc-300 text-zinc-700 flex items-center justify-center text-xs transition-all cursor-pointer shadow-md"
            >
              ⟨
            </button>
            
            <div className="flex gap-2 items-center">
              {storiesList.map((story, idx) => (
                <div 
                  key={story.id} 
                  onClick={() => setActiveStoryIdx(idx)}
                  className={`w-14 h-10 rounded-lg bg-gradient-to-br ${story.color} cursor-pointer transition-all overflow-hidden relative shrink-0 ${
                    idx === activeStoryIdx 
                      ? 'border-2 border-[#E11D48] scale-105 shadow-md' 
                      : 'border border-zinc-350 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center p-1">
                    <span className="text-[9px] font-black text-white uppercase tracking-wider text-center line-clamp-2">
                      {story.title.split(':')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleNextStory}
              className="w-8 h-8 rounded-full bg-white/75 hover:bg-white border border-zinc-300 text-zinc-700 flex items-center justify-center text-xs transition-all cursor-pointer shadow-md"
            >
              ⟩
            </button>
          </div> */}
        </div>
      )}

      {/* Main Show Cards Rows */}
      <div className="space-y-12">
        {renderNewsRow(user ? 'Daily episodes' : 'Available episodes', filteredDramas)}
      </div>

      {/* Quick Stats section */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <motion.div 
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 flex items-center gap-3 shadow-md cursor-pointer"
        >
          <motion.div whileHover={{ scale: 1.25, rotate: 10 }} className="text-xl select-none">🎙️</motion.div>
          <div>
            <span className="block text-xs font-black text-zinc-400 uppercase tracking-widest">Top Voice Cast</span>
            <span className="block text-sm font-bold text-zinc-700 mt-0.5">Sherlock AI, Neo-V, Sammy Sarcasm</span>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 flex items-center gap-3 shadow-md cursor-pointer"
        >
          <motion.div whileHover={{ scale: 1.25, rotate: 10 }} className="text-xl select-none">⚡</motion.div>
          <div>
            <span className="block text-xs font-black text-zinc-400 uppercase tracking-widest">Daily Updates</span>
            <span className="block text-sm font-bold text-zinc-700 mt-0.5">Fresh cinematic news every morning</span>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 flex items-center gap-3 shadow-md cursor-pointer"
        >
          <motion.div whileHover={{ scale: 1.25, rotate: 10 }} className="text-xl select-none">🎧</motion.div>
          <div>
            <span className="block text-xs font-black text-zinc-400 uppercase tracking-widest">Audio Quality</span>
            <span className="block text-sm font-bold text-zinc-700 mt-0.5">Lossless Dolby Atmos Simulation</span>
          </div>
        </motion.div>
      </div> */}

    </div>
  )
}
