// Layer: entry point — bootstrap only.
// Owns starting the server: create the app, initialise the database
// (MySQL if configured, in-memory demo data otherwise), then listen.
// No routes, no business logic, no SQL in this file.
const { env } = require('./config/env');
const { initDatabase } = require('./config/database');
const { createApp } = require('./app');

async function start() {
  await initDatabase();
  const app = createApp();
  app.listen(env.port, () => {
    console.log('Demo Shop backend running on http://localhost:' + env.port);
    console.log('Demo login: admin@demo.shop / Demo1234');
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
