import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jszsrbtnnefgrjaghlrw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_xF4k-QxfEUBqGn7pv88_3A_rVMPFk0K'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CONTACT_EMAIL = 'pdfguidee@gmail.com'

const NICHES = [
  'Pets','Parenting','Health & Wellness','Fitness','Personal Finance',
  'Productivity','Relationships & Dating','Self-Improvement',
  'Beauty & Skincare','Home & Organization','Food & Nutrition',
  'Career & Business','Travel','Hobbies & Crafts',
]

const COUNTS = [5, 10, 15, 20]
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'generate', label: 'Generate PDF Ideas', icon: '✦' },
  { id: 'saved', label: 'Saved PDF Ideas', icon: '♥' },
]

// Stable hash so each idea always gets the same badges/queries
function hashId(id) {
  const s = String(id)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// Color palette for badges (matches PDF Trend Lab look)
const PALETTE = {
  green:  { color: '#34d399', border: '1px solid rgba(52,211,153,0.35)',  background: 'rgba(52,211,153,0.10)' },
  amber:  { color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)',  background: 'rgba(251,191,36,0.10)' },
  red:    { color: '#f87171', border: '1px solid rgba(248,113,113,0.35)', background: 'rgba(248,113,113,0.10)' },
  purple: { color: '#a78bfa', border: '1px solid rgba(167,139,250,0.40)', background: 'rgba(167,139,250,0.12)' },
  blue:   { color: '#60a5fa', border: '1px solid rgba(96,165,250,0.35)',  background: 'rgba(96,165,250,0.10)' },
  gray:   { color: '#9ca3af', border: '1px solid rgba(156,163,175,0.30)', background: 'rgba(156,163,175,0.08)' },
}

function diffBadge(idea) {
  const d = idea.difficulty
  if (d === 'Beginner') return { label: 'Easy', tone: 'green' }
  if (d === 'Intermediate') return { label: 'Medium', tone: 'amber' }
  return { label: 'Hard', tone: 'red' }
}

function interestBadge(idea) {
  return idea.opportunity_score >= 84
    ? { label: 'High Interest', tone: 'purple' }
    : { label: 'Med Interest', tone: 'blue' }
}

function competitionBadge(idea) {
  const h = hashId(idea.id) % 100
  const s = idea.opportunity_score
  if (s >= 88) return h < 68 ? { label: 'Low Competition', tone: 'green' } : { label: 'Med Competition', tone: 'amber' }
  if (s >= 80) return h < 50 ? { label: 'Med Competition', tone: 'amber' } : { label: 'Low Competition', tone: 'green' }
  return h < 55 ? { label: 'Med Competition', tone: 'amber' } : { label: 'High Competition', tone: 'red' }
}

function trendBadge(idea) {
  const h = Math.floor(hashId(idea.id) / 7) % 100
  const rising = idea.opportunity_score >= 85 ? h < 72 : h < 42
  return rising
    ? { label: '↗ Rising', tone: 'green' }
    : { label: '— Stable', tone: 'gray' }
}

function extractTopic(idea) {
  const d = idea.description || ''
  const patterns = [
    / on ([^,.—]+?)(?: without overwhelm| and gives| for [a-z]| in one weekend|, )/,
    / with ([^,.]+?), then/,
    / of ([^,.]+?) and failed/,
    / around ([^—.]+?) —/,
    / make ([^.]+?) automatic/,
    /Compresses ([^.]+?) into/,
    / starting ([^,.]+?),/,
  ]
  for (const p of patterns) {
    const m = d.match(p)
    if (m && m[1] && m[1].length > 3 && m[1].length < 60) return m[1].trim()
  }
  return idea.niche.toLowerCase()
}

function cleanTopic(idea) {
  const t = extractTopic(idea)
  return t && t.length < 45 ? t : idea.niche.toLowerCase()
}

function shortAudience(idea) {
  const a = (idea.target_audience || '').toLowerCase().replace(/[.,].*$/, '').trim()
  if (!a) return idea.niche.toLowerCase()
  const words = a.split(/\s+/)
  return (words.length <= 5 ? words : words.slice(0, 4)).join(' ')
}

// Queries oriented toward finding YouTube creators/influencers to partner with
function exampleQueries(idea) {
  const niche = idea.niche.toLowerCase()
  const topic = cleanTopic(idea)
  const aud = shortAudience(idea)
  const pool = [
    `${niche} youtube channels`,
    `${topic} youtubers`,
    `${aud} youtube creators`,
    `small ${niche} channels to partner with`,
    `${topic} reviewers on youtube`,
    `${niche} influencers to collaborate`,
    `${topic} youtube channels`,
  ]
  const seen = new Set()
  const unique = pool.filter(q => {
    const k = q.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k); return true
  })
  const start = hashId(idea.id) % unique.length
  const rotated = [...unique.slice(start), ...unique.slice(0, start)]
  return rotated.slice(0, 4)
}

function fmtDate(ts) {
  if (!ts) return '—'
  const d = new Date(Number(ts))
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function Footer() {
  return (
    <footer className="site-footer">
      For all inquiries, contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    </footer>
  )
}

function IdeaCard({ idea, saved, onToggleSave, removeMode }) {
  const [showQueries, setShowQueries] = useState(false)
  const queries = useMemo(() => exampleQueries(idea), [idea])
  const badges = useMemo(
    () => [diffBadge(idea), interestBadge(idea), competitionBadge(idea), trendBadge(idea)],
    [idea]
  )
  return (
    <article className="idea-card">
      <div className="idea-top">
        <h3 className="idea-title">{idea.title}</h3>
        <button
          className={`save-btn ${removeMode ? 'remove' : saved ? 'saved' : ''}`}
          onClick={() => onToggleSave(idea)}
        >
          {removeMode ? 'Remove' : saved ? 'Saved ✓' : '🔖 Save'}
        </button>
      </div>
      <p className="idea-desc">{idea.description}</p>
      <p className="idea-audience">👥 {idea.target_audience}</p>
      <div className="idea-meta">
        {badges.map((b, i) => (
          <span key={i} className="tag" style={PALETTE[b.tone]}>{b.label}</span>
        ))}
      </div>
      <div className="score-row">
        <span>🏆 Opportunity Score</span>
        <span className="score-num">{idea.opportunity_score}<small>/100</small></span>
      </div>
      <button className="queries-toggle" onClick={() => setShowQueries(v => !v)}>
        🔍 {showQueries ? 'Hide' : 'Show'} Example Queries ({queries.length})
      </button>
      {showQueries && (
        <div className="queries-list">
          {queries.map(q => <div key={q} className="query-pill">"{q}"</div>)}
        </div>
      )}
    </article>
  )
}

function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault(); setError(''); setOk(''); setBusy(true)
    try {
      if (mode === 'signup') {
        const { data: valid, error: codeErr } = await supabase.rpc('validate_access_code', { p_code: code })
        if (codeErr) throw codeErr
        if (!valid) { setError('Access code is invalid. Check your purchase email.'); return }
        const { error: signErr } = await supabase.auth.signUp({ email, password })
        if (signErr) throw signErr
        setOk('Account created. Check your inbox to confirm, then log in.')
        setMode('login')
      } else if (mode === 'forgot') {
        const { error: rErr } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
        if (rErr) throw rErr
        setOk('Password reset link sent. Check your inbox.')
      } else {
        const { error: logErr } = await supabase.auth.signInWithPassword({ email, password })
        if (logErr) throw logErr
      }
    } catch (err) { setError(err.message || 'Something went wrong.') }
    finally { setBusy(false) }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand"><span className="brand-dot" />PDF Guide Lab</div>
        <p className="auth-sub">
          {mode === 'login' && 'Log in to browse trending PDF guide ideas.'}
          {mode === 'signup' && 'Create your account with the access code from your purchase email.'}
          {mode === 'forgot' && 'Enter your email and we will send you a reset link.'}
        </p>
        {error && <p className="auth-error">{error}</p>}
        {ok && <p className="auth-ok">{ok}</p>}
        <div className="field"><label>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
        {mode !== 'forgot' && (
          <div className="field"><label>Password</label><input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></div>
        )}
        {mode === 'signup' && (
          <div className="field"><label>Access code</label><input required value={code} onChange={e => setCode(e.target.value)} placeholder="From your purchase email" /></div>
        )}
        <button className="btn-primary" disabled={busy}>
          {busy ? 'One moment…' : mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
        </button>
        <p className="auth-switch">
          {mode === 'login' && (<>
            <button type="button" onClick={() => { setMode('forgot'); setError(''); setOk('') }}>Forgot password?</button>
            <br />No account yet? <button type="button" onClick={() => { setMode('signup'); setError(''); setOk('') }}>Create one</button>
          </>)}
          {mode === 'signup' && (<>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); setOk('') }}>Log in</button></>)}
          {mode === 'forgot' && (<>Remembered it? <button type="button" onClick={() => { setMode('login'); setError(''); setOk('') }}>Back to log in</button></>)}
        </p>
      </form>
    </div>
  )
}

function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true)
    const { error: uErr } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (uErr) setError(uErr.message)
    else onDone()
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand"><span className="brand-dot" />PDF Guide Lab</div>
        <p className="auth-sub">Choose a new password for your account.</p>
        {error && <p className="auth-error">{error}</p>}
        <div className="field"><label>New password</label><input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button className="btn-primary" disabled={busy}>{busy ? 'One moment…' : 'Save new password'}</button>
      </form>
    </div>
  )
}

function Dashboard({ userEmail, savedCount, lastGen, onGoGenerate, onGoSaved }) {
  const name = (userEmail || '').split('@')[0]
  return (
    <>
      <div className="welcome-banner">
        <div className="eyebrow">✨ WELCOME BACK</div>
        <h1>Hey, {name}! 👋</h1>
        <p>Discover trending PDF guide ideas across 14 profitable niches.</p>
      </div>

      <div className="section-label">QUICK ACTIONS</div>
      <div className="quick-grid">
        <button className="quick-card" onClick={onGoGenerate}>
          <div className="quick-icon">💡</div>
          <h3>Generate Ideas</h3>
          <p>Find trending PDF guide ideas for your niche</p>
          <span className="quick-cta">Get started →</span>
        </button>
        <button className="quick-card" onClick={onGoSaved}>
          <div className="quick-icon">🔖</div>
          <h3>Saved Ideas</h3>
          <p>Review and manage your saved PDF guide ideas</p>
          <span className="quick-cta">Get started →</span>
        </button>
      </div>

      <div className="section-label">YOUR STATS</div>
      <div className="stats">
        <div className="stat-card">
          <div className="stat-icon">◎</div>
          <div className="stat-label">Total Saved Ideas</div>
          <div className="stat-num">{savedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🕐</div>
          <div className="stat-label">Last Generation</div>
          <div className="stat-num stat-date">{fmtDate(lastGen)}</div>
        </div>
      </div>
    </>
  )
}

function Generate({ savedIds, onToggleSave, onGenerated }) {
  const [topic, setTopic] = useState('')
  const [niche, setNiche] = useState('')
  const [count, setCount] = useState(10)
  const [ideas, setIdeas] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setBusy(true); setError(''); setIdeas([])
    const delay = new Promise(r => setTimeout(r, 9000 + Math.random() * 5000))
    let result
    if (topic.trim()) {
      let q = supabase.from('ideas').select('*').or(`title.ilike.%${topic.trim()}%,description.ilike.%${topic.trim()}%`).limit(60)
      if (niche) q = q.eq('niche', niche)
      result = await q
      if (result.data) {
        const shuffled = [...result.data].sort(() => Math.random() - 0.5)
        result = { ...result, data: shuffled.slice(0, count) }
      }
    } else {
      result = await supabase.rpc('get_random_ideas', { p_niche: niche || null, p_count: count })
    }
    await delay
    if (result.error) setError('Could not load ideas. Refresh and try again.')
    else {
      setIdeas(result.data || [])
      if ((result.data || []).length === 0) setError('No ideas matched that topic. Try a broader keyword or leave it empty.')
      const ts = Date.now()
      localStorage.setItem('pgl_last_gen', String(ts))
      onGenerated(ts)
    }
    setBusy(false)
  }

  return (
    <>
      <h1 className="page-title">Generate PDF Ideas</h1>
      <p className="page-sub">Find trending PDF guide ideas for your niche.</p>

      <div className="gen-panel">
        <div className="field">
          <label>Topic or Problem <span className="optional">(Optional)</span></label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., healthy meal planning for busy parents…" />
        </div>
        <div className="gen-row">
          <div className="field">
            <label>Niche <span className="required">*</span></label>
            <select value={niche} onChange={e => setNiche(e.target.value)}>
              <option value="">All niches</option>
              {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Number of Ideas: <strong>{count}</strong></label>
            <div className="count-row">{COUNTS.map(c => <button key={c} type="button" className={`count-chip ${count === c ? 'active' : ''}`} onClick={() => setCount(c)}>{c}</button>)}</div>
          </div>
        </div>
        <button className="generate-btn" onClick={generate} disabled={busy}>
          {busy ? '⟳ Generating Ideas…' : '✨ Generate Ideas'}
        </button>
      </div>

      {busy && (
        <div className="loading-card">
          <div className="spinner" />
          <h3>Analyzing the catalog…</h3>
          <p>This may take 10–30 seconds as we find the strongest ideas for you</p>
        </div>
      )}

      {error && !busy && <p className="auth-error">{error}</p>}

      {!busy && ideas.length > 0 && (
        <>
          <div className="section-label">GENERATED IDEAS ({ideas.length})</div>
          <div className="ideas-grid">
            {ideas.map(idea => <IdeaCard key={idea.id} idea={idea} saved={savedIds.has(idea.id)} onToggleSave={onToggleSave} />)}
          </div>
        </>
      )}

      {!busy && ideas.length === 0 && !error && (
        <div className="empty">Your ideas will appear here. Pick a niche and generate.</div>
      )}
    </>
  )
}

function Saved({ savedIdeas, onToggleSave }) {
  return (
    <>
      <h1 className="page-title">Saved PDF Ideas</h1>
      <p className="page-sub">Every idea you save is stored on your account, on any device.</p>
      {savedIdeas.length === 0 ? <div className="empty">Nothing saved yet. Generate some ideas and hit "Save".</div> :
        <div className="ideas-grid">{savedIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} removeMode onToggleSave={onToggleSave} />)}</div>}
    </>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [savedIdeas, setSavedIdeas] = useState([])
  const [recovery, setRecovery] = useState(false)
  const [lastGen, setLastGen] = useState(localStorage.getItem('pgl_last_gen'))

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.from('saved_ideas').select('idea_id, ideas(*)').then(({ data }) => setSavedIdeas((data || []).map(r => r.ideas).filter(Boolean)))
  }, [session])

  const savedIds = useMemo(() => new Set(savedIdeas.map(i => i.id)), [savedIdeas])

  async function toggleSave(idea) {
    const user = session?.user; if (!user) return
    if (savedIds.has(idea.id)) {
      setSavedIdeas(prev => prev.filter(i => i.id !== idea.id))
      await supabase.from('saved_ideas').delete().eq('user_id', user.id).eq('idea_id', idea.id)
    } else {
      setSavedIdeas(prev => [...prev, idea])
      await supabase.from('saved_ideas').insert({ user_id: user.id, idea_id: idea.id })
    }
  }

  if (!ready) return null
  if (recovery) return <ResetPassword onDone={() => setRecovery(false)} />
  if (!session) return <Auth />

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-dot" />PDF Guide Lab</div>
        {NAV.map(item => <button key={item.id} className={`nav-btn ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        <div className="sidebar-footer">{session.user.email}<br /><button onClick={() => supabase.auth.signOut()}>Log out</button></div>
      </aside>
      <main className="main">
        <div className="main-inner" style={{ maxWidth: 1180, margin: '0 auto', width: '100%' }}>
          {page === 'dashboard' && <Dashboard userEmail={session.user.email} savedCount={savedIdeas.length} lastGen={lastGen} onGoGenerate={() => setPage('generate')} onGoSaved={() => setPage('saved')} />}
          {page === 'generate' && <Generate savedIds={savedIds} onToggleSave={toggleSave} onGenerated={setLastGen} />}
          {page === 'saved' && <Saved savedIdeas={savedIdeas} onToggleSave={toggleSave} />}
          <Footer />
        </div>
      </main>
    </div>
  )
}
