import React, { useState, useMemo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ParticleBackground from '../components/ParticleBackground';

export default function Partners({ session, organizations = [], isWorkspace }) {
  const [editingOrg, setEditingOrg] = useState(null);
  const [editForm, setEditForm] = useState({ phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);

  const hospitals = useMemo(() => organizations.filter(o => o.type === 'hospital'), [organizations]);
  const agencies = useMemo(() => organizations.filter(o => o.type === 'agency'), [organizations]);

  const role = session?.profile?.role;
  const userOrgId = session?.profile?.works_at;
  
  const canEdit = (orgId) => {
    if (role === 'platform_admin') return true;
    if (userOrgId === orgId && (role === 'hospital_admin' || role === 'agency_admin')) return true;
    return false;
  };

  const handleEditClick = (org) => {
    setEditingOrg(org.id);
    setEditForm({
      phone: org.phone || '',
      email: org.email || '',
      address: org.address || ''
    });
  };

  const handleSave = async (e, orgId) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'Organizations', orgId), {
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        address: editForm.address.trim()
      });
      setEditingOrg(null);
    } catch (err) {
      alert("Failed to update organization: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const OrgCard = ({ org, icon, label }) => (
    <article style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <i style={{ fontStyle: 'normal', fontSize: '32px', background: 'var(--soft)', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>{icon}</i>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '20px', color: 'var(--ink)' }}>{org.name}</h3>
            <span style={{ fontSize: '11px', background: '#f1eee7', padding: '4px 8px', borderRadius: '15px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </span>
          </div>
        </div>
        {canEdit(org.id) && editingOrg !== org.id && (
          <button className="outline" onClick={() => handleEditClick(org)} style={{ padding: '6px 14px', fontSize: '13px' }}>
            Edit
          </button>
        )}
      </div>

      {editingOrg === org.id ? (
        <form onSubmit={(e) => handleSave(e, org.id)} style={{ background: '#fbfaf5', padding: '20px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Email Address</label>
            <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Phone Number</label>
            <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Physical Address</label>
            <textarea value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} required rows={2} style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="primary" disabled={loading} style={{ padding: '10px 16px', fontSize: '14px' }}>{loading ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="outline" onClick={() => setEditingOrg(null)} style={{ padding: '10px 16px', fontSize: '14px' }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '16px' }}>✉️</span> 
            <span>{org.email || 'Not provided'}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '16px' }}>📞</span> 
            <span>{org.phone || 'Not provided'}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '16px', marginTop: '2px' }}>📍</span> 
            <span style={{ lineHeight: '1.4' }}>{org.address || 'Not provided'}</span>
          </div>
        </div>
      )}
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

        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🏥 Hospitals
            <span style={{ fontSize: '14px', background: 'var(--orange)', color: '#fff', padding: '4px 12px', borderRadius: '20px', verticalAlign: 'middle' }}>{hospitals.length}</span>
          </h2>
          {hospitals.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              {hospitals.map(org => <OrgCard key={org.id} org={org} icon="🏥" label="Veterinary Hospital" />)}
            </div>
          ) : (
            <p className="empty">No hospitals registered yet.</p>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '32px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🏡 Adoption Agencies
            <span style={{ fontSize: '14px', background: 'var(--orange)', color: '#fff', padding: '4px 12px', borderRadius: '20px', verticalAlign: 'middle' }}>{agencies.length}</span>
          </h2>
          {agencies.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              {agencies.map(org => <OrgCard key={org.id} org={org} icon="🏡" label="Adoption Agency" />)}
            </div>
          ) : (
            <p className="empty">No adoption agencies registered yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
