import React, { useState, useEffect } from 'react'
import SignUpForm from '../components/auth/SignUpForm'
import InterestSelector from '../components/auth/InterestSelector'
import { API_BASE } from '../api'

const DEFAULT_SUGGESTIONS = {
  "Technology": ["Artificial Intelligence", "Web Development", "Mobile Applications", "Cybersecurity", "Blockchain"],
  "Politics": ["Elections", "International Relations", "Policy & Laws", "Local Government"],
  "Exams": ["College Entrance", "Civil Services", "Certifications", "Admissions"],
  "Entertainment": ["Movies", "Music", "Gaming", "Celebrity News", "Television"],
  "Sports": ["Cricket", "Football", "Basketball", "Tennis", "Athletics"],
  "Science": ["Space Exploration", "Physics", "Biology", "Environment", "Medicine"]
}

export default function SignUpPage({ onSignupSuccess, onCancel, onSwitchToSignIn }) {
  const [step, setStep] = useState(1) // 1: Credentials, 2: Interest Selector
  
  // Form fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [language, setLanguage] = useState('English')
  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedSubtopics, setSelectedSubtopics] = useState([])

  // Suggestions state (starts with defaults)
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Fetch suggestions to fetch fresh data from backend
  useEffect(() => {
    fetch(`${API_BASE}/auth/suggestions`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load interests')
        return res.json()
      })
      .then(data => {
        if (data.suggestions && Object.keys(data.suggestions).length > 0) {
          setSuggestions(data.suggestions)
        }
      })
      .catch(err => {
        console.warn('Could not fetch suggestions from backend, using frontend defaults:', err.message)
      })
  }, [])

  const handleSignupDetailsSubmit = (e) => {
    e.preventDefault()
    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters long')
      return
    }
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long')
      return
    }
    setErrorMsg('')
    setStep(2) // Move to topic selection
  }

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic))
      const subsOfThisTopic = suggestions[topic] || []
      setSelectedSubtopics(selectedSubtopics.filter(s => !subsOfThisTopic.includes(s)))
    } else {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  const toggleSubtopic = (subtopic) => {
    if (selectedSubtopics.includes(subtopic)) {
      setSelectedSubtopics(selectedSubtopics.filter(s => s !== subtopic))
    } else {
      setSelectedSubtopics([...selectedSubtopics, subtopic])
    }
  }

  const handleSignupSubmit = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          topics: selectedTopics,
          subtopics: selectedSubtopics,
          language
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Signup failed. Please try again.')
      }

      // Automatically log in after signup
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_or_email: username,
          password
        })
      })
      const loginData = await loginRes.json()
      
      setSuccessMsg('Account created and logged in!')
      setTimeout(() => {
        onSignupSuccess(loginData.access_token)
      }, 1000)

    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 relative selection:bg-[#7C3AED]/20 selection:text-slate-900 overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#7C3AED]/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#EC4899]/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      
      {/* Back button */}
      <button 
        onClick={onCancel}
        className="absolute top-6 left-6 text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 font-bold text-sm bg-white/80 border border-black/5 px-4 py-2 rounded-xl shadow-sm z-10"
      >
        ← Back to StoryCast
      </button>

      {/* Main Glass Card */}
      <div className={`w-full glass-panel rounded-3xl shadow-xl border border-white/60 p-8 sm:p-10 relative z-10 transition-all duration-500 ${step === 2 ? 'max-w-4xl' : 'max-w-lg'}`}>
        {step === 1 && (
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" className="w-16 h-16 object-contain rounded-2xl mb-3" alt="Logo" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 text-center">
              Create Your StoryCast Persona
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 text-center">
              Configure your customized news preferences & interests
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200/50 rounded-2xl text-xs sm:text-sm font-semibold text-red-600 flex items-center gap-2">
            <span className="text-base">⚠️</span> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/50 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <span className="text-base">✅</span> {successMsg}
          </div>
        )}

        {step === 1 ? (
          <SignUpForm 
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            language={language}
            setLanguage={setLanguage}
            onSubmit={handleSignupDetailsSubmit}
            onSwitchToSignIn={onSwitchToSignIn}
          />
        ) : (
          <InterestSelector 
            selectedTopics={selectedTopics}
            toggleTopic={toggleTopic}
            selectedSubtopics={selectedSubtopics}
            toggleSubtopic={toggleSubtopic}
            suggestions={suggestions}
            onBack={() => setStep(1)}
            onSubmit={handleSignupSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
