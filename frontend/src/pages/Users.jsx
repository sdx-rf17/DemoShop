import { useEffect, useState } from 'react';
import { getUsers } from '../api.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers().then(setUsers).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <p className="muted">Demo users only — no real customer data.</p>
      {error && <p className="error">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
