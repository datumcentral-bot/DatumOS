'use client';

import { createAuthClient } from "@/lib/auth/client";
import { useState } from 'react';

export const authClient = createAuthClient();

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error: err } = await authClient.signUp.email({
        email,
        password,
        name: name || undefined,
      });
      if (err) {
        setError(err.message || 'Sign up failed');
      } else if (data?.user) {
        setSuccess(`Account created for ${data.user.email}`);
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Neon Auth — Email Signup</h1>
      <form onSubmit={handleSignUp}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: loading ? '#ccc' : '#000', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Creating…' : 'Create Account'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        <a href="/auth/sign-in" style={{ color: '#000' }}>Already have an account? Sign in</a>
      </p>
    </div>
  );
}
