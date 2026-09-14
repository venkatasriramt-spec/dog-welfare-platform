import React, { useMemo, useState, useEffect } from 'react';
import { approveApplication, declineApplication } from '../../services';

export default function PlatformAdminView({ dogs = [], organizations = [], applications = [], setPage, currentTab = 'overview' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [setupLink, setSetupLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchQuery('');
  }, [currentTab]);

  const hospitals = useMemo(() => organizations.filter(o => o.type === 'hospital'), [organizations]);
  const agencies = useMemo(() => organizations.filter(o => o.type === 'agency'), [organizations]);

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(a =>
      a.organization_name?.toLowerCase().includes(q) ||
      a.contact_name?.toLowerCase().includes(q) ||
      a.contact_email?.toLowerCase().includes(q)
    );
  }, [applications, searchQuery]);

  const filteredHospitals = useMemo(() => {
    if (!searchQuery.trim()) return hospitals;
    const q = searchQuery.toLowerCase();
    return hospitals.filter(h =>
      h.name?.toLowerCase().includes(q) ||
      h.email?.toLowerCase().includes(q) ||
      h.phone?.includes(q) ||
      h.address?.toLowerCase().includes(q)
    );
  }, [hospitals, searchQuery]);

  const filteredAgencies = useMemo(() => {
    if (!searchQuery.trim()) return agencies;
    const q = searchQuery.toLowerCase();
    return agencies.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.includes(q) ||
      a.address?.toLowerCase().includes(q)
    );
  }, [agencies, searchQuery]);

  const approve = async id => {
    setError(''); setSetupLink('');
    try {
      await approveApplication(id);
      setSetupLink('Organisation approved successfully! Their account has been automatically upgraded.');
    } catch (err) {
      console.error('Approval failed details:', err);
      setError(err.message || 'Could not approve organisation.');
    }
  };

  const decline = async id => {
    const reason = window.prompt("Reason for declining (optional):");
    if (reason === null) return;
    setError(''); setSetupLink('');
    try {
      await declineApplication(id, reason);
      setSetupLink('Organisation application declined.');
    } catch (err) {
      console.error('Decline failed details:', err);
      setError(err.message || 'Could not decline application.');
    }
  };

  return (
    <>
      {currentTab === 'overview' && (
        <>
          <p className="lead">Platform overview & live network analytics.</p>
          <div className="metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <article>
              <b>{dogs.length}</b>
              <span>Total Dogs</span>
            </article>
            <article>
              <b>{hospitals.length}</b>
              <span>Active Hospitals</span>
            </article>
            <article>
              <b>{agencies.length}</b>
              <span>Adoption Agencies</span>
            </article>
            <article>
              <b>{applications.length}</b>
              <span>Pending Requests</span>
            </article>
          </div>

          <h3>Recent Dogs in Network</h3>
          <div className="dashboard-dogs">
            {dogs.slice(0, 5).map(d => (
              <button key={d.id} onClick={() => setPage(`dog:${d.id}`)}>
                <span>
                  <b>{d.name}</b>
                  <small>{d.location} · {d.status}</small>
                </span>
                <small>View →</small>
              </button>
            ))}
            {dogs.length === 0 && <div className="empty">No dogs registered in the network yet.</div>}
          </div>
        </>
      )}

      {currentTab === 'pending' && (
        <>
          <p className="lead">Review pending partner requests. Approved organisations are instantly activated.</p>
          <div className="admin-search" style={{ marginBottom: '20px' }}>
            <div className="search search-toolbar" style={{ width: '100%', maxWidth: '400px', margin: 0 }}>
              <label className="search-field">
                <span className="sr-only">Search pending applications</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4" /><path d="m16 16 4.2 4.2" /></svg>
                <input
                  type="text"
                  placeholder="Search pending applications..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </label>
            </div>
          </div>
          <h3>Pending Organisation Applications ({filteredApplications.length})</h3>
          {filteredApplications.length ? (
            filteredApplications.map(a => (
              <article className="application" key={a.id}>
                <div>
                  <b>{a.organization_name}</b>
                  <small>{a.type} · {a.contact_name} · {a.contact_email}</small>
                  <small>{a.address} · {a.phone}</small>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="outline" onClick={() => decline(a.id)}>Decline</button>
                  <button className="primary" onClick={() => approve(a.id)}>Approve →</button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty">No pending applications found.</div>
          )}
          {error && <p className="form-error">{error}</p>}
          {setupLink && <div className="setup-link" style={{ color: '#45623d', background: '#e0ecd8' }}><b>{setupLink}</b></div>}
        </>
      )}

      {currentTab === 'hospitals' && (
        <>
          <p className="lead">Active veterinary clinics and hospitals verified on PawPath.</p>
          <div className="admin-search" style={{ marginBottom: '20px' }}>
            <div className="search search-toolbar" style={{ width: '100%', maxWidth: '400px', margin: 0 }}>
              <label className="search-field">
                <span className="sr-only">Search hospitals</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4" /><path d="m16 16 4.2 4.2" /></svg>
                <input
                  type="text"
                  placeholder="Search hospitals by name, email, or location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </label>
            </div>
          </div>
          <h3>Active Hospitals ({filteredHospitals.length})</h3>
          {filteredHospitals.length ? (
            filteredHospitals.map(h => (
              <article className="application" key={h.id}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <b>{h.name}</b>
                    <span className="status" style={{ position: 'static', background: '#e1f5fe', color: '#0288d1' }}>Hospital</span>
                  </div>
                  <small>{h.email} · {h.phone}</small>
                  <small>{h.address}</small>
                </div>
                <div>
                  <small style={{ color: '#6e7c77' }}>Admin UID: {h.admin_uid}</small>
                </div>
              </article>
            ))
          ) : (
            <div className="empty">No active hospitals registered.</div>
          )}
        </>
      )}

      {currentTab === 'agencies' && (
        <>
          <p className="lead">Active adoption agencies and shelters verified on PawPath.</p>
          <div className="admin-search" style={{ marginBottom: '20px' }}>
            <div className="search search-toolbar" style={{ width: '100%', maxWidth: '400px', margin: 0 }}>
              <label className="search-field">
                <span className="sr-only">Search agencies</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4" /><path d="m16 16 4.2 4.2" /></svg>
                <input
                  type="text"
                  placeholder="Search agencies by name, email, or location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </label>
            </div>
          </div>
          <h3>Active Adoption Agencies ({filteredAgencies.length})</h3>
          {filteredAgencies.length ? (
            filteredAgencies.map(ag => (
              <article className="application" key={ag.id}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <b>{ag.name}</b>
                    <span className="status" style={{ position: 'static', background: '#f3e5f5', color: '#7b1fa2' }}>Adoption Agency</span>
                  </div>
                  <small>{ag.email} · {ag.phone}</small>
                  <small>{ag.address}</small>
                </div>
                <div>
                  <small style={{ color: '#6e7c77' }}>Admin UID: {ag.admin_uid}</small>
                </div>
              </article>
            ))
          ) : (
            <div className="empty">No active adoption agencies registered.</div>
          )}
        </>
      )}
    </>
  );
}
