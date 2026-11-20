// Layer: app — Express application wiring (no business logic).
// Owns creating the app, global middleware, mounting the feature
// routers under /api, the health route, and the 404 + error handler.
// Auth is applied here when mounting protected features; login stays public.
const express = require('express');
const cors = require('cors');
const { authenticate } = require('./middleware/auth');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes = require('./features/auth/auth.routes');
const productRoutes = require('./features/products/products.routes');
const orderRoutes = require('./features/orders/orders.routes');
const userRoutes = require('./features/users/users.routes');
const statsRoutes = require('./features/stats/stats.routes');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ ok: true, demo: true }));

  app.use('/api/auth', authRoutes); // public: POST /login
  app.use('/api/products', authenticate, productRoutes);
  app.use('/api/orders', authenticate, orderRoutes);
  app.use('/api/users', authenticate, userRoutes);
  app.use('/api/stats', authenticate, statsRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
