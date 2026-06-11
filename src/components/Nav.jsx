import { useState, useEffect } from 'react'

export default function Nav({ page, navigate }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="nav" style={{ boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none' }}>
      {/* Logo — text only */}
      <div className="nav-logo" onClick={() => navigate('home')}>
        <span className="nav-logo-the">THE</span>
        <span className="nav-logo-rest">Interesting Group</span>
      </div>

      {/* Links */}
      <ul className="nav-links">
        <li>
          <a
            href="#"
            onClick={e => { e.preventDefault(); navigate('home') }}
            style={{ color: page === 'home' ? 'var(--black)' : undefined, fontWeight: page === 'home' ? 500 : undefined }}
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#"
            onClick={e => { e.preventDefault(); navigate('portfolio') }}
            style={{ color: page === 'portfolio' ? 'var(--black)' : undefined, fontWeight: page === 'portfolio' ? 500 : undefined }}
          >
            What We Handle
          </a>
        </li>
        <li>
          <a
            href="#"
            onClick={e => { e.preventDefault(); navigate('about') }}
            style={{ color: page === 'about' ? 'var(--black)' : undefined, fontWeight: page === 'about' ? 500 : undefined }}
          >
            About
          </a>
        </li>
      </ul>

      {/* CTA */}
      <a
        href="#"
        onClick={e => { e.preventDefault(); navigate('contact') }}
        className="nav-cta"
      >
        Get in Touch
      </a>
    </nav>
  )
}
