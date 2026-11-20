// Layer: config — environment variables.
// Owns reading and parsing process.env (after dotenv is loaded in
// server.js) and exposing one typed object. No other file reads
// process.env directly, so defaults live in exactly one place.
require('dotenv').config();

const env = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  // MySQL is optional. When DB_HOST and DB_NAME are both absent the
  // backend runs on in-memory demo data instead (see config/database.js).
  db: {
    host: process.env.DB_HOST || '',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
  },
};

env.dbConfigured = Boolean(env.db.host && env.db.database);

module.exports = { env };
