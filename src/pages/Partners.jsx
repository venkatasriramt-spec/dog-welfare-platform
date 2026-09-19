import React, { useMemo } from 'react';
import ParticleBackground from '../components/ParticleBackground';

export default function Partners({ session, organizations = [], isWorkspace, setPage }) {
  const hospitals = useMemo(() => organizations.filter(o => o.type === 'hospital'), [organizations]);
  const agencies = useMemo(() => organizations.filter(o => o.type === 'agency'), [organizations]);

  const role = session?.profile?.role;
  const userOrgId = session?.profile?.works_at;

  const myOrg = useMemo(() => {
    if ((role === 'hospital_admin' || role === 'agency_admin') && userOrgId) {
      return organizations.find(o => o.id === userOrgId);
    }
    return null;
  }, [organizations, role, userOrgId]);

  const otherHospitals = useMemo(() => hospitals.filter(o => o.id !== myOrg?.id), [hospitals, myOrg]);
  const otherAgencies = useMemo(() => agencies.filter(o => o.id !== myOrg?.id), [agencies, myOrg]);

  const OrgCard = ({ org, defaultIcon, label }) => (
    <article style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {org.logo_url ? (
          <img src={org.logo_url} alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'contain', background: 'var(--soft)', border: '1px solid var(--line)' }} />
        ) : (
          <i style={{ fontStyle: 'normal', fontSize: '32px', background: 'var(--soft)', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid var(--line)' }}>{defaultIcon}</i>
        )}
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: '20px', color: 'var(--ink)' }}>{org.name}</h3>
          <span style={{ fontSize: '11px', background: '#f1eee7', padding: '4px 8px', borderRadius: '15px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', background: 'var(--soft)', padding: '16px', borderRadius: '8px', fontSize: '13px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', marginTop: '2px' }}>📍</span> 
          <span style={{ lineHeight: '1.4' }}>{org.address || '—'}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '16px' }}>🕒</span> 
          <span>{org.operating_hours || '—'}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '16px' }}>📞</span> 
          <span>{org.phone || '—'}</span>
        </div>
      </div>

      <button className="primary" onClick={() => setPage(`org:${org.id}`)} style={{ width: '100%', padding: '12px', marginTop: 'auto' }}>
        View Full Profile →
      </button>
    </article>
  );

  return (
    <>
      {!isWorkspace && <ParticleBackground />}
      <section className={isWorkspace ? "" : "page"} style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', height: 'auto', padding: '0', position: 'static', marginBottom: '60px' }}>
          <p className="eyebrow">— OUR NETWORK</p>
          <h1 style={{ textAlign: 'center' }}>Partners</h1>
          <p className="lead" style={{ textAlign: 'center' }}>The veterinary hospitals and adoption agencies that make our mission possible every day.</p>
        </header>

        {myOrg && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              🌟 My Organization
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
              <OrgCard org={myOrg} defaultIcon={myOrg.type === 'hospital' ? '🏥' : '🏡'} label={myOrg.type === 'hospital' ? 'Veterinary Hospital' : 'Adoption Agency'} />
            </div>
          </div>
        )}

        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🏥 Hospitals
            <span style={{ fontSize: '14px', background: 'var(--orange)', color: '#fff', padding: '4px 12px', borderRadius: '20px', verticalAlign: 'middle' }}>{otherHospitals.length}</span>
          </h2>
          {otherHospitals.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {otherHospitals.map(org => <OrgCard key={org.id} org={org} defaultIcon="🏥" label="Veterinary Hospital" />)}
            </div>
          ) : (
            <p className="empty">No other hospitals registered yet.</p>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '32px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🏡 Adoption Agencies
            <span style={{ fontSize: '14px', background: 'var(--orange)', color: '#fff', padding: '4px 12px', borderRadius: '20px', verticalAlign: 'middle' }}>{otherAgencies.length}</span>
          </h2>
          {otherAgencies.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {otherAgencies.map(org => <OrgCard key={org.id} org={org} defaultIcon="🏡" label="Adoption Agency" />)}
            </div>
          ) : (
            <p className="empty">No other adoption agencies registered yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
