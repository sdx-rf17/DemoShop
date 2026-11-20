// Layer: service (stats feature).
// Owns formatting the overview numbers: totals rounded to 2 decimals.
// Knows nothing about HTTP or SQL.
const statsRepository = require('./stats.repository');

async function getOverview() {
  const data = await statsRepository.getOverviewData();
  return {
    totalSales: Number(data.totalSales.toFixed(2)),
    totalOrders: data.totalOrders,
    totalProducts: data.totalProducts,
    totalUsers: data.totalUsers,
    salesByDay: data.salesByDay.map((d) => ({ date: d.date, sales: Number(d.sales.toFixed(2)) })),
  };
}

module.exports = { getOverview };
