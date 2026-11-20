import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { setToken } from '../api.js';

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
  { to: '/users', label: 'Users' },
  { to: '/settings', label: 'Settings' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('demoshop_user') || 'null');

  function logout() {
    setToken(null);
    localStorage.removeItem('demoshop_user');
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="brand">Demo Shop</div>
        <div className="brand-sub">Admin Dashboard</div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div>{user ? user.name : 'Demo user'}</div>
          <div className="muted">{user ? user.email : ''}</div>
          <button onClick={logout}>Log out</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
            ☰
          </button>
          <strong>Demo Shop</strong>
          <span className="muted">Demo project — demo data only</span>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
