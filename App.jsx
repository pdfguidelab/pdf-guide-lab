import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Generate from './components/Generate'
import Saved from './components/Saved'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'generate', label: 'Generate PDF Ideas', icon: '✦' },
  { id: 'saved', label: 'Saved PDF Ideas', icon: '♥' },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [savedIdeas, setSavedIdeas] = useState([])
  const [totalIdeas, setTotalIdeas] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase
      .from('saved_ideas')
      .select('idea_id, ideas(*)')
      .then(({ data }) => setSavedIdeas((data || []).map(r => r.ideas).filter(Boolean)))
    supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => setTotalIdeas(count))
  }, [session])

  const savedIds = useMemo(() => new Set(savedIdeas.map(i => i.id)), [savedIdeas])

  async function toggleSave(idea) {
    const user = session?.user
    if (!user) return
    if (savedIds.has(idea.id)) {
      setSavedIdeas(prev => prev.filter(i => i.id !== idea.id))
      await supabase.from('saved_ideas')
        .delete().eq('user_id', user.id).eq('idea_id', idea.id)
    } else {
      setSavedIdeas(prev => [...prev, idea])
      await supabase.from('saved_ideas')
        .insert({ user_id: user.id, idea_id: idea.id })
    }
  }

  if (!ready) return null
  if (!session) return <Auth />

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-dot" />PDF Guide Lab</div>
        {NAV.map(item => (
          <button key={item.id}
                  className={`nav-btn ${page === item.id ? 'active' : ''}`}
                  onClick={() => setPage(item.id)}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
        <div className="sidebar-footer">
          {session.user.email}<br />
          <button onClick={() => supabase.auth.signOut()}>Log out</button>
        </div>
      </aside>

      <main className="main">
        {page === 'dashboard' && (
          <Dashboard totalIdeas={totalIdeas} savedCount={savedIdeas.length}
                     onGoGenerate={() => setPage('generate')} />
        )}
        {page === 'generate' && (
          <Generate savedIds={savedIds} onToggleSave={toggleSave} />
        )}
        {page === 'saved' && (
          <Saved savedIdeas={savedIdeas} onToggleSave={toggleSave} />
        )}
      </main>
    </div>
  )
}
