import React, { useState } from 'react';
import { firebaseEnabled } from '../firebase';
import { login, registerCommunity } from '../services';
import ParticleBackground from '../components/ParticleBackground';

export default function Login({ setPage }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError('');
    try {
      mode === 'login' ? await login(form) : await registerCommunity(form);
      setPage('dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <>
      <ParticleBackground mode="login" colorScheme="warm" particleCount={60} />

      <section className="login-page">
        <form onSubmit={submit}>
          <p className="eyebrow"><span className="eyebrow-spark">✦</span> SECURE PORTAL</p>
          <h2>{mode === 'login' ? 'Welcome back.' : 'Join PawPath.'}</h2>
          <p>
            {mode === 'login'
              ? 'Sign in to access your role-specific workspace.'
              : 'Join the community to report dogs and track care.'}
          </p>

          {mode === 'register' && (
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength="6"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary btn-magnetic">
            {mode === 'login' ? 'Sign in →' : 'Create community account →'}
          </button>

          <button
            type="button"
            className="link switch"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
          </button>

          {!firebaseEnabled && <small>Firebase configuration is missing.</small>}
        </form>
      </section>
    </>
  );
}