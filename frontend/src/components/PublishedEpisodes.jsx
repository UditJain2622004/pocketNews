import { useEffect, useState } from 'react'
import { API_BASE } from '../api'

export default function PublishedEpisodes({ token }) {
  const [episodes, setEpisodes] = useState([])
  useEffect(() => { if (token) fetch(`${API_BASE}/api/dashboard/episodes`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.ok ? response.json() : { episodes: [] }).then((data) => setEpisodes(data.episodes || [])).catch(() => setEpisodes([])) }, [token])
  if (!episodes.length) return null
  return <section className="mx-auto mb-6 max-w-7xl px-4 sm:px-8"><h2 className="text-lg font-black text-zinc-900">Your published episodes</h2><div className="mt-3 flex gap-3 overflow-x-auto pb-2">{episodes.map((episode) => <a key={episode.episodeId} href={`/episode/${encodeURIComponent(episode.episodeId)}`} className="min-w-64 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><p className="text-xs font-black uppercase text-fuchsia-600">{episode.cadence}</p><p className="mt-1 font-extrabold text-zinc-900">{episode.categories.join(' + ') || 'News recap'}</p><p className="mt-2 text-xs text-zinc-500">{episode.periodStart} to {episode.periodEnd}</p></a>)}</div></section>
}
