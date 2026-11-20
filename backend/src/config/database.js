// Layer: config — MySQL connection.
// Owns the mysql2/promise pool and the single question every repository
// asks: isMySqlEnabled()? When no DB config exists, or MySQL cannot be
// reached, the pool stays null and repositories use in-memory demo data.
// No SQL lives here — SQL lives only in repositories.
const mysql = require('mysql2/promise');
const { env } = require('./env');

let pool = null;
let mysqlEnabled = false;

async function initDatabase() {
  if (!env.dbConfigured) {
    console.log('No MySQL config found — using in-memory demo data.');
    return { connected: false };
  }
  try {
    pool = mysql.createPool({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 3000,
    });
    await pool.query('SELECT 1');
    mysqlEnabled = true;
    console.log('MySQL connected — demo data loaded from database.');
    return { connected: true };
  } catch (err) {
    console.log('MySQL not reachable (' + err.message + ') — using in-memory demo data.');
    mysqlEnabled = false;
    if (pool) {
      try { await pool.end(); } catch (_) { /* already down */ }
      pool = null;
    }
    return { connected: false };
  }
}

function isMySqlEnabled() {
  return mysqlEnabled && pool !== null;
}

async function query(sql, params = []) {
  if (!isMySqlEnabled()) throw new Error('MySQL is not enabled');
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = { initDatabase, isMySqlEnabled, query };
