import React, { useEffect, useState } from 'react';
import { addOrgStaff, watchOrgStaff } from '../services';

export default function StaffManager({ organizationId, roleType, orgName }) {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', title: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isHospital = roleType === 'hospital_admin';
  const staffTitleSingular = isHospital ? 'Doctor / Veterinarian' : 'Staff Member / Employee';
  const staffTitlePlural = isHospital ? 'Doctors & Veterinary Staff' : 'Agency Employees & Staff';

  useEffect(() => {
    if (!organizationId) return;
    const unsubscribe = watchOrgStaff(organizationId, setStaffList);
    return () => unsubscribe();
  }, [organizationId]);

  const submit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await addOrgStaff(form);
      setMessage(`Successfully added ${form.name} as a new ${staffTitleSingular.toLowerCase()}!`);
      setForm({ name: '', email: '', password: '', title: '' });
    } catch (err) {
      console.error('Failed to add staff member:', err);
      setError(err.message || `Failed to add ${staffTitleSingular.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-manager">
      <div className="staff-section-header" style={{ marginBottom: '24px' }}>
        <h3>{staffTitlePlural} ({staffList.length})</h3>
        <p className="lead" style={{ fontSize: '14px' }}>
          Manage members registered under <strong>{orgName || 'your organisation'}</strong>. You can add new {isHospital ? 'doctors' : 'employees'} directly below.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
        {/* Left column: Staff Directory List */}
        <div>
          {staffList.length > 0 ? (
            <div className="staff-grid" style={{ display: 'grid', gap: '12px' }}>
              {staffList.map(member => (
                <article
                  key={member.id}
                  className="application"
                  style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '6px', padding: '16px 20px' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <b>{member.full_name}</b>
                      <span
                        className="status"
                        style={{
                          position: 'static',
                          background: isHospital ? '#e0f2fe' : '#f3e8ff',
                          color: isHospital ? '#0369a1' : '#6b21a8'
                        }}
                      >
                        {member.role === 'veterinarian' ? 'Doctor / Vet' : 'Agency Employee'}
                      </span>
                    </div>
                    <small style={{ display: 'block', color: 'var(--muted)', marginTop: '4px' }}>
                      {member.email} · {member.title || (isHospital ? 'General Vet' : 'Staff')}
                    </small>
                  </div>
                  <div>
                    <small style={{ color: '#888' }}>
                      {member.is_active ? '● Active' : 'Inactive'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '6px' }}>
              No {isHospital ? 'doctors' : 'employees'} registered under this organisation yet. Use the form to add your first team member!
            </div>
          )}
        </div>

        {/* Right column: Add Staff Member Form */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)' }}>
          <h4 style={{ margin: '0 0 14px 0', fontSize: '18px', fontFamily: 'Fraunces, serif' }}>
            + Add New {staffTitleSingular}
          </h4>

          <form onSubmit={submit} style={{ display: 'grid', gap: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
              Full name
              <input
                required
                type="text"
                placeholder="e.g. Dr. Jane Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>

            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
              Email address
              <input
                required
                type="email"
                placeholder="email@organisation.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>

            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
              Initial password
              <input
                required
                type="password"
                minLength="6"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>

            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
              {isHospital ? 'Specialization / Role Title' : 'Job Position / Title'}
              <input
                type="text"
                placeholder={isHospital ? 'e.g. Veterinary Surgeon, Vaccination Lead' : 'e.g. Adoption Coordinator, Shelter Manager'}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>

            {message && <div className="setup-link" style={{ color: '#45623d', background: '#e0ecd8', fontSize: '12px', margin: '6px 0' }}><b>{message}</b></div>}
            {error && <p className="form-error" style={{ fontSize: '12px' }}>{error}</p>}

            <button className="primary" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
              {loading ? 'Adding…' : `Add ${staffTitleSingular} →`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
