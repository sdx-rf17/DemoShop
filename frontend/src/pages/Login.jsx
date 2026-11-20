import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setToken } from '../api.js';

export default function Login() {
  const [email, setEmail] = useState('admin@demo.shop');
  const [password, setPassword] = useState('Demo1234');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      setToken(data.token);
      localStorage.setItem('demoshop_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <h1>Demo Shop</h1>
        <p className="muted">Admin dashboard — demo project</p>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Log in</button>
        <p className="muted small">
          Demo login: admin@demo.shop / Demo1234
        </p>
      </form>
    </div>
  );
}
