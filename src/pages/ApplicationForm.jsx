import React, { useState } from 'react';
import { registerPartner, submitApplication } from '../services';

export default function ApplicationForm({ session, setPage, isWorkspace }) {
  const [form, setForm] = useState({
    organization_name: '',
    type: 'hospital',
    contact_name: session?.profile?.full_name || '',
    contact_email: session?.user?.email || '',
    password: '',
    phone: '',
    address: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!session?.user) {
        await registerPartner(form);
      } else {
        await submitApplication(form, session.user.uid);
      }
      setSubmitted(true);
    } catch (err) {
      const raw = err.message || '';
      if (raw.includes('email-already-in-use') || raw.includes('auth/email-already-in-use')) {
        setError('An account with this email address already exists. Please sign in instead.');
      } else if (raw.includes('permission') || raw.includes('insufficient')) {
        setError('Could not submit your application. Please ensure all fields are correct and try again.');
      } else {
        setError(raw.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)\.?/, '').trim());
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className={isWorkspace ? "workspace-page form-page" : "page form-page"}>
        <div className="success-panel">
          <div className="success-icon">✓</div>
          <p className="eyebrow">— APPLICATION RECEIVED</p>
          <h2>Thank you for <em>joining us.</em></h2>
          <p className="lead">
            Your application for <strong>{form.organization_name}</strong> has been received and is now under review. Our platform administrator will evaluate your submission and activate your account shortly.
          </p>
          <p className="success-detail">
            You can now explore PawPath or sign in to your dashboard to track your application status.
          </p>
          <div className="success-actions">
            <button className="primary" onClick={() => setPage('home')}>Return to home →</button>
            {!session?.user && <button className="outline" onClick={() => setPage('login')}>Sign in to your account</button>}
            {session?.user && <button className="outline" onClick={() => setPage('dashboard')}>Go to dashboard</button>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={isWorkspace ? "workspace-page form-page" : "page form-page"}>
      <p className="eyebrow">— ORGANISATION APPLICATION</p>
      <h2>Join the <em>network.</em></h2>
      <form onSubmit={submit}>
        <label>
          Organisation name
          <input required value={form.organization_name} onChange={e => setForm({ ...form, organization_name: e.target.value })} />
        </label>
        <label>
          Organisation type
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="hospital">Hospital / clinic</option>
            <option value="agency">Adoption agency</option>
          </select>
        </label>
        <label>
          Contact name
          <input required value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
        </label>
        <label>
          Contact email
          <input required type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
        </label>
        {!session?.user && (
          <label>
            Password (for your new account)
            <input required type="password" minLength="6" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </label>
        )}
        <label>
          Phone
          <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label>
          Address
          <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        </label>

        {error && (
          <p className="form-error">
            {error}
            {error.includes('sign in') && (
              <button type="button" className="link" style={{ marginLeft: '8px' }} onClick={() => setPage('login')}>
                Sign in →
              </button>
            )}
          </p>
        )}

        <button className="primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit application →'}
        </button>

        {!session?.user && (
          <button type="button" className="link switch" onClick={() => setPage('login')}>
            Already have an account? Sign in
          </button>
        )}
      </form>
    </section>
  );
}
