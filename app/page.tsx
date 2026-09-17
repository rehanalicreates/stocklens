'use client'

import { useState } from 'react'
import Link from 'next/link'
import Dither from '@/components/dither-background'
import { LiveClock } from '@/components/LiveClock'

const stats = [
  ['24.8k', 'tracked today'],
  ['$1.9m', 'tracked in session'],
  ['4.8x', 'watchlist tracking'],
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="finance-app">
      {menuOpen && <div style={{position:'fixed',top:0,left:0,background:'red',color:'white',padding:'4px',zIndex:9999}}>OPEN</div>}
      {!menuOpen && <div style={{position:'fixed',top:0,left:0,background:'blue',color:'white',padding:'4px',zIndex:9999}}>CLOSED</div>}
      <div className="background-canvas" aria-hidden="true">
        <Dither
          waveColor={[0.32, 0.15, 1]}
          backgroundColor={[0.01, 0, 0.03]}
          disableAnimation={false}
          enableMouseInteraction={false}
          colorNum={4}
          pixelSize={2}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.22}
        />
      </div>
      <div className="background-wash" aria-hidden="true" />

      <header className="site-header">
        <Link href="/" className="wordmark">
          <span className="wordmark-mark">×</span>StockLens
        </Link>
        <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '×' : '•••'}
        </button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Primary navigation">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="#signals" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="#why" onClick={() => setMenuOpen(false)}>Features</Link>
          <Link href="#community" onClick={() => setMenuOpen(false)}>Join Us</Link>
        </nav>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-kicker"><span className="pulse" /> the calmer way to stay ahead</div>
        <h1>Make sense<br />of the <i>noise.</i></h1>
        <p className="hero-copy">StockLens turns market movement into a signal you can actually use. Track what matters, understand why it moves, and make your next move with a little more confidence.</p>
        <div className="hero-actions">
          <Link className="primary-button" href="/dashboard" onClick={() => setMenuOpen(false)} style={{ minWidth: '180px' }}>Get Started <span>↗</span></Link>
        </div>
        <div className="hero-note"><span>01</span> Built for curious people, not finance bros.</div>
      </section>

      <div className="mascot-stage" aria-hidden="true">
        <img src="/mascot-cat.png" alt="" className="mascot-cat" />
        <span className="mascot-caption">your signal, in motion</span>
      </div>

      <Link href="/dashboard" className="signal-card" id="signals" aria-label="Live StockLens signal - Tap to open dashboard">
        <div className="signal-card-top"><span>LIVE DATA / Real-time</span><span className="live-label"><span className="pulse" /> live now</span></div>
        <div className="signal-row"><div><p className="signal-label">market mood</p><strong>quietly<br /><em>optimistic</em></strong></div><div className="signal-score">+72 <span>↑</span></div></div>
        <div className="signal-bars" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
        <div className="signal-footer"><span>updated 12 sec ago</span><span>tap to explore ↗</span></div>
      </Link>

      <section className="stats-section" id="why">
        <div className="section-heading"><span className="small-index">02</span><h2>Less noise.<br /><i>More signal.</i></h2></div>
        <p className="section-copy">A daily pulse for your money and the world moving around it. No doomscrolling. No jargon. Just the context you need, when you need it.</p>
        <div className="stats-grid">{stats.map(([value, label]) => <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      </section>

      <section className="join-section" id="community">
        <div className="join-section-left">
          <span className="small-index">03</span><h2>Stay in the<br /><i>loop.</i></h2><p>Get one sharp, useful market note in your inbox every morning.</p>
          <Link className="primary-button" href="/dashboard">Get Started <span>↗</span></Link>
        </div>
        <div className="join-section-right">
          <LiveClock />
        </div>
      </section>

      <footer><span>© 2026 StockLens</span><span>made for the next move</span></footer>
    </main>
  )
}
