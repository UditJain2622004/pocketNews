import { useEffect, useMemo, useState } from 'react'
import Dashboard from '../components/Dashboard'
import { API_BASE } from '../api'

const fallbackEpisode = {
  id: 'sample-story',
  title: 'Your next news story is on the way',
  topic: 'PocketNews',
  summary: 'A cinematic news episode will appear here once the first completed run is published.',
  category: 'News',
  tag: 'Coming soon',
  season: 'PocketNews Originals',
  plays: 'New',
  rating: '4.9',
  color: 'from-[#E11D48] to-[#F97316]',
  videoFrames: [],
}

const mediaUrl = (runId, path) => {
  const prefix = `scripts/${runId}/`
  const relativePath = path.startsWith(prefix) ? path.slice(prefix.length) : path
  return `${API_BASE}/api/media/${encodeURIComponent(runId)}/${relativePath.split('/').map(encodeURIComponent).join('/')}`
}

const dashboardEpisode = (episode) => {
  const scripts = episode.scripts || []
  const firstStory = scripts[0] || {}
  const coverPath = episode.coverPath || firstStory.imagePaths?.[0] || ''
  const categories = episode.categories || []
  return {
    id: episode.episodeId,
    title: episode.title || `${episode.cadence} brief: ${categories.slice(0, 2).join(' & ') || 'News'}`,
    topic: categories.join(' + ') || 'News recap',
    summary: scripts.length
      ? `${scripts.length} cinematic news stories, selected for your interests.`
      : 'A cinematic news episode selected for your interests.',
    category: categories[0] || 'News',
    tag: `${episode.cadence} recap`,
    season: `${episode.cadence} episode`,
    plays: `${scripts.length} stories`,
    date: episode.periodEnd || episode.periodStart || '',
    rating: '4.9',
    color: 'from-[#E11D48] to-[#F97316]',
    videoFrames: coverPath ? [mediaUrl(episode.runId, coverPath), mediaUrl(episode.runId, coverPath)] : [],
  }
}

export default function DashboardPage({ setShowLanding, user, onLogout, token, onProfileUpdate, navigateTo }) {
  const [episodes, setEpisodes] = useState([])

  useEffect(() => {
    let active = true
    fetch(`${API_BASE}/api/dashboard/episodes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : { episodes: [] })
      .then((data) => { if (active) setEpisodes(data.episodes || []) })
      .catch(() => { if (active) setEpisodes([]) })
    return () => { active = false }
  }, [token])

  const storiesList = useMemo(
    () => episodes.length ? episodes.map(dashboardEpisode) : [fallbackEpisode],
    [episodes],
  )

  return <Dashboard
    setShowLanding={setShowLanding}
    user={user}
    onLogout={onLogout}
    token={token}
    onProfileUpdate={onProfileUpdate}
    storiesList={storiesList}
    onPlayStory={(episodeId) => episodeId !== fallbackEpisode.id && navigateTo(`/episode/${encodeURIComponent(episodeId)}`)}
  />
}
