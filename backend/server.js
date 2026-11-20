// Demo Shop backend — Node.js + Express + JWT + MySQL (with in-memory fallback).
// Demo project, not a real client order. Demo data only.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const store = require('./data');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

app.use(cors());
app.use(express.json());

// Public (no auth) helper
function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true, demo: true }));

// POST /api/auth/login — demo login: admin@demo.shop / Demo1234
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = store.users.find((u) => u.email === (email || '').toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const ok = await bcrypt.compare(password || '', user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, user: publicUser(user) });
});

// GET /api/products
app.get('/api/products', auth, (req, res) => res.json(store.products));

// POST /api/products
app.post('/api/products', auth, (req, res) => {
  const { name, price, stock, category } = req.body || {};
  if (!name || price === undefined) return res.status(400).json({ error: 'name and price are required' });
  const product = {
    id: Math.max(0, ...store.products.map((p) => p.id)) + 1,
    name,
    price: Number(price),
    stock: Number(stock || 0),
    category: category || 'General',
  };
  store.products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id
app.put('/api/products/:id', auth, (req, res) => {
  const product = store.products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const { name, price, stock, category } = req.body || {};
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (category !== undefined) product.category = category;
  res.json(product);
});

// DELETE /api/products/:id
app.delete('/api/products/:id', auth, (req, res) => {
  const idx = store.products.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  store.products.splice(idx, 1);
  res.json({ ok: true });
});

// GET /api/orders
app.get('/api/orders', auth, (req, res) => res.json(store.orders));

// PUT /api/orders/:id — update status (pending / paid / shipped / done)
app.put('/api/orders/:id', auth, (req, res) => {
  const order = store.orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const { status } = req.body || {};
  const allowed = ['pending', 'paid', 'shipped', 'done'];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({ error: 'status must be one of: ' + allowed.join(', ') });
  }
  if (status) order.status = status;
  res.json(order);
});

// GET /api/users
app.get('/api/users', auth, (req, res) => res.json(store.users.map(publicUser)));

// GET /api/stats/overview
app.get('/api/stats/overview', auth, (req, res) => {
  const completed = store.orders.filter((o) => ['paid', 'shipped', 'done'].includes(o.status));
  const totalSales = completed.reduce((sum, o) => sum + Number(o.total), 0);
  const byDate = {};
  store.orders.forEach((o) => {
    byDate[o.date] = (byDate[o.date] || 0) + Number(o.total);
  });
  const salesByDay = Object.keys(byDate)
    .sort()
    .map((date) => ({ date, sales: Number(byDate[date].toFixed(2)) }));
  res.json({
    totalSales: Number(totalSales.toFixed(2)),
    totalOrders: store.orders.length,
    totalProducts: store.products.length,
    totalUsers: store.users.length,
    salesByDay,
  });
});

initDb(store).then(() => {
  app.listen(PORT, () => {
    console.log('Demo Shop backend running on http://localhost:' + PORT);
    console.log('Demo login: admin@demo.shop / Demo1234');
  });
});
