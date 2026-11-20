// Layer: controller (auth feature).
// Owns HTTP only: read the request body, call the service, send the
// response. No business logic, no SQL, no password checking here.
const { asyncHandler } = require('../../common/http');
const authService = require('./auth.service');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const result = await authService.login(email, password);
  res.json(result);
});

module.exports = { login };
