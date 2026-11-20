// Layer: controller (stats feature).
// Owns HTTP only: call the service, send the response.
const { asyncHandler } = require('../../common/http');
const statsService = require('./stats.service');

const overview = asyncHandler(async (_req, res) => {
  res.json(await statsService.getOverview());
});

module.exports = { overview };
