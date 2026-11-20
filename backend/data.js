// Demo data only — no real customers, no fake clients, no testimonials.
// The same data is used for the MySQL seed (db/schema.sql) and for the
// in-memory fallback when MySQL is not available.
const bcrypt = require('bcryptjs');

// All demo users share the demo password "Demo1234" (hashed at startup).
// The admin login is admin@demo.shop / Demo1234.
const passwordHash = bcrypt.hashSync('Demo1234', 10);

const users = [
  { id: 1, name: 'Admin User', email: 'admin@demo.shop', role: 'admin', password_hash: passwordHash },
  { id: 2, name: 'Maria Manager', email: 'maria@demo.shop', role: 'manager', password_hash: passwordHash },
  { id: 3, name: 'Omar Staff', email: 'omar@demo.shop', role: 'staff', password_hash: passwordHash },
  { id: 4, name: 'Lina Customer', email: 'lina@demo.shop', role: 'customer', password_hash: passwordHash },
];

const products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, stock: 42, category: 'Electronics' },
  { id: 2, name: 'Smart Watch', price: 129.99, stock: 25, category: 'Electronics' },
  { id: 3, name: 'Laptop Stand', price: 34.99, stock: 60, category: 'Accessories' },
  { id: 4, name: 'USB-C Hub', price: 49.99, stock: 80, category: 'Accessories' },
  { id: 5, name: 'Mechanical Keyboard', price: 89.99, stock: 30, category: 'Electronics' },
  { id: 6, name: 'Wireless Mouse', price: 29.99, stock: 95, category: 'Accessories' },
  { id: 7, name: 'Travel Backpack', price: 59.99, stock: 18, category: 'Accessories' },
  { id: 8, name: 'Desk Lamp', price: 24.99, stock: 55, category: 'Home Office' },
];

const orders = [
  { id: 1, customer: 'Lina Customer', total: 109.98, status: 'paid', date: '2026-11-14', items: [{ product_id: 1, qty: 1, price: 79.99 }, { product_id: 6, qty: 1, price: 29.99 }] },
  { id: 2, customer: 'Lina Customer', total: 129.99, status: 'shipped', date: '2026-11-13', items: [{ product_id: 2, qty: 1, price: 129.99 }] },
  { id: 3, customer: 'Omar Staff', total: 84.98, status: 'done', date: '2026-11-12', items: [{ product_id: 3, qty: 1, price: 34.99 }, { product_id: 4, qty: 1, price: 49.99 }] },
  { id: 4, customer: 'Maria Manager', total: 179.98, status: 'done', date: '2026-11-11', items: [{ product_id: 5, qty: 2, price: 89.99 }] },
  { id: 5, customer: 'Lina Customer', total: 59.99, status: 'pending', date: '2026-11-15', items: [{ product_id: 7, qty: 1, price: 59.99 }] },
  { id: 6, customer: 'Omar Staff', total: 49.99, status: 'paid', date: '2026-11-15', items: [{ product_id: 4, qty: 1, price: 49.99 }] },
  { id: 7, customer: 'Maria Manager', total: 154.97, status: 'shipped', date: '2026-11-10', items: [{ product_id: 1, qty: 1, price: 79.99 }, { product_id: 3, qty: 1, price: 34.99 }, { product_id: 8, qty: 1, price: 24.99 }] },
  { id: 8, customer: 'Lina Customer', total: 24.99, status: 'done', date: '2026-11-09', items: [{ product_id: 8, qty: 1, price: 24.99 }] },
  { id: 9, customer: 'Omar Staff', total: 219.97, status: 'pending', date: '2026-11-16', items: [{ product_id: 2, qty: 1, price: 129.99 }, { product_id: 5, qty: 1, price: 89.99 }] },
  { id: 10, customer: 'Maria Manager', total: 89.98, status: 'paid', date: '2026-11-16', items: [{ product_id: 6, qty: 2, price: 29.99 }, { product_id: 6, qty: 1, price: 29.99 }] },
];

module.exports = { users, products, orders };
