import React, { useEffect, useMemo, useState } from 'react';
import { DOG_STATUSES } from '../constants';
import { watchOrgDogs } from '../services';
import HoverImageCarousel from '../components/HoverImageCarousel';

export default function StaffDogs({ session, organizations = [], setPage }) {
  const profile = session.profile;
  const isVet = profile?.role === 'veterinarian';
  
  const org = useMemo(() => organizations.find(o => o.id === profile?.works_at), [organizations, profile?.works_at]);
  const orgType = org?.type || (isVet ? 'hospital' : 'agency');

  const [orgDogs, setOrgDogs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    if (!profile?.works_at) return;
    return watchOrgDogs(profile.works_at, orgType, setOrgDogs);
  }, [profile?.works_at, orgType]);

  const list = useMemo(() => {
    let filtered = orgDogs;
    if (isVet) {
      filtered = filtered.filter(d => d.status === 'in_treatment');
    } else if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(d =>
        `${d.name} ${d.location} ${d.status} ${d.breed || ''} ${d.tag || ''} ${d.gender || ''}`.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [orgDogs, search, statusFilter, isVet]);

  const totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
  const paginatedList = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Clamp page when active list changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

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
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)' }}>
        {list.length > 0 ? (
          <>
            <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {paginatedList.map(d => (
                <article className="dog-card discover-card dog-card--enhanced" key={d.id} style={{ '--card-index': d.id }}>
                  <div className="dog-image-wrap">
                    <HoverImageCarousel images={d.social_photos} alt={d.name} className="dog-hero-img" />
                    <span className={`status ${d.status}`}>{DOG_STATUSES[d.status] || d.status}</span>
                    <span className="photo-sheen" aria-hidden="true" />
                  </div>
                  <div className="dog-card-content">
                    {d.tag && <small className="dog-tagline">{d.tag}</small>}
                    <h3>{d.name}</h3>
                    <p>{d.breed || 'Breed pending'} · {d.gender || ''}</p>
                    <button className="card-link" onClick={() => setPage(`dog:${d.id}`)}>
                      {isVet ? 'Add medical record' : 'View record'} <b>→</b>
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                <button 
                  className="outline" 
                  disabled={currentPage === 1} 
                  style={{ visibility: currentPage === 1 ? 'hidden' : 'visible' }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  ← Previous
                </button>
                <span style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--muted)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="outline" 
                  disabled={currentPage === totalPages} 
                  style={{ visibility: currentPage === totalPages ? 'hidden' : 'visible' }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
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
