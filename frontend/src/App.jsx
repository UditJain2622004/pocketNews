import { useState, useEffect } from 'react'

// All data structures for StoryCast AI Landing Page and App Dashboard
const storytellers = [
  { id: 'sherlock', name: 'Sherlock AI', avatar: '🕵️‍♂️', role: 'Detective', preview: 'Follow the digital clues, kid. The silicon trail doesn\'t lie...' },
  { id: 'professor', name: 'Prof. Higgins', avatar: '🎓', role: 'Historian', preview: 'Historically speaking, this mimics the coal monopolies of 1880...' },
  { id: 'cyberpunk', name: 'Neo-V', avatar: '🤖', role: 'Cyberpunk AI', preview: 'System check: 1nm chip secured. Grid connection... online.' },
  { id: 'comedian', name: 'Sammy Sarcasm', avatar: '🎤', role: 'Comedian', preview: 'So ASML built a printer for $350 million. My office printer won\'t even scan!' },
  { id: 'sports', name: 'Coach Jax', avatar: '📣', role: 'Sports Commentator', preview: 'They\'re going deep into the semiconductor field, ladies and gentlemen!' },
  { id: 'journalist', name: 'Clara Kent', avatar: '✍️', role: 'Journalist', preview: 'Reporting live from the silicon trenches. Here is what they aren\'t saying...' },
  { id: 'anime', name: 'Kira-Chan', avatar: '✨', role: 'Anime Girl', preview: 'Nani?! A new microchip that controls light?! Kawaii!' },
  { id: 'captain', name: 'Captain Leo', avatar: '🚀', role: 'Space Captain', preview: 'Set course for the 1nm target. Warp speed in three, two, one...' }
]

const storyGenres = [
  { id: 'adventure', name: 'Adventure', icon: '⚔️', excerpt: "The journey was fraught with geopolitical blockades. ASML engineers worked through the night, guarding the precious blueprints like an ancient treasure." },
  { id: 'comedy', name: 'Comedy', icon: '🤡', excerpt: "So, the US asked the Netherlands nicely, 'Hey, can you block those shipments?' And the Dutch said, 'Sure, as long as we can keep our tulip trade safe!'" },
  { id: 'trailer', name: 'Movie Trailer', icon: '🍿', excerpt: "In a world ruled by silicon... one machine holds the key to the future. This summer, the light will bend. ASML: The 1nm Incident." },
  { id: 'detective', name: 'Detective', icon: '🕵️‍♂️', excerpt: "A mysterious client, a Carl Zeiss lens, and $350 million in unmarked bills. Vance lit a cigarette, staring at the circuit boards. Something was missing." },
  { id: 'podcast', name: 'Podcast', icon: '🎙️', excerpt: "Welcome back to TechTalk. Today, we're dissecting the quiet monopoly of EUV machines. Joining us is a Silicon Valley insider..." },
  { id: 'documentary', name: 'Documentary', icon: '📹', excerpt: "For decades, the silent village of Veldhoven remained unnoticed. Today, it stands as the technological center of the global semiconductor war." }
]

const episodes = [
  { num: 1, title: 'The Dutch Monopoly', date: 'June 10', active: true },
  { num: 2, title: 'TSMC\'s Fortress', date: 'June 18', active: true },
  { num: 3, title: 'The 1nm Breakthrough', date: 'July 05', active: true },
  { num: 4, title: 'Supercomputing War', date: 'Today', active: true, isToday: true },
  { num: 5, title: 'AI Sovereign Net', date: 'Upcoming', active: false, isFuture: true }
]

const graphNodes = [
  { id: 'asml', name: 'ASML', x: 150, y: 100, color: '#7C3AED' },
  { id: 'tsmc', name: 'TSMC', x: 380, y: 80, color: '#2563EB' },
  { id: 'nvidia', name: 'Nvidia', x: 260, y: 220, color: '#EC4899' },
  { id: 'usgov', name: 'US Gov', x: 100, y: 280, color: '#F97316' },
  { id: 'aireg', name: 'AI Regs', x: 420, y: 260, color: '#10B981' },
  { id: 'chips', name: '1nm Target', x: 550, y: 170, color: '#D97706' }
]

const graphConnections = [
  { from: 'asml', to: 'tsmc' },
  { from: 'asml', to: 'nvidia' },
  { from: 'tsmc', to: 'chips' },
  { from: 'nvidia', to: 'chips' },
  { from: 'usgov', to: 'asml' },
  { from: 'usgov', to: 'aireg' },
  { from: 'aireg', to: 'chips' }
]

function App() {
  const [showLanding, setShowLanding] = useState(true)
  
  // Hero morphing state
  const [heroMorphStep, setHeroMorphStep] = useState(0) // 0: Breaking, 1: Story, 2: Audio/Video
  
  // AI Story Demo Card states
  const [demoStep, setDemoStep] = useState(0) // 0: Headline, 1: Story morph, 2: Playing audio/wave
  const [demoWaveHeight, setDemoWaveHeight] = useState(Array(15).fill(8))
  
  // Storytellers states
  const [activeTeller, setActiveTeller] = useState('sherlock')
  
  // Genre carousel state
  const [activeGenre, setActiveGenre] = useState('adventure')
  
  // Interactive story quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  
  // Knowledge graph hover state
  const [hoveredNode, setHoveredNode] = useState(null)

  // App Dashboard specific states
  const [profession, setProfession] = useState('Software Engineer')
  const [level, setLevel] = useState('Deep Dive')
  const [format, setFormat] = useState('text')
  const [activeNarrator, setActiveNarrator] = useState('detective')
  const [activePerspective, setActivePerspective] = useState('investor')
  const [userQuestion, setUserQuestion] = useState('')
  const [chatLog, setChatLog] = useState([])
  const [voted, setVoted] = useState(false)
  const [voteCount, setVoteCount] = useState({ optA: 48, optB: 35, optC: 17 })

  // Audio simulation state
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(30)
  const [videoFrameIndex, setVideoFrameIndex] = useState(0)

  // Auto-rotate hero morphing & demo card steps
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroMorphStep(prev => (prev + 1) % 3)
    }, 4500)

    const demoTimer = setInterval(() => {
      setDemoStep(prev => (prev + 1) % 3)
    }, 5000)

    return () => {
      clearInterval(heroTimer)
      clearInterval(demoTimer)
    }
  }, [])

  // Simulated live waveform data
  useEffect(() => {
    if (isPlaying || demoStep === 2) {
      const waveTimer = setInterval(() => {
        setDemoWaveHeight(Array(15).fill(0).map(() => Math.floor(Math.random() * 28) + 6))
      }, 150)
      return () => clearInterval(waveTimer)
    }
  }, [isPlaying, demoStep])

  // Audio timer loop
  useEffect(() => {
    let interval
    if (isPlaying && format === 'audio') {
      interval = setInterval(() => {
        setAudioProgress(prev => (prev >= 100 ? 0 : prev + 1))
      }, 1000)
    } else if (isPlaying && format === 'video') {
      interval = setInterval(() => {
        setVideoFrameIndex(prev => (prev + 1) % 3)
      }, 2500)
    }
    return () => clearInterval(interval)
  }, [isPlaying, format])

  const handleAskQuestion = (e) => {
    e.preventDefault()
    if (!userQuestion.trim()) return

    const responses = {
      detective: "Follow the glass, kid. The lenses are made by Carl Zeiss. You control Zeiss, you control ASML. It's a supply chain mystery.",
      comedian: "Look, spending $350M on a printer just to play Doom at 10,000 FPS is peak humanity. My printer won't even connect to Wi-Fi!",
      professor: "Historically, this mimics the 19th-century race for steam turbine supremacy. The nations that controlled production dominated the globe.",
      futurist: "By 2045, silicon will be obsolete. We will compute on synthetic DNA. This 1nm war is just the final carbon-based hurdle."
    }

    const newLog = [
      ...chatLog,
      { sender: 'user', text: userQuestion },
      { sender: 'narrator', name: activeNarrator.toUpperCase(), text: responses[activeNarrator] || "Interesting perspective. Let's see how the plot unfolds." }
    ]
    setChatLog(newLog)
    setUserQuestion('')
  }

  const castVote = (opt) => {
    if (voted) return
    setVoteCount(prev => ({ ...prev, [opt]: prev[opt] + 1 }))
    setVoted(true)
  }

  const currentStory = stories[0]

  // -------------------------------------------------------------
  // LANDING PAGE RENDER
  // -------------------------------------------------------------
  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased overflow-x-hidden relative selection:bg-[#7C3AED]/20 selection:text-slate-905">
        
        {/* Apple-style background lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-80 pointer-events-none" />
        
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#7C3AED]/10 via-[#2563EB]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 1. NAVBAR */}
        <div className="fixed top-4 left-0 right-0 z-50 px-4">
          <nav className="max-w-5xl mx-auto pure-glass rounded-2xl px-6 h-16 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <svg className="w-9 h-9 shadow-sm shadow-[#7C3AED]/20 rounded-xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="nav-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="26" fill="url(#nav-logo-grad)" />
                <path d="M38 32 L68 50 L38 68 Z" fill="#ffffff" />
                <path d="M72 38 A 20 20 0 0 1 72 62" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
              </svg>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-800">StoryCast AI</span>
                <span className="block text-[8px] text-[#7C3AED] font-bold tracking-widest uppercase">Cinematic News Engine</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 text-sm font-bold text-slate-700">
              <a href="#features" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Features</a>
              <a href="#storytellers" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Storytellers</a>
              <a href="#graph" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Connected Universe</a>
              <a href="#stats" className="hover:bg-slate-200/50 hover:text-[#7C3AED] px-3.5 py-2 rounded-xl transition-all">Live Stats</a>
            </div>

            <button 
              onClick={() => setShowLanding(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 text-white transition-all shadow shadow-[#7C3AED]/25 hover:scale-105 active:scale-95"
            >
              Enter StoryCast
            </button>
          </nav>
        </div>

        {/* 2. HERO SECTION */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8 text-left z-10">
            {/* Tag badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#7C3AED]/5 text-[#7C3AED] border border-[#7C3AED]/15 uppercase">⚡ AI Generated</span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#2563EB]/5 text-[#2563EB] border border-[#2563EB]/15 uppercase">🎙️ Voice Narration</span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EC4899]/5 text-[#EC4899] border border-[#EC4899]/15 uppercase">🧠 Personalized</span>
            </div>

            <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.08] text-[#1D1D1F]">
              Stop Reading News.<br />
              Start <span className="bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F97316] bg-clip-text text-transparent">Living the Story.</span>
            </h1>

            <p className="text-slate-600 text-lg sm:text-xl max-w-xl leading-relaxed">
              StoryCast AI transforms today's dry headlines into personalized, cinematic podcasts and interactive experiences you will actually enjoy consuming.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => setShowLanding(false)}
                className="px-8 py-4 rounded-2xl text-base font-bold bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white transition-all shadow-lg shadow-[#7C3AED]/20 flex items-center gap-2 hover:-translate-y-0.5"
              >
                ✨ Try Today's Story
              </button>
              <a 
                href="#demo"
                className="px-8 py-4 rounded-2xl text-base font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition-all flex items-center gap-2"
              >
                ▶ Watch Demo
              </a>
            </div>
          </div>

          {/* Right Floating Phone Mockup - Apple Style */}
          <div className="lg:col-span-5 flex justify-center relative z-10">
            <div className="w-72 h-[560px] rounded-[42px] border-[6px] border-[#D2D2D7] bg-white shadow-2xl relative overflow-hidden animate-float glass-panel">
              {/* Phone Camera Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#D2D2D7] rounded-full z-20" />
              
              {/* Inside Mockup */}
              <div className="p-5 pt-8 space-y-5 flex flex-col justify-between h-full text-left">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded uppercase">Today's Episode</span>
                  <h3 className="text-xl font-bold text-[#1D1D1F] leading-tight">The AI Chip Monopoly Crisis</h3>
                  <p className="text-slate-650 text-[11px] leading-relaxed line-clamp-3">
                    Deep inside Carl Zeiss lab, engineers manipulate wavelengths at 13.5 nanometers. A quiet export ban has frozen global technology pipelines...
                  </p>
                </div>

                {/* Simulated Audio Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>🎙️ AI Detective Vance</span>
                    <span>1:12 / 2:43</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1">
                    <div className="bg-[#7C3AED] h-1 rounded-full w-[45%]" />
                  </div>
                  {/* Waveform */}
                  <div className="flex justify-center items-end gap-[2px] h-6 py-0.5">
                    {Array.from({ length: 22 }).map((_, i) => (
                      <span key={i} className="w-1 bg-[#7C3AED] rounded-full" style={{ height: `${Math.sin(i * 0.4) * 12 + 14}px` }} />
                    ))}
                  </div>
                </div>

                {/* Interactive Poll */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-700">Will ASML's Monopoly Break?</span>
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold">
                    <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 p-1.5 rounded-lg text-center text-[#7C3AED]">Yes (64%)</div>
                    <div className="bg-white border border-slate-200 p-1.5 rounded-lg text-center text-slate-500">No (36%)</div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowLanding(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 rounded-xl text-center text-xs font-bold text-white shadow-md"
                >
                  Continue Story
                </button>
              </div>
            </div>

            {/* Subtle glow behind phone */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-[#7C3AED]/10 to-[#EC4899]/10 rounded-full blur-2xl opacity-40 animate-pulse-slow pointer-events-none" />
          </div>

        </header>

        {/* STANDOUT HERO CONCEPT: MORPHING HERO HEADER */}
        <section className="max-w-4xl mx-auto px-4 pb-24 text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-sm backdrop-blur-md">
            <div className="absolute top-0 left-0 px-4 py-1 bg-[#7C3AED] text-white text-[9px] font-bold uppercase tracking-wider rounded-br-2xl">
              Live Translation Engine Concept
            </div>

            {heroMorphStep === 0 && (
              <div className="space-y-4 py-6 animate-fadeIn">
                <span className="text-rose-650 text-xs font-bold uppercase tracking-widest block">📰 Breaking News Headline</span>
                <h3 className="text-xl sm:text-2xl font-mono text-slate-750 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-2xl mx-auto italic">
                  "NVIDIA Corporation today announced the shipping details of its new Blackwell architecture AI chips."
                </h3>
              </div>
            )}

            {heroMorphStep === 1 && (
              <div className="space-y-4 py-6 animate-fadeIn">
                <span className="text-[#EC4899] text-xs font-bold uppercase tracking-widest block">🎬 Cinematic Story Adaption</span>
                <p className="text-slate-800 text-lg font-bold max-w-2xl mx-auto leading-relaxed">
                  "It began with a quiet announcement from a small tech pressroom... Within hours, every major AI laboratory in the world was racing to secure their share of the silicon future."
                </p>
              </div>
            )}

            {heroMorphStep === 2 && (
              <div className="space-y-4 py-6 animate-fadeIn flex flex-col items-center">
                <span className="text-emerald-650 text-xs font-bold uppercase tracking-widest block">🎙️ AI Narrator & Video Rendered</span>
                <div className="flex items-center gap-3 bg-[#7C3AED]/5 border border-[#7C3AED]/15 px-4 py-2 rounded-xl text-xs text-[#7C3AED] font-semibold mt-2">
                  <span className="flex gap-1 h-3 items-end">
                    <span className="w-0.5 bg-[#7C3AED] animate-wave-1 h-3" />
                    <span className="w-0.5 bg-[#7C3AED] animate-wave-2 h-3" />
                    <span className="w-0.5 bg-[#7C3AED] animate-wave-3 h-3" />
                  </span>
                  <span>Audio Playing: Vance (AI Detective)</span>
                </div>
                <p className="text-slate-600 text-xs max-w-md mt-2">
                  "The silicon trade isn't just about graphics cards anymore. It's the new battleground for global intelligence."
                </p>
              </div>
            )}

            <div className="flex justify-center gap-1.5 pt-2">
              <span className={`w-2 h-2 rounded-full transition-colors ${heroMorphStep === 0 ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} />
              <span className={`w-2 h-2 rounded-full transition-colors ${heroMorphStep === 1 ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} />
              <span className={`w-2 h-2 rounded-full transition-colors ${heroMorphStep === 2 ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} />
            </div>
          </div>
        </section>

        {/* 2. LIVE AI STORY DEMO CARD */}
        <section id="demo" className="max-w-5xl mx-auto px-4 py-24 border-t border-slate-200 space-y-8 text-center relative">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Watch The Magic Happen</h2>
            <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">Experience how StoryCast AI translates technical stats into immersive digital beats in real-time.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 text-left relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-6 mb-6 gap-4">
              <div>
                <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest">StoryCast AI Engine</span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">Live Translation Demo</h3>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${demoStep === 0 ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-slate-100 text-slate-400'}`}>
                  1. Raw Fact
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${demoStep === 1 ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20' : 'bg-slate-100 text-slate-400'}`}>
                  2. Story Morph
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${demoStep === 2 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-400'}`}>
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
                  <p className="text-slate-700 text-lg font-mono italic bg-slate-50 border border-slate-200 p-5 rounded-2xl">
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
                    <p className="text-slate-650 text-base leading-relaxed">
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
                    <span className="text-[10px] text-slate-405">Voice: Prof. Higgins</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                    <div className="w-16 h-16 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center text-3xl">
                      🎓
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <p className="text-sm font-semibold text-slate-800 italic">
                        "The computational leap we've observed today isn't just code; it's the genesis of a new cognitive era..."
                      </p>
                      {/* Waveform simulator */}
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

        {/* 3. WHY GEN Z DOESN'T READ NEWS */}
        <section className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Why Gen Z Doesn't Read Traditional News</h2>
            <p className="text-slate-600 max-w-md mx-auto text-sm">Dry text and static newspapers belong to the past. StoryCast is built for the now.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Old Way */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 opacity-75 hover:opacity-95 transition-opacity flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">The Old Way</span>
                  <span className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">✕</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700">Traditional Newspapers & Feeds</h3>
                <div className="border border-dashed border-slate-200 p-4 rounded-xl space-y-2">
                  <div className="w-full h-4 bg-slate-100 rounded" />
                  <div className="w-[90%] h-3 bg-slate-50 rounded" />
                  <div className="w-[95%] h-3 bg-slate-50 rounded" />
                  <div className="w-[80%] h-3 bg-slate-50 rounded" />
                  <div className="w-full h-3 bg-slate-50 rounded" />
                </div>
                <ul className="space-y-2 text-xs text-slate-500 list-disc list-inside">
                  <li>Hours of dry, technical articles</li>
                  <li>No context to help understand details</li>
                  <li>Purely passive consumption (boring reading)</li>
                </ul>
              </div>
              <span className="text-[10px] text-rose-500 font-bold block pt-4">Result: 2-minute average attention drop-off</span>
            </div>

            {/* The New Way */}
            <div className="bg-white border border-[#7C3AED]/20 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">The StoryCast Way</span>
                  <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">✓</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Cinematic Episodic Feeds</h3>
                <div className="bg-slate-55 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-lg">
                    🎙️
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="block text-xs font-bold text-slate-800">The Silicon Wars</span>
                    <span className="block text-[10px] text-[#EC4899] font-medium">Episode 4 • Active 30s Audio Recap</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-650 list-disc list-inside">
                  <li>30-sec cinematic audio/video podcasts</li>
                  <li>Interactive game options to drive stories</li>
                  <li>Customized explanations (Analogy or Deep Dive)</li>
                </ul>
              </div>
              <span className="text-[10px] text-emerald-650 font-bold block pt-4">Result: 95% story completion rates</span>
            </div>
          </div>
        </section>

        {/* 4. INTERACTIVE FEATURES */}
        <section id="features" className="max-w-7xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Engineered For Immersion</h2>
            <p className="text-slate-600 max-w-md mx-auto text-sm">Every feature is designed to drag you out of the passenger seat and put you in control of the news.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Podcast Card */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
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
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center text-xl font-bold">🎥</div>
              <h3 className="text-lg font-bold text-slate-800">AI Videos</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Prefer visual cues? Switch to short vertical videos filled with dynamic imagery, captions, and deep beats.</p>
              <div className="aspect-video bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 uppercase">
                Video Simulator Active
              </div>
            </div>

            {/* Choices Card */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#EC4899]/10 text-[#EC4899] flex items-center justify-center text-xl font-bold">🎮</div>
              <h3 className="text-lg font-bold text-slate-800">Interactive Choices</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Choose path direction, predict financial outcomes, and discover how events shift based on user choices.</p>
              <span className="inline-block text-[10px] font-bold text-[#EC4899] border border-[#EC4899]/20 rounded px-2 py-0.5 bg-[#EC4899]/5">What would you do?</span>
            </div>

            {/* Personalized Memory Card */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center text-xl font-bold">🧠</div>
              <h3 className="text-lg font-bold text-slate-800">Tailored Memory</h3>
              <p className="text-xs text-slate-500 leading-relaxed">The engine tracks your interest profiles and structures explanations with analogies based on your profession.</p>
            </div>

            {/* Storytellers Card */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center text-xl font-bold">🎭</div>
              <h3 className="text-lg font-bold text-slate-800">AI Storytellers</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Toggle between Sherlock Holmes, a university professor, a comic presenter, or a cyberpunk futurist instantly.</p>
            </div>

            {/* connected Universe */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 text-[#D97706] flex items-center justify-center text-xl font-bold">🌍</div>
              <h3 className="text-lg font-bold text-slate-800">Connected Story Universe</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Never read isolated titles again. Every entity connects in an ongoing, live-updated database graph.</p>
            </div>

          </div>
        </section>

        {/* 5. MEET YOUR AI STORYTELLERS */}
        <section id="storytellers" className="max-w-7xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Meet Your AI Storytellers</h2>
            <p className="text-slate-600 max-w-md mx-auto text-sm">Choose characters that match your interest. Every narrator keeps memory across your listening sessions.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {storytellers.map((teller) => (
              <button
                key={teller.id}
                onClick={() => setActiveTeller(teller.id)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 relative group flex flex-col justify-between min-h-[140px] ${
                  activeTeller === teller.id
                    ? 'bg-white border-[#7C3AED] shadow-lg shadow-violet-500/5 scale-105'
                    : 'bg-white border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-3xl">{teller.avatar}</span>
                  {activeTeller === teller.id && <span className="text-[10px] bg-[#7C3AED] text-white px-2 py-0.5 rounded font-bold uppercase">Active</span>}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#7C3AED] transition-colors">{teller.name}</h4>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{teller.role}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Voice Demo Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl mx-auto text-center space-y-4 shadow-sm">
            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block">Voice Preview Console</span>
            <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
              "{storytellers.find(t => t.id === activeTeller)?.preview}"
            </p>
            <div className="flex items-center justify-center gap-3 text-xs text-[#7C3AED]">
              <span className="flex gap-1 h-3 items-end">
                <span className="w-0.5 bg-[#7C3AED] animate-wave-1 h-3" />
                <span className="w-0.5 bg-[#7C3AED] animate-wave-2 h-3" />
                <span className="w-0.5 bg-[#7C3AED] animate-wave-3 h-3" />
              </span>
              <span>Generative Voice Wave Active</span>
            </div>
          </div>
        </section>

        {/* 6. EXPERIENCE EVERY STORY DIFFERENTLY */}
        <section className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
          <div className="text-center space-y-3">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 shadow-sm backdrop-blur-md">
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
              onClick={() => setShowLanding(false)}
              className="text-xs font-bold text-[#7C3AED] hover:text-violet-600 transition-colors flex items-center gap-1"
            >
              Enter platform to experience full version <span>→</span>
            </button>
          </div>
        </section>

        {/* 7. INTERACTIVE STORY EXAMPLE */}
        <section className="max-w-4xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-[#1D1D1F]">Interactive Story Example</h2>
            <p className="text-slate-600 text-sm max-w-sm mx-auto">Cast your vote to unlock the subsequent chapter parameters.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
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
                  onClick={() => setShowLanding(false)}
                  className="text-[#7C3AED] font-bold hover:underline block pt-2"
                >
                  Open Dashboard to continue story ➔
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 8. STORY TIMELINE */}
        <section className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-[#1D1D1F]">Episodic TIMELINE</h2>
            <p className="text-slate-600 text-sm max-w-sm mx-auto">Follow long-running world affairs like a Netflix series.</p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
              {episodes.map((ep, idx) => (
                <div 
                  key={idx}
                  className={`bg-white border border-slate-200 p-5 rounded-2xl space-y-3 relative shadow-sm ${
                    ep.isToday ? 'border-[#7C3AED] shadow-md shadow-violet-500/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">EPISODE {ep.num}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      ep.isToday ? 'bg-[#7C3AED] text-white' : ep.isFuture ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ep.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{ep.title}</h4>
                  <span className="block text-[10px] text-slate-500">
                    {ep.active ? '✓ Complete' : '🔒 Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. KNOWLEDGE GRAPH */}
        <section id="graph" className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12 text-center relative">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Connected Story Universe</h2>
            <p className="text-slate-600 max-w-md mx-auto text-sm">Understand the big picture rather than isolated titles. Hover over nodes to see relationships.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 h-96 relative overflow-hidden shadow-sm backdrop-blur-md">
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {graphConnections.map((conn, idx) => {
                const fromNode = graphNodes.find(n => n.id === conn.from)
                const toNode = graphNodes.find(n => n.id === conn.to)
                if (!fromNode || !toNode) return null
                return (
                  <line
                    key={idx}
                    x1={`${fromNode.x}%`}
                    y1={fromNode.y}
                    x2={`${toNode.x}%`}
                    y2={toNode.y}
                    className="stroke-[#7C3AED]/20 stroke-[2] transition-colors duration-300"
                    style={{
                      stroke: hoveredNode === conn.from || hoveredNode === conn.to ? '#7C3AED' : 'rgba(124, 58, 237, 0.1)'
                    }}
                  />
                )
              })}
            </svg>

            {graphNodes.map((node) => (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${node.x}%`, top: node.y }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div 
                  className="w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center shadow shadow-violet-500/10"
                  style={{
                    backgroundColor: node.color,
                    transform: hoveredNode === node.id ? 'scale(1.4)' : 'scale(1)'
                  }}
                />
                <span className="block mt-2 text-xs font-bold text-slate-700 group-hover:text-[#7C3AED] transition-colors">
                  {node.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 10. LIVE STATISTICS */}
        <section id="stats" className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
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
        <section className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-[#1D1D1F]">What The Listeners Say</h2>
            <p className="text-slate-600 text-sm max-w-sm mx-auto">Real responses from users switching their feed habits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* 12. CTA */}
        <section className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200">
          <div className="bg-gradient-to-r from-[#7C3AED]/10 to-[#EC4899]/10 border border-[#7C3AED]/20 rounded-3xl p-10 sm:p-16 text-center space-y-8 relative overflow-hidden shadow-sm">
            <h2 className="text-3xl sm:text-6xl font-extrabold text-[#1D1D1F] leading-tight">Ready to Experience News Like Never Before?</h2>
            <p className="text-slate-600 text-base max-w-xl mx-auto">
              Join millions of listeners transforming raw news headlines into cinematic narratives tailored to their minds.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button 
                onClick={() => setShowLanding(false)}
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

        {/* FOOTER */}
        <footer className="bg-slate-100 border-t border-slate-200 py-12 text-center text-xs text-slate-500">
          <p>© 2026 StoryCast AI. All rights reserved.</p>
        </footer>

      </div>
    )
  }

  // -------------------------------------------------------------
  // APP DASHBOARD VIEW - Light themed
  // -------------------------------------------------------------
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
            <svg className="w-8 h-8 rounded-xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="db-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="26" fill="url(#db-logo-grad)" />
              <path d="M38 32 L68 50 L38 68 Z" fill="#ffffff" />
              <path d="M72 38 A 20 20 0 0 1 72 62" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
            </svg>
            <div>
              <span className="text-base sm:text-xl font-bold tracking-tight text-slate-800">StoryCast AI</span>
              <span className="block text-[8px] sm:text-[9px] text-[#7C3AED] font-bold tracking-widest uppercase">Cinematic News Engine</span>
            </div>
          </div>

          {/* User profile / Personalization controls */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white border border-slate-200 px-2 sm:px-3 py-1.5 rounded-2xl">
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
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>📖</span> Immersive Text
              </button>
              <button
                onClick={() => setFormat('audio')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  format === 'audio'
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
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
                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block mb-1">The Context</span>
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/10" />

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

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
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

// Minimal mock stories block just to avoid references errors
const stories = [
  {
    id: 'silicon-wars',
    title: 'The Silicon Shield: Battle for the 1nm Chip',
    topic: 'Global Chip Monopoly',
    season: 'Season 1: Global Tech Cold War',
    narrative: {
      hook: "Imagine a machine so complex it requires three Boeing 747s to ship, costing $350 million. This isn't a spaceship. It's the only machine on Earth that can print the brain of tomorrow's AI.",
      context: "At the heart of the global technology race lies ASML, a Dutch company making Extreme Ultraviolet (EUV) lithography systems. Without them, Nvidia chips can't exist, and AI progress grinds to a halt.",
      conflict: "Now, a quiet geopolitical chess match is unfolding. The US has pressured the Dutch government to restrict EUV exports to competitors, triggering an aggressive race by other global giants to reverse-engineer light itself.",
      climax: "A mysterious startup claims to have bypassed EUV entirely using a new Nanoimprint technology. If true, the Dutch monopoly shattered overnight, and the balance of technological power instantly shifts.",
      takeaway: "The ultimate weapon in modern geopolitics is no longer oil or nuclear warheads; it is control over the precision of light waves measured in nanometers."
    },
    perspectives: {
      investor: {
        title: "The Venture Capitalist",
        text: "ASML's stock volatility presents a once-in-a-generation buying opportunity. We are immediately allocating capital to alternative lithography startups. The moat is cracking, and the premium on TSMC alternatives is skyrocketing."
      },
      policymaker: {
        title: "The National Security Advisor",
        text: "Chip supply chains are national security. If our adversaries gain independent 1nm capability, our cyber defense advantages dissolve. Export bans must be expanded to include software tooling immediately."
      },
      citizen: {
        title: "The Everyday Consumer",
        text: "This means the phone in your pocket might double in price next year, or become ten times smarter. We are caught in a crossfire of corporations, but our daily tools are the ones holding the bill."
      },
      scientist: {
        title: "The Quantum Physicist",
        text: "At 1nm, we are fighting quantum tunneling—electrons literally jumping through barriers they shouldn't cross. Bypassing lithography isn't just a manufacturing feat; it's redefining atomic manipulation."
      }
    },
    whatNext: {
      question: "What happens if Nanoimprint technology replaces EUV next month?",
      options: [
        { id: 'optA', text: "TSMC and ASML stock plunges 40%" },
        { id: 'optB', text: "Governments declare Nanoimprint secret military tech" },
        { id: 'optC', text: "Open-source hardware hackers print 1nm chips at home" }
      ]
    },
    videoFrames: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
    ]
  }
]

export default App
