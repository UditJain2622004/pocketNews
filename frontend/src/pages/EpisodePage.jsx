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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(124,58,237,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="fixed left-1/2 top-[-14rem] -z-10 h-[34rem] w-[50rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#7C3AED]/15 via-[#2563EB]/8 to-transparent blur-3xl" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <a href="/" className="flex items-center gap-3 text-slate-800 no-underline">
          <img src="/logo.png" className="h-11 w-11 rounded-xl object-contain" alt="StoryCast AI" />
          <span className="text-lg font-extrabold tracking-tight">StoryCast AI</span>
        </a>
        <div className="hidden rounded-full border border-violet-200/70 bg-white/70 px-4 py-2 text-xs font-bold text-violet-700 shadow-sm backdrop-blur sm:block">
          One cinematic episode
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-7 px-5 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-12">
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-violet-600">Your story feed</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{currentStory?.title || 'Loading episode'}</h1>
            </div>
            <p className="text-sm font-semibold text-slate-500">Episode {episodeId}</p>
          </div>

          <section className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 shadow-[0_24px_80px_-32px_rgba(76,29,149,0.55)] sm:min-h-[32rem]">
            {(currentTrack?.image || firstVisual) && <img src={currentTrack?.image || firstVisual} alt="Story scene" className="absolute inset-0 h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/10" />
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F97316]" />

            {loading && <div className="absolute inset-0 grid place-items-center text-lg font-bold text-white">Loading your episode...</div>}
            {error && <div className="absolute inset-0 grid place-items-center p-8 text-center text-lg font-bold text-white">{error}</div>}
            {currentTrack && !loading && !error && (
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
                <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
                  <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{currentStory.category}</span>
                  <span>{beatLabel}</span>
                </div>
                <p className="max-w-3xl text-2xl font-extrabold leading-tight sm:text-4xl">{currentTrack.text}</p>
                <p className="mt-4 text-sm font-bold text-white/65">{currentTrack.speaker}</p>
              </div>
            )}
          </section>

          <section className="mt-5 rounded-[1.5rem] border border-white/80 bg-white/75 p-4 shadow-[0_14px_45px_-25px_rgba(30,41,59,0.35)] backdrop-blur sm:p-5">
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F97316] transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="min-w-[7rem] text-sm font-bold tabular-nums text-slate-500">{formatTime(currentTime)} / {formatTime(totalDuration)}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveTrack(-1)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:border-violet-300 hover:text-violet-700">Previous</button>
                <button type="button" onClick={playing ? pause : play} className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-105">{playing ? 'Pause' : 'Play episode'}</button>
                <button type="button" onClick={() => moveTrack(1)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:border-violet-300 hover:text-violet-700">Next</button>
              </div>
              <button type="button" onClick={skipStory} className="text-sm font-extrabold text-violet-700 transition hover:text-pink-600">Skip story</button>
            </div>
          </section>
        </div>

        <aside className="rounded-[1.5rem] border border-white/80 bg-white/70 p-4 shadow-[0_14px_45px_-25px_rgba(30,41,59,0.35)] backdrop-blur sm:p-5 lg:self-start">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-600">Story queue</p>
              <h2 className="mt-1 text-lg font-black">Pick a plot</h2>
            </div>
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-extrabold text-violet-700">{stories.length}</span>
          </div>
          <div className="grid gap-2">
            {stories.map((story, index) => (
              <button key={`${story.title}-${index}`} type="button" onClick={() => selectStory(index)} className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${index === storyIndex ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/20' : 'bg-slate-50/80 text-slate-700 hover:bg-violet-50'}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black ${index === storyIndex ? 'bg-white/20 text-white' : 'bg-white text-violet-600'}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold">{story.title}</span>
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
