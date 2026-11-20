// MySQL connection (optional).
// If DB_* env vars are set and MySQL is reachable, demo data is loaded
// from the database into the in-memory store. If MySQL is missing,
// unreachable, or no .env is present, the server keeps the in-memory
// demo data from data.js and still works out of the box.
async function initDb(store) {
  if (!process.env.DB_HOST && !process.env.DB_NAME) {
    console.log('No MySQL config found — using in-memory demo data.');
    return { connected: false };
  }
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (e) {
    console.log('mysql2 not available — using in-memory demo data.');
    return { connected: false };
  }
  let pool;
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'demoshop',
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 3000,
    });
    const [userRows] = await pool.query(
      'SELECT id, name, email, role, password_hash FROM users ORDER BY id'
    );
    const [productRows] = await pool.query(
      'SELECT id, name, price, stock, category FROM products ORDER BY id'
    );
    const [orderRows] = await pool.query(
      'SELECT id, customer, total, status, date FROM orders ORDER BY id'
    );
    if (userRows.length && productRows.length && orderRows.length) {
      const [itemRows] = await pool.query(
        'SELECT order_id, product_id, qty, price FROM order_items ORDER BY order_id'
      );
      store.users.length = 0;
      store.users.push(...userRows);
      store.products.length = 0;
      store.products.push(...productRows.map((p) => ({ ...p, price: Number(p.price) })));
      store.orders.length = 0;
      store.orders.push(
        ...orderRows.map((o) => ({
          ...o,
          total: Number(o.total),
          date: o.date instanceof Date ? o.date.toISOString().slice(0, 10) : String(o.date).slice(0, 10),
          items: itemRows
            .filter((i) => i.order_id === o.id)
            .map((i) => ({ product_id: i.product_id, qty: i.qty, price: Number(i.price) })),
        }))
      );
      console.log('MySQL connected — demo data loaded from database.');
      return { connected: true, pool };
    }
    console.log('MySQL connected but tables are empty — using in-memory demo data. Run db/schema.sql to seed it.');
    return { connected: true, pool };
  } catch (err) {
    console.log('MySQL not reachable (' + err.message + ') — using in-memory demo data.');
    if (pool) { try { await pool.end(); } catch (_) {} }
    return { connected: false };
  }
}

module.exports = { initDb };
