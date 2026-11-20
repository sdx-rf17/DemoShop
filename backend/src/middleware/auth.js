// Layer: middleware — JWT authentication.
// Owns verifying the Bearer token and putting the logged-in user on
// req.user. Rejects missing/invalid tokens with 401. Knows nothing
// about products, orders or users.
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { ApiError } = require('../common/errors');

function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, 'Missing token'));
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (_err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = { authenticate };
