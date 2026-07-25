import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { API_BASE } from '../api'

export default function ProfileTab({ user, token, onProfileUpdate, onLogout }) {
  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedSubtopics, setSelectedSubtopics] = useState([])
  const [language, setLanguage] = useState('English')
  const [customTopic, setCustomTopic] = useState('')
  const [suggestions, setSuggestions] = useState({})
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' })

  const languages = [
    { name: 'English', desc: 'Default Narration' },
    { name: 'Hindi', desc: 'Cinematic Voice' },
    { name: 'Spanish', desc: 'Castilian Translation' },
    { name: 'Mandarin', desc: 'Standard Chinese' },
    { name: 'German', desc: 'Deutsch Modulation' },
    { name: 'French', desc: 'Vocal Dubbing' },
    { name: 'Japanese', desc: 'Japanese Voiceover' }
  ]

  const fallbackSuggestions = {
    "Technology": ["Artificial Intelligence", "Web Development", "Mobile Applications", "Cybersecurity", "Blockchain"],
    "Sports": ["Cricket", "Football", "Basketball", "Tennis", "Athletics"],
    "Business": ["Finance", "Stocks", "Real Estate", "Startups", "Cryptocurrency"],
    "Entertainment": ["Movies", "Music", "Gaming", "Celebrity News", "Television"],
    "Science": ["Space Exploration", "Physics", "Biology", "Environment", "Medicine"],
    "Lifestyle": ["Health & Fitness", "Travel", "Food & Cooking", "Fashion", "DIY"]
  }

  useEffect(() => {
    fetch(`${API_BASE}/auth/suggestions`)
      .then(res => res.json())
      .then(data => {
        if (data && data.suggestions) {
          setSuggestions(data.suggestions)
        } else {
          setSuggestions(fallbackSuggestions)
        }
      })
      .catch(err => {
        console.error('Failed to fetch suggestions:', err)
        setSuggestions(fallbackSuggestions)
      })

    if (user) {
      setSelectedTopics(user.topics || [])
      setSelectedSubtopics(user.subtopics || [])
      setLanguage(user.language || 'English')
    }
  }, [user])

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic))
      if (suggestions[topic]) {
        setSelectedSubtopics(selectedSubtopics.filter(sub => !suggestions[topic].includes(sub)))
      }
    } else {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  const toggleSubtopic = (sub, parentTopic) => {
    if (parentTopic && !selectedTopics.includes(parentTopic)) {
      setSelectedTopics([...selectedTopics, parentTopic])
    }

    if (selectedSubtopics.includes(sub)) {
      setSelectedSubtopics(selectedSubtopics.filter(s => s !== sub))
    } else {
      setSelectedSubtopics([...selectedSubtopics, sub])
    }
  }

  const handleAddCustomTopic = (e) => {
    e.preventDefault()
    const trimmed = customTopic.trim()
    if (trimmed) {
      if (!selectedTopics.includes(trimmed)) {
        setSelectedTopics([...selectedTopics, trimmed])
      }
      setCustomTopic('')
    }
  }

  const handleRemoveTopic = (topic) => {
    setSelectedTopics(selectedTopics.filter(t => t !== topic))
    if (suggestions[topic]) {
      setSelectedSubtopics(selectedSubtopics.filter(sub => !suggestions[topic].includes(sub)))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSaveStatus({ type: '', message: '' })

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topics: selectedTopics,
          subtopics: selectedSubtopics,
          language: language
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile settings')
      }

      const updatedUser = await response.json()
      onProfileUpdate(updatedUser)
      setSaveStatus({ type: 'success', message: 'Profile updated successfully!' })

      setTimeout(() => {
        setSaveStatus({ type: '', message: '' })
      }, 3000)
    } catch (error) {
      console.error(error)
      setSaveStatus({ type: 'error', message: error.message || 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 text-zinc-800 text-left">
      
      {/* Save status notification */}
      {saveStatus.message && (
        <div className={`fixed bottom-6 right-6 z-55 px-5 py-3.5 rounded-2xl border text-xs font-black shadow-2xl flex items-center gap-2.5 ${
          saveStatus.type === 'success'
            ? 'bg-emerald-55 border border-emerald-200 text-emerald-600 shadow-xl'
            : 'bg-rose-55 border border-rose-200 text-rose-600 shadow-xl'
        }`}>
          <span>{saveStatus.type === 'success' ? '✓' : '⚠'}</span>
          <span>{saveStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Column 1: Account Info Card & Actions */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#E11D48]/3 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-4xl font-black shadow-md border-2 border-white/60">
                {user?.username ? user.username.substring(0, 1).toUpperCase() : 'A'}
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900">@{user?.username || 'Username'}</h2>
                <span className="inline-block text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                  Active Listener Account
                </span>
              </div>
            </div>

            {/* Readonly Account Details Form */}
            <div className="space-y-4 pt-4 border-t border-zinc-200/80">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  🔒 Username
                </label>
                <div className="w-full bg-white/40 border border-white/40 rounded-xl px-4 py-3 text-xs text-zinc-600 font-bold select-all">
                  {user?.username}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  🔒 Registered Email
                </label>
                <div className="w-full bg-white/40 border border-white/40 rounded-xl px-4 py-3 text-xs text-zinc-600 font-bold select-all truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#E11D48] to-[#EC4899] text-white text-xs font-black rounded-2xl shadow-md hover:opacity-95 active:scale-98 transition-all duration-200 uppercase tracking-widest cursor-pointer border-none"
              >
                {loading ? 'Saving Changes...' : 'Save Settings ✓'}
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-3.5 bg-transparent border border-zinc-250 text-zinc-550 hover:bg-zinc-50 hover:text-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
                >
                  Log Out ⎋
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Column 2 & 3: Language & Interests Selector */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="lg:col-span-2 space-y-6"
        >
          
          {/* Section A: Preferred Language */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-md space-y-5">
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <span>🌐</span> Choose Audio Language
              </h3>
              <p className="text-xs text-zinc-500 font-semibold mt-1">
                Select your preferred default language for all audio podcast narrations and visual subtitles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.name}
                  onClick={() => setLanguage(lang.name)}
                  className={`px-4 py-3 rounded-2xl border text-left transition-all duration-250 cursor-pointer flex flex-col justify-center ${
                    language === lang.name
                      ? 'bg-[#E11D48] border-transparent text-white shadow-md'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <span className="text-xs font-black">{lang.name}</span>
                  <span className={`text-[9px] font-bold mt-0.5 ${language === lang.name ? 'text-zinc-100' : 'text-zinc-400'}`}>
                    {lang.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section B: Topic Personalization */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <span>🔥</span> Content Personalization
              </h3>
              <p className="text-xs text-zinc-500 font-semibold mt-1">
                Personalize your feed! Stories matching your joined tags will display first in your dashboard feed.
              </p>
            </div>

            {/* Custom tag form */}
            <form onSubmit={handleAddCustomTopic} className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter custom topic tag (e.g. Geopolitics, AI Chips)..."
                className="flex-1 bg-white/40 border border-white/40 focus:bg-white/80 focus:border-[#E11D48] rounded-2xl px-4 py-3 text-xs font-bold text-zinc-850 focus:outline-none transition-all placeholder-zinc-400 font-semibold"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#E11D48] hover:bg-[#F43F5E] text-white text-xs font-black rounded-2xl transition-all shadow-md cursor-pointer uppercase tracking-wider border-none"
              >
                Add Tag
              </button>
            </form>

            {/* Category tag lists */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recommended Categories</h4>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
                {Object.entries(suggestions).map(([topic, subtopics]) => {
                  const isTopicSelected = selectedTopics.includes(topic)
                  return (
                    <div key={topic} className="p-4 bg-white/40 border border-white/40 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-900 uppercase tracking-wider">{topic}</span>
                        <button
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all border cursor-pointer ${
                            isTopicSelected 
                              ? 'bg-[#E11D48] text-white border-transparent' 
                              : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {isTopicSelected ? 'Joined ✓' : '+ Join'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {subtopics.map(sub => {
                          const isSubSelected = selectedSubtopics.includes(sub)
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => toggleSubtopic(sub, topic)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isSubSelected
                                  ? 'bg-[#EC4899] text-white border-transparent shadow-sm'
                                  : 'bg-white text-zinc-550 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800'
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

                {/* Custom active topics display */}
                {selectedTopics.filter(t => !suggestions[t]).length > 0 && (
                  <div className="p-4 bg-white/40 border border-white/40 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Custom Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopics.filter(t => !suggestions[t]).map(topic => (
                        <span key={topic} className="px-3 py-1.5 bg-white border border-[#E11D48]/25 text-[#E11D48] rounded-xl text-xs font-bold flex items-center gap-2">
                          {topic}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTopic(topic)} 
                            className="text-[#EF4444] font-black hover:text-[#F87171] ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
