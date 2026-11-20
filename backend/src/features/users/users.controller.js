// Layer: controller (users feature).
// Owns HTTP only: read params, call the service, send the response.
const { asyncHandler } = require('../../common/http');
const { parseId } = require('../../middleware/validate');
const usersService = require('./users.service');

const list = asyncHandler(async (_req, res) => {
  res.json(await usersService.listUsers());
});

const get = asyncHandler(async (req, res) => {
  res.json(await usersService.getUser(parseId(req.params.id)));
});

module.exports = { list, get };
