// Layer: repository (orders feature).
// Owns all order data access, including order items. MySQL when
// enabled, in-memory demo data otherwise. No Express, no validation here.
const { isMySqlEnabled, query } = require('../../config/database');
const demoData = require('../../data/demoData');

function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toOrder(row, items) {
  return {
    id: row.id,
    customer: row.customer,
    total: Number(row.total),
    status: row.status,
    date: formatDate(row.date),
    items: items.map((i) => ({ product_id: i.product_id, qty: i.qty, price: Number(i.price) })),
  };
}

async function findAll() {
  if (isMySqlEnabled()) {
    const rows = await query('SELECT id, customer, total, status, date FROM orders ORDER BY id');
    const items = await query('SELECT order_id, product_id, qty, price FROM order_items ORDER BY order_id');
    return rows.map((r) => toOrder(r, items.filter((i) => i.order_id === r.id)));
  }
  return demoData.orders.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) }));
}

async function findById(id) {
  const all = await findAll();
  return all.find((o) => o.id === id) || null;
}

async function updateStatus(id, status) {
  if (isMySqlEnabled()) {
    const result = await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) return null;
    return findById(id);
  }
  const order = demoData.orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  return { ...order, items: order.items.map((i) => ({ ...i })) };
}

module.exports = { findAll, findById, updateStatus };
