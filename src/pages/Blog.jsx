import { useState, useEffect } from 'react'
import { motion, useScroll } from 'framer-motion'
import Reveal from '../components/Reveal.jsx'
import renderPostBody from '../utils/renderPostBody.jsx'

const API = 'https://tig-blog-agent.burke-ruder.workers.dev'

const SHARE_TARGETS = [
  { label: 'X', build: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  { label: 'Facebook', build: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { label: 'Reddit', build: (url, text) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}` },
  { label: 'WhatsApp', build: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
  { label: 'Threads', build: (url, text) => `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text} ${url}`)}` },
  { label: 'Email', build: (url, text) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}` },
]

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function estimateReadingTime(body) {
  const words = body.replace(/[#*_>`]/g, '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 225))
}

function ReadingProgressBar() {
  const { scrollYProgress } = useScroll()
  return <motion.div className="blog-progress-bar" style={{ scaleX: scrollYProgress }} />
}

function ShareBar({ post }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="blog-share">
      <span className="blog-share-label">Share</span>
      {SHARE_TARGETS.map((s, i) => (
        <motion.a
          key={s.label}
          href={s.build(url, post.title)}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-btn"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
        >
          {s.label}
        </motion.a>
      ))}
      <motion.button
        className="blog-share-btn"
        onClick={copyLink}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.94 }}
      >
        {copied ? 'Copied ✓' : 'Copy link'}
      </motion.button>
    </div>
  )
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
          <span>{formatDate(post.publishedAt)} · {estimateReadingTime(post.body)} min read</span>
          <span className="blog-read-more">Read →</span>
        </div>
      </motion.div>
    </Reveal>
  )
}

function PostView({ post, onBack }) {
  const minutes = estimateReadingTime(post.body)

  return (
    <>
      <ReadingProgressBar />
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
          <p className="blog-post-date">{formatDate(post.publishedAt)} · {minutes} min read</p>
          <ShareBar post={post} />
        </div>
        <div className="blog-post-body">
          {renderPostBody(post.body, { h1: 'blog-post-h1', h2: 'blog-post-h2', p: 'blog-post-p' })}
        </div>
        <div className="blog-post-footer-share">
          <p className="body-sm" style={{ marginBottom: 12, color: 'var(--gray-mid)' }}>Found this useful? Share it.</p>
          <ShareBar post={post} />
        </div>
      </motion.div>
    </>
  )
}

export default function Blog({ initialSlug }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activePost, setActivePost] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/blog`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setPosts(list)
        if (initialSlug) {
          const match = list.find(p => p.slug === initialSlug)
          if (match) setActivePost(match)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [initialSlug])

  const openPost = (post) => {
    setActivePost(post)
    window.location.hash = `blog/${post.slug}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closePost = () => {
    setActivePost(null)
    window.location.hash = 'blog'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (activePost) {
    return (
      <section className="section">
        <div className="container-mid">
          <PostView post={activePost} onBack={closePost} />
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
            <PostCard key={post.id} post={post} onClick={openPost} />
          ))}
        </div>
      </div>
    </section>
  )
}
