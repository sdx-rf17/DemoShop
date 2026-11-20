import { useEffect, useState } from 'react';
import { getOrders, updateOrder } from '../api.js';

const statuses = ['pending', 'paid', 'shipped', 'done'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  function load() {
    getOrders().then(setOrders).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function change(id, status) {
    await updateOrder(id, status);
    load();
  }

  return (
    <div>
      <h1>Orders</h1>
      <p className="muted">View orders and change their status. Demo data only.</p>
      {error && <p className="error">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.date}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td>
                  <select value={o.status} onChange={(e) => change(o.id, e.target.value)}>
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
