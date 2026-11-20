// Layer: repository (auth feature).
// Owns finding a user by email. MySQL when enabled, in-memory demo
// data otherwise. No Express, no JWT, no password checking here.
const { isMySqlEnabled, query } = require('../../config/database');
const demoData = require('../../data/demoData');

async function findUserByEmail(email) {
  if (isMySqlEnabled()) {
    const rows = await query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }
  return demoData.users.find((u) => u.email === email) || null;
}

module.exports = { findUserByEmail };
