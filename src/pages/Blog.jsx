import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Reveal from '../components/Reveal.jsx'

const API = 'https://tig-blog-agent.burke-ruder.workers.dev'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function PostCard({ post, onClick }) {
  return (
    <Reveal>
      <motion.div
        className="blog-card"
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onClick={() => onClick(post)}
        style={{ cursor: 'pointer' }}
      >
        {post.tags?.length > 0 && (
          <div className="blog-tags">
            {post.tags.slice(0, 2).map(t => (
              <span key={t} className="blog-tag">{t}</span>
            ))}
          </div>
        )}
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
        <div className="blog-card-meta">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="blog-read-more">Read →</span>
        </div>
      </motion.div>
    </Reveal>
  )
}

function PostView({ post, onBack }) {
  const lines = post.body.split('\n')

  const renderBody = (body) => {
    return body.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="blog-post-h2">{line.slice(3)}</h2>
      if (line.startsWith('# ')) return <h1 key={i} className="blog-post-h1">{line.slice(2)}</h1>
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="blog-post-p">{line}</p>
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <button className="blog-back" onClick={onBack}>← Back to all posts</button>
      <div className="blog-post-header">
        {post.tags?.length > 0 && (
          <div className="blog-tags" style={{ marginBottom: 16 }}>
            {post.tags.map(t => <span key={t} className="blog-tag">{t}</span>)}
          </div>
        )}
        <h1 className="blog-post-title">{post.title}</h1>
        <p className="blog-post-date">{formatDate(post.publishedAt)}</p>
      </div>
      <div className="blog-post-body">
        {renderBody(post.body)}
      </div>
    </motion.div>
  )
}

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activePost, setActivePost] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/blog`)
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (activePost) {
    return (
      <section className="section">
        <div className="container-mid">
          <PostView post={activePost} onBack={() => setActivePost(null)} />
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <span className="eyebrow">Insights</span>
          <h1 className="headline-lg" style={{ marginBottom: 12 }}>The TIG Brief</h1>
          <p className="body-lg" style={{ marginBottom: 56, maxWidth: 560 }}>
            Practical advice on business technology — no jargon, no pitch.
          </p>
        </Reveal>

        {loading && (
          <p className="body-sm" style={{ color: 'var(--gray-mid)' }}>Loading posts…</p>
        )}

        {!loading && posts.length === 0 && (
          <p className="body-sm" style={{ color: 'var(--gray-mid)' }}>
            First posts coming soon.
          </p>
        )}

        <div className="blog-grid">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onClick={setActivePost} />
          ))}
        </div>
      </div>
    </section>
  )
}
