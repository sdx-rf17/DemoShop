// Layer: controller (orders feature).
// Owns HTTP only: read params/body, call the service, send the response.
const { asyncHandler } = require('../../common/http');
const { parseId } = require('../../middleware/validate');
const ordersService = require('./orders.service');

const list = asyncHandler(async (_req, res) => {
  res.json(await ordersService.listOrders());
});

const get = asyncHandler(async (req, res) => {
  res.json(await ordersService.getOrder(parseId(req.params.id)));
});

const update = asyncHandler(async (req, res) => {
  res.json(await ordersService.updateOrderStatus(parseId(req.params.id), req.body));
});

module.exports = { list, get, update };
