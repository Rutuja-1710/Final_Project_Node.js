import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { errorMessage } from '../api.js';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'technician' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>{mode === 'login' ? 'Sign in' : 'Create an account'}</h1>
      <p className="muted">Log maintenance work and see which machines are due for service.</p>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <>
            <label>Name<input value={form.name} onChange={set('name')} required /></label>
            <label>Role
              <select value={form.role} onChange={set('role')}>
                <option value="technician">Technician</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </label>
          </>
        )}
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Password<input type="password" minLength={6} value={form.password} onChange={set('password')} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
        {mode === 'login' ? 'New here? Create an account' : 'Have an account? Sign in'}
      </button>
    </div>
  );
}
