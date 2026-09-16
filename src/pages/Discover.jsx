import React, { useEffect, useMemo, useState } from 'react';
import { DOG_STATUSES } from '../constants';
import ParticleBackground from '../components/ParticleBackground';
import HoverImageCarousel from '../components/HoverImageCarousel';

export default function Discover({ dogs, setPage, session, isWorkspace }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const list = useMemo(() => {
    let filtered = dogs;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(d =>
        `${d.name} ${d.location} ${d.status} ${d.breed || ''} ${d.tag || ''} ${d.gender || ''}`.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [dogs, search, statusFilter]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;

  // Clamp page when active list changes
  useEffect(() => {
    setCurrentPage(prev => prev > totalPages ? totalPages : prev);
  }, [totalPages]);

  const paginatedList = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      {/* Particle Background */}
      {!isWorkspace && <ParticleBackground mode="discover" colorScheme="default" particleCount={50} />}

      <section className={isWorkspace ? "workspace-page discover" : "page discover"}>
        <div className="discover-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-spark">✦</span> COMMUNITY HUB</p>
            <h2>
              Find your place<br />
              in their <em className="gradient-text">story.</em>
            </h2>
          </div>
          <p className="discover-summary"><b>{list.length}</b> {list.length === 1 ? 'dog is' : 'dogs are'} waiting to be seen.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="search search-toolbar">
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
              <option value="all">All Statuses ({dogs.length})</option>
              {Object.entries(DOG_STATUSES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({dogs.filter(d => d.status === key).length})
                </option>
              ))}
            </select>
          </label>
          {session?.user && (
            <button className="primary btn-magnetic" onClick={() => setPage('report')}>
              <span aria-hidden="true">+</span> Report a dog
            </button>
          )}
        </div>

        {list.length ? (
          <>
            <div className="dog-grid">
              {paginatedList.map((d, index) => (
                <article
                  key={d.id}
                  className="dog-card discover-card dog-card--enhanced"
                  style={{ '--card-index': index }}
                >
                  <div className="dog-image-wrap">
                    <HoverImageCarousel images={d.social_photos} alt={d.name} className="dog-hero-img" />
                    <span className={`status ${d.status}`}>{DOG_STATUSES[d.status] || d.status}</span>
                    <span className="photo-sheen" aria-hidden="true" />
                  </div>
                  <div className="dog-card-content">
                    {d.tag && (
                      <small className="dog-tagline">
                        {d.tag}
                      </small>
                    )}
                    <h3>{d.name}</h3>
                    <p>
                      {d.breed && d.breed !== 'Unknown / Unidentified' ? d.breed : 'Breed pending'}
                      {d.gender && d.gender !== 'Unknown' ? ` · ${d.gender}` : ''}
                      {d.estimated_age ? ` · ${d.estimated_age}` : ''}
                    </p>
                    <p className="dog-location">
                      <span aria-hidden="true">⌖</span> {d.location || d.location_found || 'Location unknown'}
                    </p>
                    <div className="dog-care-facts">
                      {d.medical_status?.is_vaccinated && <span>Vaccinated</span>}
                      {d.medical_status?.is_neutered && <span>Neutered</span>}
                    </div>
                    <button className="card-link" onClick={() => setPage(`dog:${d.id}`)}>
                      <span>View full profile</span><b aria-hidden="true">→</b>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
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
            <b>{search || statusFilter !== 'all' ? 'No dogs match your search.' : 'No dogs have been registered yet.'}</b>
            <p>{!search && statusFilter === 'all' ? 'Sign in as a community member to submit the first report.' : 'Try adjusting your search or filter.'}</p>
          </div>
        )}
      </section>
    </>
  );
}