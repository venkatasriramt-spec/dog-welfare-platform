import React from 'react';
import ParticleBackground from '../components/ParticleBackground';

export default function About() {
  const steps = [
    ['01', '◎', 'See & report', 'Community members report dogs needing help.'],
    ['02', '✚', 'Treat & track', 'Partner hospitals coordinate care.'],
    ['03', '♡', 'Love & rehome', 'Agencies find each dog a home.']
  ];

  return (
    <>
      <ParticleBackground mode="subtle" colorScheme="cool" particleCount={30} />

      <section className="page about">
        <div>
          <p className="eyebrow"><span className="eyebrow-spark">✦</span> OUR MISSION</p>
          <h2>
            A kinder system,<br />
            <em className="gradient-text">built together.</em>
          </h2>
          <p className="lead wide">
            PawPath turns each sighting into a connected journey of care, from report to treatment and adoption.
          </p>
        </div>

        <div className="steps">
          {steps.map((x) => (
            <article key={x[0]}>
              <small>{x[0]}</small>
              <i>{x[1]}</i>
              <h3>{x[2]}</h3>
              <p>{x[3]}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}