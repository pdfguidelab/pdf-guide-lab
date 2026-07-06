import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setOk(''); setBusy(true)
    try {
      if (mode === 'signup') {
        const { data: valid, error: codeErr } =
          await supabase.rpc('validate_access_code', { p_code: code })
        if (codeErr) throw codeErr
        if (!valid) { setError('Access code is invalid. Check your purchase email.'); return }
        const { error: signErr } = await supabase.auth.signUp({ email, password })
        if (signErr) throw signErr
        setOk('Account created. Check your inbox to confirm your email, then log in.')
        setMode('login')
      } else {
        const { error: logErr } =
          await supabase.auth.signInWithPassword({ email, password })
        if (logErr) throw logErr
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand"><span className="brand-dot" />PDF Guide Lab</div>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Log in to browse trending PDF guide ideas.'
            : 'Create your account with the access code from your purchase email.'}
        </p>

        {error && <p className="auth-error">{error}</p>}
        {ok && <p className="auth-ok">{ok}</p>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email}
                 onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} value={password}
                 onChange={e => setPassword(e.target.value)} />
        </div>
        {mode === 'signup' && (
          <div className="field">
            <label htmlFor="code">Access code</label>
            <input id="code" required value={code}
                   onChange={e => setCode(e.target.value)}
                   placeholder="From your purchase email" />
          </div>
        )}

        <button className="btn-primary" disabled={busy}>
          {busy ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>No account yet?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(''); setOk('') }}>
                Create one
              </button></>
          ) : (
            <>Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); setOk('') }}>
                Log in
              </button></>
          )}
        </p>
      </form>
    </div>
  )
}
