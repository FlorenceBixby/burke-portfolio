import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import renderPostBody from '../utils/renderPostBody.jsx'

const API = 'https://tig-blog-agent.burke-ruder.workers.dev'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [status, setStatus] = useState('')
  const [generating, setGenerating] = useState(false)

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` }

  async function fetchDrafts(pwd = password) {
    setLoading(true)
    const r = await fetch(`${API}/api/admin/drafts`, { headers: { Authorization: `Bearer ${pwd}` } })
    if (r.status === 401) { setStatus('Wrong password'); setLoading(false); return }
    const data = await r.json()
    setDrafts(Array.isArray(data) ? data : [])
    setAuthed(true)
    setLoading(false)
  }

  async function approve(id) {
    setStatus('')
    const r = await fetch(`${API}/api/admin/approve/${id}`, { method: 'POST', headers: authHeaders })
    if (r.ok) {
      setDrafts(d => d.filter(p => p.id !== id))
      setExpanded(null)
      setStatus('Post published ✓')
    }
  }

  async function reject(id) {
    setStatus('')
    const r = await fetch(`${API}/api/admin/draft/${id}`, { method: 'DELETE', headers: authHeaders })
    if (r.ok) {
      setDrafts(d => d.filter(p => p.id !== id))
      setExpanded(null)
      setStatus('Draft deleted')
    }
  }

  async function generate() {
    setGenerating(true)
    setStatus('')
    const r = await fetch(`${API}/api/admin/generate`, { method: 'POST', headers: authHeaders })
    if (r.ok) {
      setStatus('New draft generated — refresh to see it')
      await fetchDrafts()
    }
    setGenerating(false)
  }

  if (!authed) {
    return (
      <section className="section">
        <div className="container-mid" style={{ maxWidth: 400 }}>
          <h1 className="headline-md" style={{ marginBottom: 32 }}>Blog Admin</h1>
          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchDrafts(password)}
              placeholder="Enter admin password"
            />
          </div>
          {status && <p style={{ color: 'var(--error, #dc2626)', fontSize: 14, marginTop: 8 }}>{status}</p>}
          <button
            className="btn btn-dark"
            style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
            onClick={() => fetchDrafts(password)}
          >
            Sign in →
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span className="eyebrow">Blog Admin</span>
            <h1 className="headline-md" style={{ marginBottom: 0 }}>
              Drafts <span style={{ color: 'var(--gray-mid)', fontWeight: 400 }}>({drafts.length})</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {status && <span style={{ fontSize: 14, color: 'var(--gray-mid)' }}>{status}</span>}
            <button
              className="btn btn-outline"
              onClick={() => fetchDrafts()}
              disabled={loading}
            >
              Refresh
            </button>
            <button
              className="btn btn-dark"
              onClick={generate}
              disabled={generating}
            >
              {generating ? 'Generating…' : 'Generate new post →'}
            </button>
          </div>
        </div>

        {loading && <p className="body-sm" style={{ color: 'var(--gray-mid)' }}>Loading…</p>}

        {!loading && drafts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--gray-mid)' }}>
            <p className="body-lg">No drafts waiting.</p>
            <p className="body-sm">The agent generates new posts Mon, Wed, Fri at 9AM CT. Or hit "Generate new post" above.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AnimatePresence>
            {drafts.map((draft, i) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--gray-border)',
                  borderRadius: expanded === draft.id ? 12 : (i === 0 ? '12px 12px 0 0' : i === drafts.length - 1 ? '0 0 12px 12px' : 0),
                  overflow: 'hidden',
                  marginBottom: expanded === draft.id ? 12 : 0,
                }}
              >
                <div
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}
                  onClick={() => setExpanded(expanded === draft.id ? null : draft.id)}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Generated {formatDate(draft.createdAt)}
                    </p>
                    <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{draft.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--gray-mid)', lineHeight: 1.5 }}>{draft.excerpt}</p>
                    {draft.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        {draft.tags.map(t => (
                          <span key={t} className="blog-tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 20, color: 'var(--gray-mid)', flexShrink: 0 }}>
                    {expanded === draft.id ? '−' : '+'}
                  </span>
                </div>

                <AnimatePresence>
                  {expanded === draft.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--gray-border)' }}>
                        <div style={{ paddingTop: 20, fontSize: 14, lineHeight: 1.8, color: 'var(--gray-dark)', maxHeight: 480, overflowY: 'auto', marginBottom: 20 }}>
                          {renderPostBody(draft.body)}
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button className="btn btn-dark" onClick={() => approve(draft.id)}>
                            Publish →
                          </button>
                          <button className="btn btn-outline" onClick={() => reject(draft.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
