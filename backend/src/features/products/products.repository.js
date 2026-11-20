// Layer: repository (products feature).
// Owns all product data access. MySQL when enabled, in-memory demo
// data otherwise. No Express req/res, no validation, no HTTP here.
const { isMySqlEnabled, query } = require('../../config/database');
const demoData = require('../../data/demoData');

function toProduct(row) {
  return { id: row.id, name: row.name, price: Number(row.price), stock: Number(row.stock), category: row.category };
}

async function findAll() {
  if (isMySqlEnabled()) {
    const rows = await query('SELECT id, name, price, stock, category FROM products ORDER BY id');
    return rows.map(toProduct);
  }
  return demoData.products.map((p) => ({ ...p }));
}

async function findById(id) {
  if (isMySqlEnabled()) {
    const rows = await query('SELECT id, name, price, stock, category FROM products WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toProduct(rows[0]) : null;
  }
  const product = demoData.products.find((p) => p.id === id);
  return product ? { ...product } : null;
}

async function create(input) {
  if (isMySqlEnabled()) {
    const result = await query(
      'INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)',
      [input.name, input.price, input.stock, input.category]
    );
    return findById(result.insertId);
  }
  const id = Math.max(0, ...demoData.products.map((p) => p.id)) + 1;
  const product = { id, ...input };
  demoData.products.push(product);
  return { ...product };
}

async function update(id, changes) {
  if (isMySqlEnabled()) {
    const existing = await findById(id);
    if (!existing) return null;
    const next = { ...existing, ...changes };
    await query(
      'UPDATE products SET name = ?, price = ?, stock = ?, category = ? WHERE id = ?',
      [next.name, next.price, next.stock, next.category, id]
    );
    return findById(id);
  }
  const product = demoData.products.find((p) => p.id === id);
  if (!product) return null;
  Object.assign(product, changes);
  return { ...product };
}

async function remove(id) {
  if (isMySqlEnabled()) {
    const result = await query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  const index = demoData.products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  demoData.products.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
