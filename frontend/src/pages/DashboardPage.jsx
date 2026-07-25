import React, { useState, useEffect } from 'react'
import Dashboard from '../components/Dashboard'
import { stories, episodes } from '../mock/data'

export default function DashboardPage({ setShowLanding, user, onLogout }) {
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
  const [demoWaveHeight, setDemoWaveHeight] = useState(Array(15).fill(8))

  // Simulated live waveform data
  useEffect(() => {
    if (isPlaying) {
      const waveTimer = setInterval(() => {
        setDemoWaveHeight(Array(15).fill(0).map(() => Math.floor(Math.random() * 28) + 6))
      }, 150)
      return () => clearInterval(waveTimer)
    }
  }, [isPlaying])

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
      user={user}
      onLogout={onLogout}
    />
  )
}
