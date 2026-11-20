// Layer: repository (users feature).
// Owns all user data access. Never returns password_hash: MySQL
// selects only public columns, and the in-memory path strips the hash.
// No Express, no validation here.
const { isMySqlEnabled, query } = require('../../config/database');
const demoData = require('../../data/demoData');

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

async function findAll() {
  if (isMySqlEnabled()) {
    const rows = await query('SELECT id, name, email, role FROM users ORDER BY id');
    return rows.map(publicUser);
  }
  return demoData.users.map(publicUser);
}

async function findById(id) {
  if (isMySqlEnabled()) {
    const rows = await query('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? publicUser(rows[0]) : null;
  }
  const user = demoData.users.find((u) => u.id === id);
  return user ? publicUser(user) : null;
}

module.exports = { findAll, findById };
