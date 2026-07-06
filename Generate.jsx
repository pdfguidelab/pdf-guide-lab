import { useState } from 'react'
import { supabase, NICHES } from '../supabase'
import IdeaCard from './IdeaCard'

const COUNTS = [5, 10, 15, 20]

export default function Generate({ savedIds, onToggleSave }) {
  const [niche, setNiche] = useState('')
  const [count, setCount] = useState(10)
  const [ideas, setIdeas] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setBusy(true); setError('')
    const { data, error: err } = await supabase.rpc('get_random_ideas', {
      p_niche: niche || null,
      p_count: count,
    })
    if (err) setError('Could not load ideas. Refresh and try again.')
    else setIdeas(data || [])
    setBusy(false)
  }

  return (
    <>
      <h1 className="page-title">Generate PDF ideas</h1>
      <p className="page-sub">Pick a niche, choose how many ideas you want, and hit generate.</p>

      <div className="controls">
        <div className="field">
          <label htmlFor="niche">Niche</label>
          <select id="niche" value={niche} onChange={e => setNiche(e.target.value)}>
            <option value="">All niches</option>
            {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="field">
          <label>How many ideas</label>
          <div className="count-row">
            {COUNTS.map(c => (
              <button key={c} type="button"
                      className={`count-chip ${count === c ? 'active' : ''}`}
                      onClick={() => setCount(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <button className="generate-btn" onClick={generate} disabled={busy}>
          {busy ? 'Generating…' : 'Generate ideas'}
        </button>
      </div>

      {error && <p className="auth-error">{error}</p>}

      {ideas.length === 0 && !busy ? (
        <div className="empty">Your ideas will appear here. Pick a niche and generate.</div>
      ) : (
        <div className="ideas-grid">
          {ideas.map(idea => (
            <IdeaCard key={idea.id} idea={idea}
                      saved={savedIds.has(idea.id)}
                      onToggleSave={onToggleSave} />
          ))}
        </div>
      )}
    </>
  )
}
