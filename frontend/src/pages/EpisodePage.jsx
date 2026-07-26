import { useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE } from '../api'

const formatTime = (seconds) => {
  const value = Math.max(0, Math.floor(seconds || 0))
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

const safeDuration = (duration, text = '') => {
  const value = Number(duration)
  if (Number.isFinite(value) && value > 0 && value <= 60) return value
  return Math.max(1.5, Math.min(20, String(text).trim().split(/\s+/).filter(Boolean).length / 2.3))
}

const mediaUrl = (runId, path) => {
  const prefix = `scripts/${runId}/`
  const relativePath = path.startsWith(prefix) ? path.slice(prefix.length) : path
  return `${API_BASE}/api/media/${encodeURIComponent(runId)}/${relativePath}`
}

const getScriptName = (path) => path.split('/').pop()
const getScriptStem = (path) => getScriptName(path).replace(/\.json$/, '')

const SUPPORTED_LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Bengali', 'Kannada', 'Tamil', 'Bhojpuri',
  'Spanish', 'Mandarin', 'German', 'French', 'Japanese'
]

export default function EpisodePage({ episodeId, token }) {
  const audioRef = useRef(null)
  const [stories, setStories] = useState([])
  const [storyIndex, setStoryIndex] = useState(0)
  const [trackIndex, setTrackIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidePanel, setSidePanel] = useState('stories')
  const sessionIdRef = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
  const sentEventsRef = useRef(new Set())
  const completedStoriesRef = useRef(new Set())

  const [currentLanguage, setCurrentLanguage] = useState(null)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [localizedStatus, setLocalizedStatus] = useState('canonical')
  const [refreshCounter, setRefreshCounter] = useState(0)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLangDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Poll for translation status if fallback is active
  useEffect(() => {
    if (localizedStatus !== 'canonical_fallback' || !token || !currentLanguage) return
    let active = true
    const interval = setInterval(async () => {
      try {
        const url = `${API_BASE}/api/episodes/${encodeURIComponent(episodeId)}/playback?language=${encodeURIComponent(currentLanguage)}`
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        if (response.ok) {
          const playback = await response.json()
          if (!active) return
          if (playback.localizedStatus === 'ready') {
            setRefreshCounter((c) => c + 1)
          }
        }
      } catch (err) {
        console.error('Failed to poll episode playback status:', err)
      }
    }, 5000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [episodeId, token, currentLanguage, localizedStatus])

  useEffect(() => {
    let active = true
    const loadEpisode = async () => {
      setLoading(true)
      setError('')
      try {
        let runId = episodeId
        let manifest
        if (token) {
          const url = `${API_BASE}/api/episodes/${encodeURIComponent(episodeId)}/playback` +
            (currentLanguage ? `?language=${encodeURIComponent(currentLanguage)}` : '')
          const playbackResponse = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
          if (playbackResponse.ok) {
            const playback = await playbackResponse.json()
            runId = playback.runId
            manifest = { scripts: playback.scripts || [] }
            
            if (!currentLanguage && playback.requestedLanguage) {
              setCurrentLanguage(playback.requestedLanguage)
            }
            setLocalizedStatus(playback.localizedStatus || 'canonical')
          }
        }
        if (!manifest) {
          const manifestResponse = await fetch(mediaUrl(runId, 'manifest.json'))
          if (!manifestResponse.ok) throw new Error('This episode could not be found.')
          manifest = await manifestResponse.json()
        }
        const loadedStories = await Promise.all((manifest.scripts || []).map(async (entry) => {
          const scriptPath = getScriptName(entry.scriptPath)
          const scriptResponse = await fetch(mediaUrl(runId, scriptPath))
          if (!scriptResponse.ok) throw new Error('A story file could not be loaded.')
          const script = await scriptResponse.json()
          const stem = getScriptStem(entry.scriptPath)
          let audioManifest = { clips: [], failures: [] }
          try {
            const audioResponse = await fetch(mediaUrl(runId, `audio/${stem}/manifest.json`))
            if (audioResponse.ok) audioManifest = await audioResponse.json()
          } catch (_) {
            // The player can still use generated clip files from an incomplete manifest.
          }
          return buildStory(script, audioManifest, stem, runId, entry.storyId)
        }))
        const playableStories = loadedStories.filter((story) => story.tracks.length > 0)
        if (!playableStories.length) throw new Error('This episode has no playable audio yet.')
        if (token && playableStories.length > 1) {
          try {
            const bridgeResponse = await fetch(`${API_BASE}/api/episodes/${encodeURIComponent(episodeId)}/bridges`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ runId, storyIds: playableStories.map((story) => story.storyId) }),
            })
            if (bridgeResponse.ok) addBridgeTracks(playableStories, (await bridgeResponse.json()).bridges || [])
          } catch (_) {
            // Bridges are enhancement-only; direct story playback remains available.
          }
        }
        if (!active) return
        setStories(playableStories)
        
        // Preserve storyIndex and trackIndex across language reloads, recalculating elapsed time
        setStoryIndex((prevStoryIdx) => {
          const nextStoryIdx = prevStoryIdx < playableStories.length ? prevStoryIdx : 0
          setTrackIndex((prevTrackIdx) => {
            const nextStory = playableStories[nextStoryIdx]
            const nextTrackIdx = nextStory && prevTrackIdx < nextStory.tracks.length ? prevTrackIdx : 0
            
            const elapsedBeforeStories = playableStories
              .slice(0, nextStoryIdx)
              .flatMap((story) => story.tracks)
              .reduce((sum, track) => sum + track.duration, 0)
            const elapsedInStory = nextStory
              ? nextStory.tracks.slice(0, nextTrackIdx).reduce((sum, track) => sum + track.duration, 0)
              : 0
            setElapsed(elapsedBeforeStories + elapsedInStory)
            
            return nextTrackIdx
          })
          return nextStoryIdx
        })
        setPlaybackTime(0)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Episode assets could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadEpisode()
    return () => { active = false }
  }, [episodeId, token, currentLanguage, refreshCounter])

  const currentStory = stories[storyIndex]
  const currentTrack = currentStory?.tracks[trackIndex]
  const totalDuration = useMemo(
    () => stories.flatMap((story) => story.tracks).reduce((sum, track) => sum + track.duration, 0),
    [stories],
  )
  const currentTime = Math.min(elapsed + playbackTime, totalDuration)
  const progress = totalDuration ? (currentTime / totalDuration) * 100 : 0

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    audio.src = currentTrack.url
    setPlaybackTime(0)
    if (playing) audio.play().catch(() => setPlaying(false))
  }, [currentTrack?.url])

  const storyElapsedBefore = (targetIndex) => stories
    .slice(0, targetIndex)
    .flatMap((story) => story.tracks)
    .reduce((sum, track) => sum + track.duration, 0)

  const play = async () => {
    if (!currentTrack) return
    try {
      await audioRef.current.play()
      setPlaying(true)
    } catch (_) {
      setError('Your browser blocked playback. Use the play button once more to begin.')
    }
  }

  const pause = () => {
    audioRef.current?.pause()
    setPlaying(false)
  }

  const sendStoryEvent = (story, event, progressRatio) => {
    if (!token || !story?.storyId) return
    const storyKey = `${episodeId}:${story.storyId}`
    if (event === 'skipped' && completedStoriesRef.current.has(storyKey)) return
    const eventId = `${sessionIdRef.current}:${episodeId}:${story.storyId}:${event}`
    if (sentEventsRef.current.has(eventId)) return
    sentEventsRef.current.add(eventId)
    if (event === 'completed') completedStoriesRef.current.add(storyKey)
    fetch(`${API_BASE}/api/episodes/${encodeURIComponent(episodeId)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ eventId, storyId: story.storyId, event, progressRatio }),
    }).catch(() => {})
  }

  const currentStoryProgress = () => {
    if (!currentStory?.duration) return 0
    const completedTrackTime = currentStory.tracks
      .slice(0, trackIndex)
      .reduce((sum, track) => sum + track.duration, 0)
    return Math.min(1, (completedTrackTime + playbackTime) / currentStory.duration)
  }

  const selectStory = (nextStoryIndex, autoPlay = playing, includeBridge = false) => {
    pause()
    const nextStory = stories[nextStoryIndex]
    const nextTrackIndex = includeBridge ? 0 : Math.max(0, nextStory?.tracks.findIndex((track) => !track.isBridge) || 0)
    setStoryIndex(nextStoryIndex)
    setTrackIndex(nextTrackIndex)
    setElapsed(storyElapsedBefore(nextStoryIndex) + (includeBridge ? 0 : (nextStory?.tracks.slice(0, nextTrackIndex).reduce((sum, track) => sum + track.duration, 0) || 0)))
    setPlaybackTime(0)
    if (autoPlay) setPlaying(true)
  }

  const moveTrack = (direction) => {
    if (!currentStory) return
    const shouldPlay = playing
    pause()
    if (direction < 0 && trackIndex > 0) {
      setTrackIndex(trackIndex - 1)
      setElapsed((value) => Math.max(0, value - currentStory.tracks[trackIndex - 1].duration))
    } else if (direction > 0 && trackIndex < currentStory.tracks.length - 1) {
      setElapsed((value) => value + currentStory.tracks[trackIndex].duration)
      setTrackIndex(trackIndex + 1)
    } else if (direction > 0 && storyIndex < stories.length - 1) {
      if (!completedStoriesRef.current.has(`${episodeId}:${currentStory.storyId}`)) {
        sendStoryEvent(currentStory, 'skipped', currentStoryProgress())
      }
      selectStory(storyIndex + 1, shouldPlay, true)
      return
    } else if (direction > 0) {
      setStoryIndex(0)
      setTrackIndex(0)
      setElapsed(0)
      setPlaybackTime(0)
      return
    }
    if (shouldPlay) setPlaying(true)
  }

  const skipStory = () => {
    sendStoryEvent(currentStory, 'skipped', currentStoryProgress())
    if (storyIndex < stories.length - 1) selectStory(storyIndex + 1, playing, false)
    else {
      pause()
      setStoryIndex(0)
      setTrackIndex(0)
      setElapsed(0)
      setPlaybackTime(0)
    }
  }

  const handleEnded = () => {
    if (currentStory && trackIndex === currentStory.tracks.length - 1) {
      sendStoryEvent(currentStory, 'completed', 1)
    }
    moveTrack(1)
  }
  const handleTimeUpdate = (event) => setPlaybackTime(event.currentTarget.currentTime || 0)
  const handleMetadata = () => {
    if (currentTrack && !currentTrack.duration && Number.isFinite(audioRef.current.duration) && audioRef.current.duration <= 60) {
      currentTrack.duration = audioRef.current.duration
    }
  }

  const beatLabel = currentTrack?.beatId?.replace(/-/g, ' ') || 'Now playing'
  const firstVisual = currentStory?.tracks.find((track) => track.image)?.image
  const displayImage = currentTrack?.image
    || currentStory?.tracks.slice(0, trackIndex + 1).reverse().find((track) => track.image)?.image
    || firstVisual
  const episodeTitle = currentStory?.title || (loading ? 'Loading episode' : 'Untitled episode')

  return (
    <main className="episode-page min-h-screen overflow-x-hidden bg-gradient-to-tr from-[#EBEBF2] via-[#F5F5F7] to-[#E9EFF7] text-zinc-800 selection:bg-[#E11D48]/15 selection:text-[#E11D48] lg:h-screen lg:overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(124,58,237,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="fixed left-1/2 top-[-14rem] -z-10 h-[34rem] w-[50rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#7C3AED]/10 via-[#EC4899]/5 to-transparent blur-3xl" />

      <header className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
        <a href="/" className="flex items-center gap-3 no-underline">
          <img src="/logo.png" className="h-9 w-9 rounded-lg object-contain" alt="Pocket News" />
          <span className="text-[15px] font-extrabold tracking-tight text-zinc-900">Pocket <span className="text-[#E11D48]">News</span></span>
        </a>
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          {token && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 rounded-full border border-zinc-300/80 bg-white/50 px-4 py-2 font-bold text-zinc-700 shadow-sm transition hover:border-[#E11D48]/50 hover:text-[#E11D48] cursor-pointer"
              >
                <span>🌐 {currentLanguage || 'English'}</span>
                <span className="text-[10px] text-zinc-400">▼</span>
              </button>
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-xl backdrop-blur-md z-50 max-h-60 overflow-y-auto">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setCurrentLanguage(lang)
                        setShowLangDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentLanguage === lang
                          ? 'bg-[#E11D48] text-white'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <a href="/" className="rounded-full border border-zinc-300/80 bg-white/50 px-4 py-2 font-bold text-zinc-700 shadow-sm transition hover:border-[#E11D48]/50 hover:text-[#E11D48]">Back to library</a>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1480px] gap-10 px-5 pb-8 sm:px-8 lg:h-[calc(100vh-4.25rem)] lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16 lg:px-12 lg:pb-6 xl:grid-cols-[minmax(0,1fr)_34rem]">
        <div className="flex min-w-0 flex-col pt-4 lg:min-h-0 lg:pt-3">
          <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#E11D48]">Now playing</p>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-zinc-900 sm:text-4xl">{episodeTitle}</h1>
            </div>
            <p className="text-sm font-semibold text-zinc-500">A cinematic audio story</p>
          </div>

          {localizedStatus === 'canonical_fallback' && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs font-bold text-amber-800 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="animate-spin text-sm">⏳</span>
                <span>Translating episode to {currentLanguage || 'selected language'}... playing English audio meanwhile.</span>
              </div>
              <button 
                type="button"
                onClick={() => setRefreshCounter((c) => c + 1)}
                className="text-[10px] font-black uppercase tracking-wider text-amber-950 underline hover:no-underline cursor-pointer"
              >
                Check Status
              </button>
            </div>
          )}

          <section className="relative aspect-[1.16/1] min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/70 bg-zinc-950 shadow-lg sm:aspect-[1.5/1] lg:aspect-auto lg:min-h-0 lg:flex-1">
            {displayImage && <img src={displayImage} alt="Story scene" className="absolute inset-0 h-full w-full object-contain opacity-90" />}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,8,0.92)_0%,rgba(5,6,8,0.45)_48%,rgba(5,6,8,0.18)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#E11D48] via-[#EC4899] to-[#7C3AED]" />

            {loading && <div className="absolute inset-0 grid place-items-center text-sm font-bold text-white/75">Loading your episode…</div>}
            {error && <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm font-bold text-white/80">{error}</div>}
            {currentTrack && !loading && !error && (
              <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-end p-6 text-white sm:p-10">
                <div className="mb-4 flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-fuchsia-300">
                  <span>{currentStory.category}</span><span className="text-white/30">/</span><span className="text-white/55">{beatLabel}</span>
                </div>
                <p className="max-w-3xl text-lg font-bold leading-snug tracking-tight sm:text-2xl">{currentTrack.text}</p>
              </div>
            )}
          </section>

          <section className="mt-3 shrink-0 border-b border-zinc-200/80 pb-3">
            <div className="mb-2 flex items-end justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">Listening progress</p><p className="mt-1 text-xl font-black tabular-nums tracking-tight text-zinc-900">{formatTime(currentTime)} <span className="text-sm font-medium text-zinc-400">/ {formatTime(totalDuration)}</span></p></div><span className="text-[10px] font-bold text-zinc-400">{stories.length} {stories.length === 1 ? 'story' : 'stories'}</span></div>
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full rounded-full bg-gradient-to-r from-[#E11D48] via-[#EC4899] to-[#7C3AED] transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
                <button type="button" aria-label="Previous story" onClick={() => moveTrack(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-base text-white/70 transition hover:border-white/40 hover:text-white">‹</button>
                <button type="button" onClick={playing ? pause : play} className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-5 text-xs font-extrabold shadow-[0_8px_24px_-10px_rgba(236,72,153,0.8)] transition hover:brightness-110">{playing ? 'Pause' : 'Play episode'} <span className="text-base">{playing ? 'Ⅱ' : '▷'}</span></button>
                <button type="button" aria-label="Next story" onClick={() => moveTrack(1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-base text-white/70 transition hover:border-white/40 hover:text-white">›</button>
                <button type="button" onClick={skipStory} className="ml-1 hidden rounded-full border border-white/10 px-3 py-2 text-[11px] font-extrabold text-white/45 transition hover:border-white/30 hover:text-white sm:block">Skip story</button>
            </div>
          </section>
        </div>

        <aside className="min-w-0 rounded-3xl border border-white/50 bg-white/55 p-4 shadow-md backdrop-blur-md lg:min-h-0 lg:overflow-hidden lg:pt-4">
          <div className="flex items-end gap-8 border-b border-zinc-200/80">
            <button type="button" onClick={() => setSidePanel('stories')} className={`relative pb-4 text-base font-extrabold ${sidePanel === 'stories' ? 'text-zinc-900 after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[#E11D48]' : 'text-zinc-400 hover:text-zinc-700'}`}>Stories <sup className="ml-1 text-[10px] text-zinc-400">{stories.length}</sup></button><button type="button" onClick={() => setSidePanel('about')} className={`relative pb-4 text-base font-extrabold ${sidePanel === 'about' ? 'text-zinc-900 after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[#E11D48]' : 'text-zinc-400 hover:text-zinc-700'}`}>About</button>
          </div>
          {sidePanel === 'stories' && <><div className="flex items-center justify-between py-7">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#E11D48]">Your queue</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-900">All stories</h2>
            </div>
            <span className="text-xs font-bold text-zinc-400">{stories.length} stories</span>
          </div>
          <div className="max-h-[34rem] space-y-1 overflow-y-auto pr-1 scrollbar-none">
            {stories.map((story, index) => (
              <button key={`${story.title}-${index}`} type="button" onClick={() => selectStory(index)} className={`group relative flex w-full items-center gap-4 rounded-xl px-3 py-4 text-left transition ${index === storyIndex ? 'bg-[#E11D48]/10' : 'hover:bg-zinc-100/70'}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-black ${index === storyIndex ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]' : 'border-zinc-200 bg-white/70 text-zinc-400'}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className={`block truncate text-[15px] font-extrabold ${index === storyIndex ? 'text-zinc-900' : 'text-zinc-700 group-hover:text-zinc-900'}`}>{story.title}</span>
                  <span className={`mt-0.5 block text-xs font-semibold ${index === storyIndex ? 'text-white/70' : 'text-slate-400'}`}>{story.category} · {formatTime(story.duration)}</span>
                </span>
              </button>
            ))}
          </div></>}
          {sidePanel === 'about' && <div className="py-7"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#E11D48]">Sources used</p><h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-900">{currentStory?.title || 'Current story'}</h2><div className="mt-6 space-y-3">{(currentStory?.sources || []).map((source, index) => <a key={`${source.url}-${index}`} href={source.url || '#'} target="_blank" rel="noreferrer" className="block rounded-xl border border-zinc-200 bg-white/65 p-4 transition hover:border-[#E11D48]/40"><p className="font-extrabold text-zinc-800">{source.name || 'Original source'}</p><p className="mt-1 truncate text-xs text-zinc-500">{source.publishedAt || 'Publication date unavailable'}</p></a>)}{!(currentStory?.sources || []).length && <p className="text-sm font-semibold text-zinc-500">No source link was saved for this story.</p>}</div></div>}
        </aside>
      </section>
      <audio ref={audioRef} onEnded={handleEnded} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleMetadata} />
    </main>
  )
}

function buildStory(script, audioManifest, stem, episodeId, entryStoryId) {
  const story = script.story || {}
  const clips = new Map((audioManifest.clips || []).map((clip) => [`${clip.beatId}-${clip.lineIndex}`, clip]))
  const canRecover = (audioManifest.failures || []).length > 0
  const tracks = []
  ;(story.beats || []).forEach((beat) => (beat.lines || []).forEach((line, lineIndex) => {
    const clip = clips.get(`${beat.id}-${lineIndex}`)
    const fallback = canRecover ? mediaUrl(episodeId, `audio/${stem}/${beat.id}/${lineIndex}.wav`) : ''
    if (!clip?.url && !fallback) return
    tracks.push({
      url: clip?.url ? `${API_BASE}${clip.url}` : fallback,
      duration: safeDuration(clip?.durationSeconds, line.text),
      text: line.text,
      speaker: line.speaker,
      image: beat.visual?.imagePath ? mediaUrl(episodeId, beat.visual.imagePath) : '',
      beatId: beat.id,
    })
  }))
  return {
    storyId: story.storyId || entryStoryId || '',
    title: story.title || 'Untitled story',
    category: story.classification?.category || story.category || 'News',
    sources: story.sources?.length ? story.sources : [{ name: script.article?.sourceName || script.article?.source || 'Original source', url: script.article?.url || '', publishedAt: script.article?.publishedAt || '' }],
    tracks,
    duration: tracks.reduce((sum, track) => sum + track.duration, 0),
  }
}

function addBridgeTracks(stories, bridges) {
  const byNextStory = new Map(bridges.map((bridge) => [bridge.beforeStoryId, bridge]))
  stories.forEach((story, index) => {
    if (!index) return
    const bridge = byNextStory.get(story.storyId)
    if (!bridge?.url) return
    story.tracks.unshift({ url: `${API_BASE}${bridge.url}`, duration: safeDuration(bridge.durationSeconds, bridge.text), text: bridge.text, speaker: bridge.speaker || 'Pocket News', image: story.tracks.find((track) => track.image)?.image || '', beatId: 'transition', isBridge: true })
    story.duration = story.tracks.reduce((sum, track) => sum + track.duration, 0)
  })
}
