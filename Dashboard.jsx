import { NICHES } from '../supabase'

export default function Dashboard({ totalIdeas, savedCount, onGoGenerate }) {
  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome back. Here's your lab at a glance.</p>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-num">{totalIdeas ?? '—'}</div>
          <div className="stat-label">Ideas in the catalog</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{NICHES.length}</div>
          <div className="stat-label">Niches covered</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{savedCount}</div>
          <div className="stat-label">Ideas you've saved</div>
        </div>
      </div>

      <button className="generate-btn" onClick={onGoGenerate}>
        Generate PDF ideas →
      </button>
    </>
  )
}
