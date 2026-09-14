import React, { useEffect, useMemo, useState } from 'react';
import { DOG_STATUSES } from '../constants';
import { watchOrgDogs } from '../services';

export default function StaffDogs({ session, organizations = [], setPage }) {
  const profile = session.profile;
  const isVet = profile?.role === 'veterinarian';
  
  const org = useMemo(() => organizations.find(o => o.id === profile?.works_at), [organizations, profile?.works_at]);
  const orgType = org?.type || (isVet ? 'hospital' : 'agency');

  const [orgDogs, setOrgDogs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!profile?.works_at) return;
    return watchOrgDogs(profile.works_at, orgType, setOrgDogs);
  }, [profile?.works_at, orgType]);

  const list = useMemo(() => {
    let filtered = orgDogs;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(d =>
        `${d.name} ${d.location} ${d.status} ${d.breed || ''} ${d.tag || ''} ${d.gender || ''}`.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [orgDogs, search, statusFilter]);

  // Determine available statuses in the org for the filter dropdown
  const availableStatuses = useMemo(() => {
    const statuses = new Set(orgDogs.map(d => d.status));
    return Array.from(statuses);
  }, [orgDogs]);

  return (
    <section className="workspace-page">
      <div className="discover-heading">
        <div>
          <p className="eyebrow">— {isVet ? '🩺 MEDICAL WORKSTATION' : '🏡 CARE WORKSTATION'}</p>
          <h2>{isVet ? 'All Active Patients' : 'All Shelter Dogs'}</h2>
        </div>
        <p className="discover-summary"><b>{list.length}</b> {list.length === 1 ? 'dog matches' : 'dogs match'} your filter.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="search search-toolbar" style={{ marginBottom: '32px' }}>
        <label className="search-field">
          <span className="sr-only">Search dogs</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4" /><path d="m16 16 4.2 4.2" /></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, breed, tag, location..."
          />
        </label>
        <label className="select-field">
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({orgDogs.length})</option>
            {availableStatuses.map(key => (
              <option key={key} value={key}>
                {DOG_STATUSES[key] || key} ({orgDogs.filter(d => d.status === key).length})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)' }}>
        {list.length > 0 ? (
          <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {list.map(d => (
              <article className="dog-card" key={d.id} style={{ background: '#f7f5f0' }}>
                {d.social_photos && d.social_photos.length > 0 ? (
                  <img src={d.social_photos[0]} alt={d.name} />
                ) : (
                  <div className="dog-placeholder">🐾</div>
                )}
                <span className={`status ${d.status}`}>{DOG_STATUSES[d.status] || d.status}</span>
                <div style={{ padding: '16px' }}>
                  {d.tag && <small style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{d.tag}</small>}
                  <h3>{d.name}</h3>
                  <p>{d.breed || 'Breed pending'} · {d.gender || ''}</p>
                  <button className="link" onClick={() => setPage(`dog:${d.id}`)}>
                    {isVet ? 'Add medical record →' : 'View record →'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <b>{search || statusFilter !== 'all' ? 'No dogs match your search.' : 'No dogs are currently assigned to your organization.'}</b>
            <p>Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}
