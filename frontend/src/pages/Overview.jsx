import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStats } from '../api.js';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Loading…</p>;

  return (
    <div>
      <h1>Overview</h1>
      <p className="muted">Sales at a glance — demo data only.</p>
      <div className="cards">
        <div className="card stat">
          <div className="muted">Total sales</div>
          <div className="big">${stats.totalSales.toFixed(2)}</div>
        </div>
        <div className="card stat">
          <div className="muted">Orders</div>
          <div className="big">{stats.totalOrders}</div>
        </div>
        <div className="card stat">
          <div className="muted">Products</div>
          <div className="big">{stats.totalProducts}</div>
        </div>
        <div className="card stat">
          <div className="muted">Users</div>
          <div className="big">{stats.totalUsers}</div>
        </div>
      </div>
      <div className="card">
        <h2>Sales by day</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={stats.salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#0f766e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
