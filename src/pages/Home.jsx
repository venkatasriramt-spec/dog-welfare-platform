import React, { useMemo } from 'react';
import ParticleBackground from '../components/ParticleBackground';

export default function Home({ setPage, dogs, organizations = [] }) {
  const hospitals = organizations.filter(o => o.type === 'hospital').length;
  const agencies = organizations.filter(o => o.type === 'agency').length;

  const stats = useMemo(() => [
    { value: dogs.length, label: 'Dogs registered', icon: '🐾', color: 'var(--orange)' },
    { value: hospitals, label: 'Partner hospitals', icon: '🏥', color: 'var(--mint)' },
    { value: agencies, label: 'Adoption agencies', icon: '🏠', color: 'var(--sky)' },
  ], [dogs.length, hospitals, agencies]);

  return (
    <>
      {/* Particle Background */}
      <ParticleBackground mode="hero" colorScheme="vibrant" particleCount={80} />

      <section className="hero hero-vibrant">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-spark">✦</span> WELFARE, MADE CONNECTED</p>
          <h1>
            Every street dog<br />
            deserves a <em className="gradient-text">way home.</em>
          </h1>
          <p className="lead">
            PawPath connects communities, clinics, and adoption agencies to protect, treat, and rehome the dogs who need us most.
          </p>
          <div className="actions">
            <button className="primary btn-magnetic" onClick={() => setPage('discover')}>
              <span>Explore the community</span> <b aria-hidden="true">→</b>
            </button>
            <button className="link" onClick={() => setPage('about')}>
              How PawPath works <span aria-hidden="true">↓</span>
            </button>
          </div>
          <div className="hero-proof" aria-label="PawPath network impact">
            <div className="avatar-stack" aria-hidden="true">
              <span>♥</span><span>+</span><span>✦</span>
            </div>
            <p><b>One shared care story</b><span>for every dog, from first sighting to home.</span></p>
          </div>
        </div>

        <div className="hero-image" aria-label="A rescue dog framed by PawPath's connected care network">
          <div className="hero-grid" aria-hidden="true" />
          <div className="sun" aria-hidden="true" />
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
          <svg className="hero-route" viewBox="0 0 520 520" fill="none" aria-hidden="true">
            <path d="M96 382C68 286 156 246 230 284c81 42 161-15 137-102-16-59 69-87 98-27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 12" />
            <circle cx="96" cy="382" r="7" fill="currentColor" />
            <circle cx="465" cy="155" r="7" fill="currentColor" />
          </svg>
          <figure className="hero-photo">
            <img
              src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85"
              alt="Happy rescue dog"
            />
            <figcaption><span className="pulse-dot" /> Care is better, together</figcaption>
          </figure>
          <div className="float top">
            <span className="float-icon">✦</span>
            <span><b>Seen & supported</b><small>A community that notices</small></span>
          </div>
          <div className="float bottom">
            <span className="float-icon heart">♥</span>
            <span><b>Every step matters</b><small>From care to adoption</small></span>
          </div>
        </div>
      </section>

      <section className="numbers" aria-labelledby="impact-heading">
        <h2 id="impact-heading" className="sr-only">Our Impact</h2>
        <div className="numbers-intro">
          <span className="numbers-spark" aria-hidden="true">✦</span>
          <p>Real records create <em>real change.</em></p>
        </div>
        {stats.map((stat) => (
          <div key={stat.label} className="number-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{stat.icon}</span>
              <b className="counter-value" style={{ color: stat.color, fontSize: '31px' }}>{stat.value.toLocaleString()}</b>
            </div>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.1px', color: '#c8d8cf' }}>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="care-journey">
        <div className="journey-copy">
          <p className="eyebrow"><span className="eyebrow-spark">✦</span> THE PAWPATH EFFECT</p>
          <h2>A clear path from <em className="gradient-text">&#8220;I saw them&#8221;</em> to &#8220;they&#8217;re home.&#8221;</h2>
          <p className="lead">
            PawPath keeps the whole care network in step, so a single report can become a coordinated rescue story.
          </p>
          <button className="link journey-link" onClick={() => setPage('about')}>
            See how the network works <span aria-hidden="true">&#8594;</span>
          </button>
        </div>

        <div className="journey-board" aria-label="The PawPath care journey">
          <svg className="journey-line" viewBox="0 0 600 350" fill="none" aria-hidden="true">
            <path d="M62 275C124 164 191 300 272 202c74-89 125 12 186-86 28-45 60-38 82-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 11" />
          </svg>
          <article className="journey-card report-card">
            <span className="journey-number">01</span>
            <span className="journey-icon">◉</span>
            <h3>Notice</h3>
            <p>A sighting becomes a shared signal.</p>
          </article>
          <article className="journey-card care-card">
            <span className="journey-number">02</span>
            <span className="journey-icon">+</span>
            <h3>Care</h3>
            <p>Clinics can act with the full story.</p>
          </article>
          <article className="journey-card home-card">
            <span className="journey-number">03</span>
            <span className="journey-icon">♥</span>
            <h3>Home</h3>
            <p>Agencies help a dog land safely.</p>
          </article>
          <span className="journey-paw" aria-hidden="true">✦</span>
        </div>
      </section>
    </>
  );
}