import { useEffect, useMemo, useRef, useState } from 'react'

const API_BASE = 'http://localhost:8001'

const formatTime = (seconds) => {
  const value = Math.max(0, Math.floor(seconds || 0))
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

const mediaUrl = (runId, path) => {
  const prefix = `scripts/${runId}/`
  const relativePath = path.startsWith(prefix) ? path.slice(prefix.length) : path
  return `${API_BASE}/api/media/${encodeURIComponent(runId)}/${relativePath}`
}

const getScriptName = (path) => path.split('/').pop()
const getScriptStem = (path) => getScriptName(path).replace(/\.json$/, '')

export default function EpisodePage({ episodeId }) {
  const audioRef = useRef(null)
  const [stories, setStories] = useState([])
  const [storyIndex, setStoryIndex] = useState(0)
  const [trackIndex, setTrackIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadEpisode = async () => {
      setLoading(true)
      setError('')
      try {
        const manifestResponse = await fetch(mediaUrl(episodeId, 'manifest.json'))
        if (!manifestResponse.ok) throw new Error('This episode could not be found.')
        const manifest = await manifestResponse.json()
        const loadedStories = await Promise.all((manifest.scripts || []).map(async (entry) => {
          const scriptPath = getScriptName(entry.scriptPath)
          const scriptResponse = await fetch(mediaUrl(episodeId, scriptPath))
          if (!scriptResponse.ok) throw new Error('A story file could not be loaded.')
          const script = await scriptResponse.json()
          const stem = getScriptStem(entry.scriptPath)
          let audioManifest = { clips: [], failures: [] }
          try {
            const audioResponse = await fetch(mediaUrl(episodeId, `audio/${stem}/manifest.json`))
            if (audioResponse.ok) audioManifest = await audioResponse.json()
          } catch (_) {
            // The player can still use generated clip files from an incomplete manifest.
          }
          return buildStory(script, audioManifest, stem, episodeId)
        }))
        const playableStories = loadedStories.filter((story) => story.tracks.length > 0)
        if (!playableStories.length) throw new Error('This episode has no playable audio yet.')
        if (!active) return
        setStories(playableStories)
        setStoryIndex(0)
        setTrackIndex(0)
        setElapsed(0)
        setPlaybackTime(0)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Episode assets could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadEpisode()
    return () => { active = false }
  }, [episodeId])

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

  const selectStory = (nextStoryIndex, autoPlay = playing) => {
    pause()
    setStoryIndex(nextStoryIndex)
    setTrackIndex(0)
    setElapsed(storyElapsedBefore(nextStoryIndex))
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
      selectStory(storyIndex + 1, shouldPlay)
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
    if (storyIndex < stories.length - 1) selectStory(storyIndex + 1, playing)
    else {
      pause()
      setStoryIndex(0)
      setTrackIndex(0)
      setElapsed(0)
      setPlaybackTime(0)
    }
  }

  const handleEnded = () => moveTrack(1)
  const handleTimeUpdate = (event) => setPlaybackTime(event.currentTarget.currentTime || 0)
  const handleMetadata = () => {
    if (currentTrack && !currentTrack.duration && Number.isFinite(audioRef.current.duration)) {
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
    <main className="min-h-screen overflow-x-hidden bg-[#08090b] text-white lg:h-screen lg:overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(124,58,237,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="fixed left-1/2 top-[-14rem] -z-10 h-[34rem] w-[50rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-fuchsia-700/20 via-indigo-900/10 to-transparent blur-3xl" />

      <header className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
        <a href="/" className="flex items-center gap-3 no-underline">
          <img src="/logo.png" className="h-9 w-9 rounded-lg object-contain" alt="StoryCast AI" />
          <span className="text-[15px] font-extrabold tracking-tight text-white">StoryCast <span className="text-fuchsia-400">AI</span></span>
        </a>
        <div className="flex items-center gap-4 text-sm text-white/45">
          <span className="hidden sm:block">Episode {episodeId}</span>
          <a href="/" className="rounded-full border border-white/15 px-4 py-2 font-bold text-white/75 transition hover:border-fuchsia-400/70 hover:text-white">Back to library</a>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1480px] gap-10 px-5 pb-8 sm:px-8 lg:h-[calc(100vh-4.25rem)] lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16 lg:px-12 lg:pb-6 xl:grid-cols-[minmax(0,1fr)_34rem]">
        <div className="flex min-w-0 flex-col pt-4 lg:min-h-0 lg:pt-3">
          <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.22em] text-fuchsia-400">Now playing</p>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">{episodeTitle}</h1>
            </div>
            <p className="text-sm font-semibold text-white/35">A cinematic audio story</p>
          </div>

          <section className="relative aspect-[1.16/1] min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#15151a] shadow-[0_30px_100px_-35px_rgba(168,85,247,0.6)] sm:aspect-[1.5/1] lg:aspect-auto lg:min-h-0 lg:flex-1">
            {displayImage && <img src={displayImage} alt="Story scene" className="absolute inset-0 h-full w-full object-contain opacity-90" />}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,8,0.92)_0%,rgba(5,6,8,0.45)_48%,rgba(5,6,8,0.18)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-400" />

            {loading && <div className="absolute inset-0 grid place-items-center text-sm font-bold text-white/75">Loading your episode…</div>}
            {error && <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm font-bold text-white/80">{error}</div>}
            {currentTrack && !loading && !error && (
              <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-end p-6 text-white sm:p-10">
                <div className="mb-4 flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-fuchsia-300">
                  <span>{currentStory.category}</span><span className="text-white/30">/</span><span className="text-white/55">{beatLabel}</span>
                </div>
                <p className="max-w-3xl text-2xl font-extrabold leading-[1.12] tracking-[-0.035em] sm:text-4xl">{currentTrack.text}</p>
                <p className="mt-4 text-sm font-bold text-white/50">{currentTrack.speaker || 'StoryCast narrator'}</p>
              </div>
            )}
          </section>

          <section className="mt-3 shrink-0 border-b border-white/10 pb-3">
            <div className="mb-2 flex items-end justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/35">Listening progress</p><p className="mt-1 text-xl font-black tabular-nums tracking-tight text-white">{formatTime(currentTime)} <span className="text-sm font-medium text-white/30">/ {formatTime(totalDuration)}</span></p></div><span className="text-[10px] font-bold text-white/35">{stories.length} {stories.length === 1 ? 'story' : 'stories'}</span></div>
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-400 transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
                <button type="button" aria-label="Previous story" onClick={() => moveTrack(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-base text-white/70 transition hover:border-white/40 hover:text-white">‹</button>
                <button type="button" onClick={playing ? pause : play} className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-5 text-xs font-extrabold shadow-[0_8px_24px_-10px_rgba(236,72,153,0.8)] transition hover:brightness-110">{playing ? 'Pause' : 'Play episode'} <span className="text-base">{playing ? 'Ⅱ' : '▷'}</span></button>
                <button type="button" aria-label="Next story" onClick={() => moveTrack(1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-base text-white/70 transition hover:border-white/40 hover:text-white">›</button>
                <button type="button" onClick={skipStory} className="ml-1 hidden rounded-full border border-white/10 px-3 py-2 text-[11px] font-extrabold text-white/45 transition hover:border-white/30 hover:text-white sm:block">Skip story</button>
            </div>
          </section>
        </div>

        <aside className="min-w-0 pt-2 lg:min-h-0 lg:overflow-hidden lg:pt-3">
          <div className="flex items-end gap-8 border-b border-white/15">
            <button type="button" className="relative pb-5 text-base font-extrabold text-white after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-fuchsia-500 after:to-pink-500">Stories <sup className="ml-1 text-[10px] text-white/45">{stories.length}</sup></button><span className="pb-5 text-base font-bold text-white/35">About</span>
          </div>
          <div className="flex items-center justify-between py-7">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-fuchsia-400">Your queue</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">All stories</h2>
            </div>
            <span className="text-xs font-bold text-white/35">{stories.length} stories</span>
          </div>
          <div className="max-h-[34rem] space-y-1 overflow-y-auto pr-1 scrollbar-none">
            {stories.map((story, index) => (
              <button key={`${story.title}-${index}`} type="button" onClick={() => selectStory(index)} className={`group relative flex w-full items-center gap-4 rounded-xl px-3 py-4 text-left transition ${index === storyIndex ? 'bg-white/[0.09]' : 'hover:bg-white/[0.045]'}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-black ${index === storyIndex ? 'border-fuchsia-400 bg-fuchsia-500/15 text-fuchsia-300' : 'border-white/10 text-white/35'}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className={`block truncate text-[15px] font-extrabold ${index === storyIndex ? 'text-white' : 'text-white/65 group-hover:text-white'}`}>{story.title}</span>
                  <span className={`mt-0.5 block text-xs font-semibold ${index === storyIndex ? 'text-white/70' : 'text-slate-400'}`}>{story.category} · {formatTime(story.duration)}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      </section>
      <audio ref={audioRef} onEnded={handleEnded} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleMetadata} />
    </main>
  )
}

function buildStory(script, audioManifest, stem, episodeId) {
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
      duration: Number(clip?.durationSeconds) || 0,
      text: line.text,
      speaker: line.speaker,
      image: beat.visual?.imagePath ? mediaUrl(episodeId, beat.visual.imagePath) : '',
      beatId: beat.id,
    })
  }))
  return {
    title: story.title || 'Untitled story',
    category: story.classification?.category || story.category || 'News',
    tracks,
    duration: tracks.reduce((sum, track) => sum + track.duration, 0),
  }
}
