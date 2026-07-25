import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StoryDemo from './components/StoryDemo'
import NewsComparison from './components/NewsComparison'
import FeaturesGrid from './components/FeaturesGrid'
import Storytellers from './components/Storytellers'
import GenreSwitcher from './components/GenreSwitcher'
import StoryQuiz from './components/StoryQuiz'
import Timeline from './components/Timeline'
import KnowledgeGraph from './components/KnowledgeGraph'
import StatsAndReviews from './components/StatsAndReviews'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import Dashboard from './components/Dashboard'

// Mock Data
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

  // Landing view
  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased overflow-x-hidden relative selection:bg-[#7C3AED]/20 selection:text-slate-905">
        
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-80 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#7C3AED]/10 via-[#2563EB]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <Navbar onEnterApp={() => setShowLanding(false)} />

        <Hero onEnterApp={() => setShowLanding(false)} heroMorphStep={heroMorphStep} />

        <StoryDemo demoStep={demoStep} demoWaveHeight={demoWaveHeight} />

        <NewsComparison />

        <FeaturesGrid />

        <Storytellers 
          storytellers={storytellers} 
          activeTeller={activeTeller} 
          setActiveTeller={setActiveTeller} 
        />

        <GenreSwitcher 
          storyGenres={storyGenres} 
          activeGenre={activeGenre} 
          setActiveGenre={setActiveGenre}
          onEnterApp={() => setShowLanding(false)}
        />

        <StoryQuiz 
          selectedQuizAnswer={selectedQuizAnswer}
          setSelectedQuizAnswer={setSelectedQuizAnswer}
          quizSubmitted={quizSubmitted}
          setQuizSubmitted={setQuizSubmitted}
          onEnterApp={() => setShowLanding(false)}
        />

        <Timeline episodes={episodes} />

        <KnowledgeGraph 
          graphNodes={graphNodes}
          graphConnections={graphConnections}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
        />

        <StatsAndReviews />

        <CTASection onEnterApp={() => setShowLanding(false)} />

        <Footer />
      </div>
    )
  }

  // Dashboard view
  return (
    <Dashboard
      currentStory={currentStory}
      episodes={episodes}
      setShowLanding={setShowLanding}
      profession={profession}
      setProfession={setProfession}
      level={level}
      setLevel={setLevel}
      format={format}
      setFormat={setFormat}
      activeNarrator={activeNarrator}
      setActiveNarrator={setActiveNarrator}
      activePerspective={activePerspective}
      setActivePerspective={setActivePerspective}
      userQuestion={userQuestion}
      setUserQuestion={setUserQuestion}
      chatLog={chatLog}
      handleAskQuestion={handleAskQuestion}
      voted={voted}
      voteCount={voteCount}
      castVote={castVote}
      isPlaying={isPlaying}
      setIsPlaying={setIsPlaying}
      audioProgress={audioProgress}
      videoFrameIndex={videoFrameIndex}
      demoWaveHeight={demoWaveHeight}
    />
  )
}

export default App
