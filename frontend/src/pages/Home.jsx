import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import StoryDemo from '../components/StoryDemo'
import NewsComparison from '../components/NewsComparison'
import FeaturesGrid from '../components/FeaturesGrid'
import Storytellers from '../components/Storytellers'
import GenreSwitcher from '../components/GenreSwitcher'
import StoryQuiz from '../components/StoryQuiz'
import Timeline from '../components/Timeline'
import KnowledgeGraph from '../components/KnowledgeGraph'
import StatsAndReviews from '../components/StatsAndReviews'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

import { storytellers, storyGenres, episodes, graphNodes, graphConnections } from '../mock/data'

export default function Home({ onEnterApp, user, onLoginClick, onLogout }) {
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
      
      {/* Background Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-80 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#7C3AED]/10 via-[#2563EB]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <Navbar 
        onEnterApp={onEnterApp} 
        user={user}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
      />

      <Hero onEnterApp={onEnterApp} heroMorphStep={heroMorphStep} />

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
        onEnterApp={onEnterApp}
      />

      <StoryQuiz 
        selectedQuizAnswer={selectedQuizAnswer}
        setSelectedQuizAnswer={setSelectedQuizAnswer}
        quizSubmitted={quizSubmitted}
        setQuizSubmitted={setQuizSubmitted}
        onEnterApp={onEnterApp}
      />

      <Timeline episodes={episodes} />

      <KnowledgeGraph 
        graphNodes={graphNodes}
        graphConnections={graphConnections}
        hoveredNode={hoveredNode}
        setHoveredNode={setHoveredNode}
      />

      <StatsAndReviews />

      <CTASection onEnterApp={onEnterApp} />

      <Footer />
    </div>
  )
}
