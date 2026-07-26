import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import StoryDemo from '../components/StoryDemo'
import NewsComparison from '../components/NewsComparison'
import FeaturesGrid from '../components/FeaturesGrid'
import StoryQuiz from '../components/StoryQuiz'
import Footer from '../components/Footer'

export default function Home({ onEnterApp, user, onLoginClick, onLogout }) {
  // Hero morphing state
  const [heroMorphStep, setHeroMorphStep] = useState(0) // 0: Breaking, 1: Story, 2: Audio/Video
  
  // AI Story Demo Card states
  const [demoStep, setDemoStep] = useState(0) // 0: Headline, 1: Story morph, 2: Playing audio/wave
  const [demoWaveHeight, setDemoWaveHeight] = useState(Array(15).fill(8))
  
  // Interactive story quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

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
    if (demoStep === 2) {
      const waveTimer = setInterval(() => {
        setDemoWaveHeight(Array(15).fill(0).map(() => Math.floor(Math.random() * 28) + 6))
      }, 150)
      return () => clearInterval(waveTimer)
    }
  }, [demoStep])

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased overflow-x-hidden relative selection:bg-[#7C3AED]/20 selection:text-slate-905">
      
      {/* Background Grid Lines (Extending to the entire page) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-80 pointer-events-none" />
      
      {/* Ambient Gradient Glows (Distributed along the entire page length) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#7C3AED]/10 via-[#2563EB]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[35%] right-0 w-[500px] h-[500px] bg-[#EC4899]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[65%] left-0 w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar 
        onEnterApp={onEnterApp} 
        user={user}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
      />

      <Hero onEnterApp={onEnterApp} heroMorphStep={heroMorphStep} setHeroMorphStep={setHeroMorphStep} />

      <StoryDemo demoStep={demoStep} demoWaveHeight={demoWaveHeight} />

      <NewsComparison />

      <FeaturesGrid />

      <StoryQuiz 
        selectedQuizAnswer={selectedQuizAnswer}
        setSelectedQuizAnswer={setSelectedQuizAnswer}
        quizSubmitted={quizSubmitted}
        setQuizSubmitted={setQuizSubmitted}
        onEnterApp={onEnterApp}
      />

      <Footer />
    </div>
  )
}
