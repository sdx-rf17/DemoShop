// Layer: service (orders feature).
// Owns order business rules: only pending / paid / shipped / done are
// valid statuses, and an unknown order is a 404. Knows nothing
// about HTTP or SQL.
const { ApiError } = require('../../common/errors');
const ordersRepository = require('./orders.repository');

const ALLOWED_STATUSES = ['pending', 'paid', 'shipped', 'done'];

async function listOrders() {
  return ordersRepository.findAll();
}

async function getOrder(id) {
  const order = await ordersRepository.findById(id);
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

async function updateOrderStatus(id, body) {
  const { status } = body || {};
  if (status && !ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(400, 'status must be one of: ' + ALLOWED_STATUSES.join(', '));
  }
  if (!status) {
    // No status given: return the order unchanged (same as before).
    return getOrder(id);
  }
  const updated = await ordersRepository.updateStatus(id, status);
  if (!updated) throw new ApiError(404, 'Order not found');
  return updated;
}

module.exports = { listOrders, getOrder, updateOrderStatus, ALLOWED_STATUSES };
