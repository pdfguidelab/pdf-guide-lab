import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jszsrbtnnefgrjaghlrw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_xF4k-QxfEUBqGn7pv88_3A_rVMPFk0K'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

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

function IdeaCard({ idea, saved, onToggleSave, removeMode }) {
  return (
    <article className="idea-card">
      <div className="idea-top">
        <span className="idea-niche">{idea.niche}</span>
        <span className="score">{idea.opportunity_score}</span>
      </div>
      <h3 className="idea-title">{idea.title}</h3>
      <p className="idea-desc">{idea.description}</p>
      <div className="idea-meta">
        <span className="tag">{idea.target_audience}</span>
        <span className="tag">{idea.difficulty}</span>
      </div>
      <button className={`save-btn ${removeMode ? 'remove' : saved ? 'saved' : ''}`} onClick={() => onToggleSave(idea)}>
        {removeMode ? 'Remove' : saved ? 'Saved ✓' : 'Save idea'}
      </button>
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
        <p className="auth-sub">{mode === 'login' ? 'Log in to browse trending PDF guide ideas.' : 'Create your account with the access code from your purchase email.'}</p>
        {error && <p className="auth-error">{error}</p>}
        {ok && <p className="auth-ok">{ok}</p>}
        <div className="field"><label>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="field"><label>Password</label><input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></div>
        {mode === 'signup' && <div className="field"><label>Access code</label><input required value={code} onChange={e => setCode(e.target.value)} placeholder="From your purchase email" /></div>}
        <button className="btn-primary" disabled={busy}>{busy ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        <p className="auth-switch">{mode === 'login' ? (<>No account yet? <button type="button" onClick={() => { setMode('signup'); setError(''); setOk('') }}>Create one</button></>) : (<>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); setOk('') }}>Log in</button></>)}</p>
      </form>
    </div>
  )
}

function Dashboard({ totalIdeas, savedCount, onGoGenerate }) {
  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome back. Here's your lab at a glance.</p>
      <div className="stats">
        <div className="stat-card"><div className="stat-num">{totalIdeas ?? '—'}</div><div className="stat-label">Ideas in the catalog</div></div>
        <div className="stat-card"><div className="stat-num">{NICHES.length}</div><div className="stat-label">Niches covered</div></div>
        <div className="stat-card"><div className="stat-num">{savedCount}</div><div className="stat-label">Ideas you've saved</div></div>
      </div>
      <button className="generate-btn" onClick={onGoGenerate}>Generate PDF ideas →</button>
    </>
  )
}

function Generate({ savedIds, onToggleSave }) {
  const [niche, setNiche] = useState('')
  const [count, setCount] = useState(10)
  const [ideas, setIdeas] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setBusy(true); setError('')
    const { data, error: err } = await supabase.rpc('get_random_ideas', { p_niche: niche || null, p_count: count })
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
          <label>Niche</label>
          <select value={niche} onChange={e => setNiche(e.target.value)}>
            <option value="">All niches</option>
            {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="field">
          <label>How many ideas</label>
          <div className="count-row">{COUNTS.map(c => <button key={c} type="button" className={`count-chip ${count === c ? 'active' : ''}`} onClick={() => setCount(c)}>{c}</button>)}</div>
        </div>
        <button className="generate-btn" onClick={generate} disabled={busy}>{busy ? 'Generating…' : 'Generate ideas'}</button>
      </div>
      {error && <p className="auth-error">{error}</p>}
      {ideas.length === 0 && !busy ? <div className="empty">Your ideas will appear here. Pick a niche and generate.</div> :
        <div className="ideas-grid">{ideas.map(idea => <IdeaCard key={idea.id} idea={idea} saved={savedIds.has(idea.id)} onToggleSave={onToggleSave} />)}</div>}
    </>
  )
}

function Saved({ savedIdeas, onToggleSave }) {
  return (
    <>
      <h1 className="page-title">Saved PDF ideas</h1>
      <p className="page-sub">Every idea you save is stored on your account, on any device.</p>
      {savedIdeas.length === 0 ? <div className="empty">Nothing saved yet. Generate some ideas and hit "Save idea".</div> :
        <div className="ideas-grid">{savedIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} removeMode onToggleSave={onToggleSave} />)}</div>}
    </>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [savedIdeas, setSavedIdeas] = useState([])
  const [totalIdeas, setTotalIdeas] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.from('saved_ideas').select('idea_id, ideas(*)').then(({ data }) => setSavedIdeas((data || []).map(r => r.ideas).filter(Boolean)))
    supabase.from('ideas').select('*', { count: 'exact', head: true }).then(({ count }) => setTotalIdeas(count))
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
  if (!session) return <Auth />

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-dot" />PDF Guide Lab</div>
        {NAV.map(item => <button key={item.id} className={`nav-btn ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        <div className="sidebar-footer">{session.user.email}<br /><button onClick={() => supabase.auth.signOut()}>Log out</button></div>
      </aside>
      <main className="main">
        {page === 'dashboard' && <Dashboard totalIdeas={totalIdeas} savedCount={savedIdeas.length} onGoGenerate={() => setPage('generate')} />}
        {page === 'generate' && <Generate savedIds={savedIds} onToggleSave={toggleSave} />}
        {page === 'saved' && <Saved savedIdeas={savedIdeas} onToggleSave={toggleSave} />}
      </main>
    </div>
  )
}
