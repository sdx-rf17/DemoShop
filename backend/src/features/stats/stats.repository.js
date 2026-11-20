// Layer: repository (stats feature).
// Owns reading the numbers behind the overview: totals and sales by
// day. Pending orders are excluded from sales (they have not been
// paid), in MySQL and in memory alike. No Express, no formatting here.
const { isMySqlEnabled, query } = require('../../config/database');
const demoData = require('../../data/demoData');

const COMPLETED_STATUSES = ['paid', 'shipped', 'done'];

async function getOverviewData() {
  if (isMySqlEnabled()) {
    const [totals] = await query(
      'SELECT COUNT(*) AS totalOrders, COALESCE(SUM(CASE WHEN status IN (?, ?, ?) THEN total ELSE 0 END), 0) AS totalSales FROM orders',
      COMPLETED_STATUSES
    );
    const [productCount] = await query('SELECT COUNT(*) AS totalProducts FROM products');
    const [userCount] = await query('SELECT COUNT(*) AS totalUsers FROM users');
    const salesRows = await query(
      'SELECT DATE(date) AS date, SUM(total) AS sales FROM orders WHERE status IN (?, ?, ?) GROUP BY DATE(date) ORDER BY date',
      COMPLETED_STATUSES
    );
    return {
      totalSales: Number(totals.totalSales),
      totalOrders: Number(totals.totalOrders),
      totalProducts: Number(productCount.totalProducts),
      totalUsers: Number(userCount.totalUsers),
      salesByDay: salesRows.map((r) => ({
        date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10),
        sales: Number(r.sales),
      })),
    };
  }
  const completed = demoData.orders.filter((o) => COMPLETED_STATUSES.includes(o.status));
  const totalSales = completed.reduce((sum, o) => sum + Number(o.total), 0);
  const byDate = {};
  completed.forEach((o) => {
    byDate[o.date] = (byDate[o.date] || 0) + Number(o.total);
  });
  const salesByDay = Object.keys(byDate)
    .sort()
    .map((date) => ({ date, sales: Number(byDate[date].toFixed(2)) }));
  return {
    totalSales,
    totalOrders: demoData.orders.length,
    totalProducts: demoData.products.length,
    totalUsers: demoData.users.length,
    salesByDay,
  };
}

module.exports = { getOverviewData };
